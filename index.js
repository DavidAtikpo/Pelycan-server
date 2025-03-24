require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de sécurité basique
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Vérifier les variables d'environnement
console.log('Variables d\'environnement chargées:', {
    DATABASE_URL: process.env.DATABASE_URL,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER
});

// Test de la connexion à la base de données et synchronisation des modèles
const initializeDatabase = async () => {
    try {
        // Test de connexion
        await db.sequelize.authenticate();
        console.log('✅ Connexion établie avec:', {
            database: db.sequelize.config.database,
            host: db.sequelize.config.host,
            username: db.sequelize.config.username
        });
        
        // Synchroniser les modèles
        await db.sequelize.sync({ 
            force: process.env.NODE_ENV === 'development' // Force uniquement en développement
        });
        console.log('✅ Modèles synchronisés avec la base de données');
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.error('Configuration utilisée:', db.sequelize.config);
        process.exit(1);
    }
};

// Initialiser la base de données avant de démarrer le serveur
initializeDatabase();

// Routes publiques (auth)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Nouvelles routes pour les fonctionnalités principales
const logementsRoutes = require('./routes/logementsRoutes');
const structuresRoutes = require('./routes/structuresRoutes');
const hebergementsRoutes = require('./routes/hebergementsRoutes');
const demandesRoutes = require('./routes/demandesRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const donsRoutes = require('./routes/donsRoutes');
const demandesAjoutLogementRoutes = require('./routes/demandesAjoutLogementRoutes');
const uploadsRoutes = require('./routes/uploadsRoutes');
const alertsRoutes = require('./routes/alerts');

app.use('/api/logements', logementsRoutes);
app.use('/api/structures', structuresRoutes);
app.use('/api/hebergements', hebergementsRoutes);
app.use('/api/demandes', demandesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/dons', donsRoutes);
app.use('/api/demandes-ajout-logement', demandesAjoutLogementRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/alerts', alertsRoutes);

// Routes protégées
const adminRoutes = require('./routes/adminRoutes');
const proRoutes = require('./routes/proRoutes');
const userRoutes = require('./routes/authRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/pro', proRoutes);
app.use('/api/user', userRoutes);
app.use('/api/emergency', emergencyRoutes);

// Route d'accueil
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API Pelycan' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Une erreur est survenue sur le serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
    });
});

// Démarrage du serveur
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Accessible via:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Réseau: http://192.168.1.70:${PORT}`);
    console.log(`- Émulateur Android: http://10.0.2.2:${PORT}`);
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', async () => {
    console.log('SIGTERM reçu. Arrêt gracieux du serveur...');
    try {
        await db.sequelize.close();
        console.log('Connexion à la base de données fermée');
        server.close(() => {
            console.log('Serveur HTTP arrêté');
            process.exit(0);
        });
    } catch (error) {
        console.error('Erreur lors de la fermeture:', error);
        process.exit(1);
    }
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesse non gérée:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Exception non capturée:', error);
    process.exit(1);
});

