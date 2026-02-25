import dotenv from "dotenv";
import { getRandomStructure } from './structures.js';
import { callLLM } from './llmProvider.js';

dotenv.config();

/**
 * Genera contenido utilizando Gemini 2.5 Flash con Ingeniería de Viralidad y Estructuras
 */
export async function generateViralPost(topic, strategy, config = {}) {
  const { provider = 'google', model = 'gemini-1.5-flash', apiKey } = config;
  
  try {
    const selectedStructure = getRandomStructure();
    
    const prompt = `Actúa como un Ghostwriter de élite para LinkedIn (Top 1% Mundial). RESPONDE SIEMPRE EN ESPAÑOL. Genera un post sobre "${topic}" siguiendo esta ESTRUCTURA VIRAL DE BENCHMARKING:
    
    ESTRUCTURA SELECCIONADA: ${selectedStructure.name}
    ---
    ${selectedStructure.structure}
    ---
    
    REGLAS DE ORO DEL ALGORITMO 2026 (MÁXIMA PRIORIDAD):
    1. **GANCHO MAESTRO (CRÍTICO)**: La primera línea DEBE tener menos de 50 caracteres. Debe ser una declaración fuerte, un contrapunto o un resultado impactante.
    2. **RE-GANCHO ESTRATÉGICO**: La segunda línea debe ser un paréntesis o una frase corta que obligue al usuario a hacer clic en "Ver más".
    3. **ESTILO VISUAL**: Usa emojis (🔹, ✅, 🚀, 👇) para listas y puntos clave para mejorar la escaneabilidad.
    4. **DWELL TIME**: Párrafos de máximo 2 líneas. Espacios en blanco generosos.
    5. **VOZ Y ADN**: Usa este estilo estratégico del autor:
    ${strategy}
    
    IMPORTANTE: No uses más de 3 hashtags. Céntrate en la autoridad y la curiosidad.`;
    
    return await callLLM({ provider, model, apiKey, prompt });
  } catch (error) {
    console.error("Error en generación viral:", error);
    throw error;
  }
}

/**
 * Analiza el perfil detalladamente usando Gemini 3.1 Pro (Estrategia 2026)
 */
export async function analyzeProfile(profileData, config = {}) {
  const { provider = 'google', model = 'gemini-2.5-flash', apiKey } = config;

  try {
    const prompt = `Actúa como el mejor estratega de contenido de LinkedIn del mundo. RESPONDE SIEMPRE EN ESPAÑOL. Analiza este perfil y genera un PLAN ESTRATÉGICO DE ALTO IMPACTO:
    
    1. **Identidad de Marca**: Define su tono de voz único y su propuesta de valor.
    2. **Momentos de Autoridad**: Extrae 3-5 logros, hitos o anécdotas específicas de su experiencia que demuestren autoridad real.
    3. **Pilares de Contenido**: Propón 4 pilares temáticos específicos basados en su experiencia.
    4. **Análisis de Tendencias 2026**: Relaciona su perfil con lo que es viral hoy en LinkedIn (Storytelling, Building in Public, IA, etc.).
    5. **Ganchos Personalizados**: Escribe 3 ejemplos de "Hooks" que detengan el scroll basados en sus logros.

    Perfil a analizar:
    ${profileData}`;

    return await callLLM({ provider, model, apiKey, prompt });
  } catch (error) {
    console.error("Error al analizar el perfil:", error);
    throw error;
  }
}

/**
 * Genera la síntesis de identidad "ESTO ES LO QUE APRENDIMOS SOBRE TI"
 */
export async function generateIdentitySummary(profileData, questionnaireAnswers, config = {}) {
  const { provider = 'google', model = 'gemini-2.5-flash', apiKey } = config;

  try {
    const prompt = `Actúa como un psicólogo de marca y estratega de contenido. RESPONDE SIEMPRE EN ESPAÑOL.
    Basado en este perfil:
    ${profileData}
    
    Y en estas respuestas de metas/retos:
    ${JSON.stringify(questionnaireAnswers)}
    
    Genera una síntesis de identidad con este formato EXACTO (usa negritas y puntos):
    
    ESTO ES LO QUE APRENDIMOS SOBRE TI:
    
    [Resumen de 1-2 frases sobre a qué ayudas y a quién]
    
    **Tu voz es la de un** [Definición de voz, ej: experto pragmático, mentor inspirador].
    
    **Tienes la misión de** [Definición de su objetivo a largo plazo].
    
    **Tú crees o defiendes:**
    * [Creencia 1]
    * [Creencia 2]
    * [Creencia 3]
    
    **TEMAS QUE SON TU EJE (Pilares):**
    * [Pilar 1]
    * [Pilar 2]
    * [Pilar 3]
    * [Pilar 4]
    
    IMPORTANTE: Sé muy humano y preciso. No uses lenguaje genérico.`;

    return await callLLM({ provider, model, apiKey, prompt });
  } catch (error) {
    console.error("Error al generar identidad:", error);
    throw error;
  }
}

/**
 * Analiza muestras de escritura para Entrenamiento de Voz (Módulo 3A)
 */
export async function analyzeVoice(sampleText, config = {}) {
  const { provider = 'google', model = 'gemini-2.5-flash', apiKey } = config;

  try {
    const prompt = `Analiza estas muestras de escritura para identificar el ADN de la voz del autor. RESPONDE SIEMPRE EN ESPAÑOL:
    - ¿Usa oraciones cortas o largas?
    - ¿Qué palabras repetitivas o jerga utiliza?
    - ¿Su tono es Agresivo, Empático, Inspiracional o Analítico?
    - Propón un "Prompt de Estilo" que pueda usar para imitarlo perfectamente.

    Muestras:
    ${sampleText}`;

    return await callLLM({ provider, model, apiKey, prompt });
  } catch (error) {
    console.error("Error en análisis de voz:", error);
    throw error;
  }
}
