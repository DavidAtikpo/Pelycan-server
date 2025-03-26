const express = require('express');
const router = express.Router();
const LogementsController = require('../controllers/logementsController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

/**
 * Routes pour la gestion des logements
 */

// Route publique pour récupérer tous les logements disponibles
router.get('/', LogementsController.getAllLogements);

// Route pour récupérer les logements d'un utilisateur spécifique (nécessite une authentification)
router.get('/user', authMiddleware, LogementsController.getLogementsByUserId);

// Route pour récupérer un logement spécifique par son ID
router.get('/:id', LogementsController.getLogementById);

// Routes protégées pour la gestion des logements
router.post('/', authMiddleware, checkRole(['admin', 'pro', 'user']), LogementsController.addLogement);
router.put('/:id', authMiddleware, checkRole(['admin', 'pro', 'user']), LogementsController.updateLogement);
router.delete('/:id', authMiddleware, checkRole(['admin', 'pro', 'user']), LogementsController.deleteLogement);

module.exports = router; 