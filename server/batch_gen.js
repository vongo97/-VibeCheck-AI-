import { generateViralPost } from './gemini.js';

const topics = [
  'Por qué Python es el cerebro de tu pila de automatización',
  'Gobernanza como Código',
  'Terminar con la Fábrica de Papel',
  'Scraping basado en visión',
  'El modelo de supervisor humano',
  'El modelo operativo agéntico',
  'La transformación de 30 días'
];

const strategy = 'Estilo conversacional directo, proactivo, técnico pero cercano. Usa términos como psql, arquitectura, ROI y ahorro. Evita rodeos.';

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log('--- INICIO GENERACIÓN LOTE FINAL (Con protección 429) ---');
  for (const topic of topics) {
    let success = false;
    let retries = 0;
    
    while (!success && retries < 3) {
      try {
        console.log(`Generando: ${topic} (Intento ${retries + 1})...`);
        const post = await generateViralPost(topic, strategy);
        console.log(`\n--- POST: ${topic} ---\n`);
        console.log(post);
        console.log('\n------------------------\n');
        success = true;
        await delay(5000); // Esperar 5 segundos entre posts con éxito
      } catch (error) {
        if (error.status === 429) {
          console.log("Limite de tasa alcanzado. Esperando 15 segundos...");
          await delay(15000);
          retries++;
        } else {
          console.error(`Error grave en topic "${topic}":`, error);
          break;
        }
      }
    }
  }
  console.log('--- FIN GENERACIÓN ---');
}

run();
