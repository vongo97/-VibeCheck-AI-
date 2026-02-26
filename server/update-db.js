import pool from './db.js';

async function updateSchema() {
  try {
    console.log("Actualizando esquema de base de datos...");
    
    // Lista de columnas a agregar
    const queries = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT"
    ];

    for (const query of queries) {
      try {
        await pool.query(query);
        console.log(`Ejecutado: ${query}`);
      } catch (e) {
        console.log(`Nota: ${e.message} (esto es normal si la columna ya existe o hay conflicto de nombres)`);
      }
    }

    console.log("Esquema actualizado exitosamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error al actualizar la base de datos:", error);
    process.exit(1);
  }
}

updateSchema();
