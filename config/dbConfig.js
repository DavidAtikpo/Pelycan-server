const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuration de la base de données avec variables d'environnement
const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    },
    // Paramètres de connexion
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20 // Nombre maximum de clients dans le pool
};

const pool = new Pool(dbConfig);

// Fonction de test de connexion à la base de données
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Connexion à PostgreSQL établie avec succès');
        client.release();
    } catch (error) {
        console.error('❌ Erreur de connexion à PostgreSQL:', error.message);
        process.exit(1);
    }
};

// Gestion de la fermeture propre du pool
process.on('SIGINT', async () => {
    await pool.end();
    console.log('Pool de connexion PostgreSQL fermé');
    process.exit(0);
});

module.exports = {
    pool,
    testConnection
};
