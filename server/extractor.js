import puppeteer from 'puppeteer';

/**
 * Intenta extraer información pública de un perfil de LinkedIn.
 * @param {string} profileUrl - La URL del perfil
 * @returns {Promise<object>} - Los datos extraídos
 */
export async function scrapeLinkedInProfile(profileUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    const page = await browser.newPage();
    
    // Configurar un User-Agent real
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`Navegando a: ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Nota: LinkedIn suele requerir login para ver perfiles completos. 
    // Por ahora extraemos lo que sea visible públicamente.
    const profileData = await page.evaluate(() => {
      const name = document.querySelector('h1')?.innerText || "No encontrado";
      const about = document.querySelector('.top-card-layout__headline')?.innerText || "";
      const description = document.querySelector('section.summary')?.innerText || "";
      
      return { name, about, description, raw: document.body.innerText };
    });

    return profileData;
  } catch (error) {
    console.error("Error en el scraping de LinkedIn:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
