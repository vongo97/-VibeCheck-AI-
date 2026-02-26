import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { scrapeLinkedInProfile } from './extractor.js';
import { analyzeProfile, generateViralPost, analyzeVoice, generateIdentitySummary } from './gemini.js';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido o expirado" });
    req.user = user;
    next();
  });
};

// Endpoint de autenticación con Google
app.post('/api/auth/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Verificar si el usuario ya existe
    let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);

    if (userResult.rows.length === 0) {
      // Crear usuario si no existe
      userResult = await pool.query(
        'INSERT INTO users (google_id, email, full_name, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *',
        [googleId, email, name, picture]
      );
    }

    const user = userResult.rows[0];

    // Generar JWT
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user, accessToken });
  } catch (error) {
    console.error("Error en auth de Google:", error);
    res.status(401).json({ error: "Fallo en la autenticación de Google" });
  }
});

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

app.post('/api/generate-identity', authenticateToken, async (req, res) => {
  const { profileData, questionnaire, url } = req.body;
  const userId = req.user.id;
  
  try {
    const identitySummary = await generateIdentitySummary(profileData, questionnaire, req.body.llmConfig || {});
    
    // Guardar o actualizar en Neon
    await pool.query(
      `INSERT INTO users (id, linkedin_url, profile_summary, identity_summary, questionnaire_data)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) 
       DO UPDATE SET 
         linkedin_url = EXCLUDED.linkedin_url,
         profile_summary = EXCLUDED.profile_summary,
         identity_summary = EXCLUDED.identity_summary,
         questionnaire_data = EXCLUDED.questionnaire_data,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, url || 'manual', profileData, identitySummary, JSON.stringify(questionnaire)]
    );

    res.json({ identitySummary });
  } catch (error) {
    console.error("Error en generate-identity:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-voice', authenticateToken, async (req, res) => {
  const { samples } = req.body;
  if (!samples) return res.status(400).json({ error: "Muestras requeridas" });

  try {
    const voiceDNA = await analyzeVoice(samples, req.body.llmConfig || {});
    res.json({ voiceDNA });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-post', authenticateToken, async (req, res) => {
  const { topic, context, url } = req.body;
  const userId = req.user.id;
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
          [userId, topic, post, context]
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
