import pool from './db.js';

async function removeUniqueConstraint() {
  try {
    console.log("Eliminando restricción UNIQUE de linkedin_url...");
    
    // El nombre de la restricción suele ser el nombre de la tabla + nombre de columna + _key
    // En el error decía "users_linkedin_url_key"
    const query = "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_linkedin_url_key";

    await pool.query(query);
    console.log("Restricción eliminada exitosamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error al eliminar la restricción:", error);
    process.exit(1);
  }
}

removeUniqueConstraint();
