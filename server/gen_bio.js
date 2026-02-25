import { analyzeProfile } from './gemini.js';

const profileData = `
Identidad: Experto en automatización agéntica de élite.
Stack: n8n, Make, Python, PostgreSQL (Neon), Docker.
Foco: ROI financiero, 95% reducción de errores, soberanía de datos.
Estilo: Directo, técnico, proactivo, sin rodeos.
Contexto 2026: Multi-Agent Swarms y gobernanza como código.
`;

const prompt = `
Como el mejor experto en Personal Branding de LinkedIn del mundo para 2026:
Genera una sección "Acerca de" (About) que detenga el scroll.
- Usa párrafos cortos y mucho espacio en blanco.
- Tono: Directo, técnico pero con autoridad humana.
- Estructura: 
  1. Gancho disruptivo.
  2. El Problema (Fricción manual).
  3. La Solución (Arquitectura agéntica).
  4. Stack y Credenciales (n8n, Python, 95% ahorro).
  5. El Futuro (Gobernanza).
  6. CTA claro.
`;

async function run() {
  try {
    const bio = await analyzeProfile(profileData + '\n' + prompt);
    console.log('\n--- BIOGRAFÍA GENERADA ---\n');
    console.log(bio);
    console.log('\n--------------------------\n');
  } catch (error) {
    console.error("Error generating bio:", error);
  }
}

run();
