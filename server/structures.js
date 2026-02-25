/**
 * Librería de Estructuras de Contenido Viral (Inspirado en Benchmarking 2026)
 */
export const viralStructures = [
  {
    name: "La Lista de Autoridad",
    structure: `[Gancho de Autoridad < 49 chars]
    [Re-gancho de 51 chars para inducir clic]
    
    He probado [X] herramientas/métodos para [Resultado].
    Aquí los 5 que realmente funcionan:
    
    1. [Herramienta 1]: Por qué importa.
    2. [Herramienta 2]: El beneficio clave.
    3. [Herramienta 3]: Lo que nadie te dice.
    
    Tu opinión importa: ¿Cuál añadirías?`
  },
  {
    name: "Contrarian (El Mito)",
    structure: `[Gancho Disruptivo < 49 chars]
    [Re-gancho de 51 chars para inducir clic]
    
    Todo el mundo dice que [Mito común].
    Pero la realidad es que [Verdad disruptiva].
    
    Aquí 3 razones basadas en mi experiencia:
    - Razón A: El dato que ignoran.
    - Razón B: El error que cometen.
    - Razón C: La solución real.
    
    ¿Estás de acuerdo o crees que estoy loco?`
  },
  {
    name: "El Antes y Después (Transformación)",
    structure: `[Gancho de Dolor < 49 chars]
    [Re-gancho de 51 chars para inducir clic]
    
    Hace [Tiempo], mi situación era [Situación A].
    Hoy, después de aplicar [Estrategia], es [Situación B].
    
    Lo que aprendí en el camino:
    1. [Lección 1]
    2. [Lección 2]
    
    Comparte tu proceso: ¿En qué fase estás tú?`
  },
  {
    name: "Storytelling de Aprendizaje",
    structure: `[Gancho de Curiosidad < 49 chars]
    [Re-gancho de 51 chars para inducir clic]
    
    Estaba en medio de [Escena/Contexto] cuando me di cuenta de algo.
    [El 'Aha moment'].
    
    Esto cambió cómo veo [Nicho].
    Not se trata de [X], se trata de [Y].
    
    ¿Te ha pasado algo similar esta semana?`
  },
  {
    name: "The 1-2-3-4 Punch (Eficiencia)",
    structure: `[Gancho de Ahorro/Tiempo < 49 chars]
    [Re-gancho de 51 chars para inducir clic]

    El problema: [Dolor actual].
    La solución: [Tu propuesta de automatización/IA].

    Cómo funciona en 4 pasos:
    1. [Paso 1: Fácil]
    2. [Paso 2: Rápido]
    3. [Paso 3: Escalable]
    4. [Paso 4: Rentable]

    Resultado: [Promesa final].

    ¿Lo aplicarías en tu equipo o prefieres lo manual?`
  },
  {
    name: "The Contrarian Stack (Guerra de Herramientas)",
    structure: `[Gancho Disruptivo < 49 chars]
    [Re-gancho de 51 chars para inducir clic]

    Make es genial para [Uso A].
    Zapier es bueno para [Uso B].
    Pero n8n es el Rey por [Razón clave].

    Aquí 3 motivos por los que cambié mi arquitectura:
    - [Motivo 1: Costo/Ejecución]
    - [Motivo 2: Soberanía de datos]
    - [Motivo 3: Flexibilidad Python]

    ¿Eres del equipo 'Nube' o 'Auto-hospedado'?`
  },
  {
    name: "The Transformation Secret (Antes/Después Técnico)",
    structure: `[Gancho de Resultado Masivo < 49 chars]
    [Re-gancho de 51 chars para inducir clic]

    Pasamos de [Problema manual] a [Sistema automático].
    Sin [Error común] y en tiempo récord.

    El secreto no fue la herramienta, sino [Estrategia/Lógica].
    3 aprendizajes clave del despliegue:
    - [Aprendizaje 1]
    - [Aprendizaje 2]
    - [Aprendizaje 3]

    ¿Cuál es tu mayor cuello de botella hoy?`
  },
  {
    name: "The ROI Breakdown (Análisis Financiero)",
    structure: `[Gancho de Ahorro $$$ < 49 chars]
    [Re-gancho de 51 chars para inducir clic]

    Muchos ven la automatización como un gasto. Yo lo veo como [Concepto ROI].
    Aquí los números reales detrás de [Proyecto/Tema]:
    - Reducción de costos: [X]%
    - Error humano: [0 o bajo]%
    - Horas liberadas: [Y] horas

    Al final, no automatizar es lo más caro.

    ¿Prefieres optimizar el presupuesto o seguir con la 'Fábrica de Papel'?`
  },
  {
    name: "The 30-Day Roadmap (Guía Paso a Paso)",
    structure: `[Gancho de Transformación 30 días < 49 chars]
    [Re-gancho de 51 chars para inducir clic]

    Nadie escala de la noche a la mañana. 
    Se necesita una hoja de ruta clara para pasar del caos a la automatización:

    Semana 1: [Hito 1]
    Semana 2: [Hito 2]
    Semana 3: [Hito 3]
    Semana 4: [Hito 4]

    El ingrediente secreto: [Python/n8n/Gobernanza].

    ¿Estás listo para el Día 1 o vas a esperar al próximo mes?`
  },
  {
    name: "The Urgent Warning (El Riesgo de Ignorar)",
    structure: `[Gancho de Miedo/Alerta < 49 chars]
    [Re-gancho de 51 chars para inducir clic]

    El mundo está cambiando a una velocidad exponencial.
    Ignorar [Tecnología/Tendencia] no es ser prudente, es quedar obsoleto.

    3 peligros de no actuar hoy:
    1. [Peligro 1: Financiero]
    2. [Peligro 2: Competitivo]
    3. [Peligro 3: Escalabilidad]

    La ventana de oportunidad se está cerrando.

    ¿Te vas a adaptar o vas a ser otro caso de estudio de obsolescencia?`
  }
];

export function getRandomStructure() {
  return viralStructures[Math.floor(Math.random() * viralStructures.length)];
}
