const fs = require('fs');
const path = require('path');
const { pool } = require('../config/dbConfig');

async function runEnumsMigration() {
  try {
    console.log('Lecture du fichier de migration des types énumérés...');
    const sqlPath = path.join(__dirname, '20240322_create_enums.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Exécution de la migration des types énumérés...');
    await pool.query(sql);
    
    console.log('Migration des types énumérés exécutée avec succès');
    
    // Vérifier les types énumérés créés
    const result = await pool.query(
      "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder"
    );
    
    console.log('Types énumérés créés:');
    result.rows.forEach(row => console.log(`- ${row.typname}: ${row.enumlabel}`));
    
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la migration des types énumérés:', error);
  } finally {
    await pool.end();
  }
}

runEnumsMigration(); 