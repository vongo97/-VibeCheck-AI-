import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log("Inicializando base de datos en Neon...");
    await pool.query(schema);
    console.log("Tablas creadas exitosamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    process.exit(1);
  }
}

initDb();
