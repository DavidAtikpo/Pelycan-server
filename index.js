const express = require('express');
const { pool, testConnection } = require('./config/dbConfig');
const cors = require('cors');
require('dotenv').config();

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

// Test de la connexion à la base de données au démarrage
testConnection();

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
app.use('/api/alerts', alertsRoutes );

// Routes protégées
const adminRoutes = require('./routes/adminRoutes');
const proRoutes = require('./routes/proRoutes');
const userRoutes = require('./routes/authRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

app.use('/api/admin', adminRoutes);  // Routes protégées pour les admins
app.use('/api/pro', proRoutes);      // Routes protégées pour les pros
app.use('/api/user', userRoutes);    // Routes protégées pour les utilisateurs
app.use('/api/emergency', emergencyRoutes); // Routes pour les urgences

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
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu. Arrêt gracieux du serveur...');
    pool.end(() => {
        console.log('Pool de connexion fermé');
        process.exit(0);
    });
});

