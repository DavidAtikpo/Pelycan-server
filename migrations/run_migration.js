const fs = require('fs');
const path = require('path');
const { pool } = require('../config/dbConfig');

async function runMigration() {
  try {
    console.log('Lecture du fichier de migration...');
    const sqlPath = path.join(__dirname, 'add_logements_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Contenu du fichier SQL:');
    console.log(sql);
    
    console.log('Exécution de la migration...');
    await pool.query(sql);
    
    console.log('Migration exécutée avec succès');
    
    // Vérifier les colonnes après migration
    const result = await pool.query(
      'SELECT column_name FROM information_schema.columns WHERE table_name = $1',
      ['logements']
    );
    
    console.log('Colonnes existantes dans la table logements:');
    result.rows.forEach(row => console.log(`- ${row.column_name}`));
    
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la migration:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter la fonction
runMigration(); 