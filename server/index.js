import express from 'express';
import cors from 'cors';
import { scrapeLinkedInProfile } from './extractor.js';
import { analyzeProfile, generateViralPost, analyzeVoice, generateIdentitySummary } from './gemini.js';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Permitir textos largos para muestras de voz

app.post('/api/analyze-link', async (req, res) => {
  const { url, rawText } = req.body;
  
  try {
    let dataToAnalyze = rawText;
    let rawData = { name: "Manual", about: "Manual" };

    if (url && !rawText) {
      rawData = await scrapeLinkedInProfile(url);
      if (!rawData.raw || rawData.raw.includes('authwall') || rawData.raw.length < 500) {
        return res.status(403).json({ 
          error: "LinkedIn bloqueó el acceso automático. Por favor, pega el texto de tu perfil manualmente.",
          isAuthwall: true 
        });
      }
      dataToAnalyze = rawData.raw;
    }

    const analysis = await analyzeProfile(dataToAnalyze, req.body.llmConfig || {});
    res.json({ rawData, analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-identity', async (req, res) => {
  const { profileData, questionnaire, url } = req.body;
  
  try {
    const identitySummary = await generateIdentitySummary(profileData, questionnaire, req.body.llmConfig || {});
    
    // Guardar o actualizar en Neon
    await pool.query(
      `INSERT INTO users (linkedin_url, profile_summary, identity_summary, questionnaire_data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (linkedin_url) 
       DO UPDATE SET 
         profile_summary = EXCLUDED.profile_summary,
         identity_summary = EXCLUDED.identity_summary,
         questionnaire_data = EXCLUDED.questionnaire_data,
         updated_at = CURRENT_TIMESTAMP`,
      [url || 'manual', profileData, identitySummary, JSON.stringify(questionnaire)]
    );

    res.json({ identitySummary });
  } catch (error) {
    console.error("Error en generate-identity:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-voice', async (req, res) => {
  const { samples } = req.body;
  if (!samples) return res.status(400).json({ error: "Muestras requeridas" });

  try {
    const voiceDNA = await analyzeVoice(samples, req.body.llmConfig || {});
    res.json({ voiceDNA });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-post', async (req, res) => {
  const { topic, context, url } = req.body;
  if (!topic || !context) return res.status(400).json({ error: "Tema y contexto requeridos" });

  try {
    const post = await generateViralPost(topic, context, req.body.llmConfig || {});
    
    // Guardar post en el historial si tenemos una URL de referencia
    if (url) {
      console.log(`Intentando guardar post para URL: ${url}`);
      const userRes = await pool.query('SELECT id FROM users WHERE linkedin_url = $1', [url]);
      console.log(`Usuario encontrado: ${userRes.rows.length > 0 ? userRes.rows[0].id : 'Ninguno'}`);
      if (userRes.rows.length > 0) {
        await pool.query(
          'INSERT INTO posts (user_id, topic, content, strategy_used) VALUES ($1, $2, $3, $4)',
          [userRes.rows[0].id, topic, post, context]
        );
        console.log("Post guardado exitosamente en Neon.");
      }
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor LinkedIn Guru v2 operando en http://localhost:${PORT}`);
});
