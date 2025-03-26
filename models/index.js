'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Déboguer le chemin du fichier .env
const envPath = path.join(__dirname, '../.env');
console.log('Chemin du fichier .env:', envPath);
console.log('Le fichier existe:', fs.existsSync(envPath));

require('dotenv').config({ path: envPath });

// Vérification de la variable d'environnement
console.log('Variables d\'environnement:', {
    DATABASE_URL: process.env.DATABASE_URL,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST
});

if (!process.env.DATABASE_URL) {
    console.error('Erreur: DATABASE_URL n\'est pas défini');
    console.error('Contenu du fichier .env:');
    if (fs.existsSync(envPath)) {
        console.log(fs.readFileSync(envPath, 'utf8'));
    } else {
        console.log('Fichier .env non trouvé');
    }
    throw new Error('DATABASE_URL n\'est pas défini dans le fichier .env');
}

const db = {};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

// Test de connexion
sequelize.authenticate()
    .then(() => {
        console.log('✅ Connexion à la base de données établie avec succès.');
    })
    .catch(err => {
        console.error('❌ Erreur de connexion à la base de données:', err);
    });

fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

// Suppression de la duplication des associations
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// Fonction unifiée pour l'initialisation de la base de données
const initializeDatabase = async () => {
  try {
    // Test de connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // Synchronisation avec la base de données
    // En production, utilisez { alter: true }
    // En développement initial, vous pouvez utiliser { force: true }
    await sequelize.sync({ 
      alter: true,
      force: false
    });
    console.log('✅ Base de données synchronisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.initialize = initializeDatabase;

module.exports = db;