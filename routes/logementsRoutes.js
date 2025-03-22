const express = require('express');
const router = express.Router();
const LogementsController = require('../controllers/logementsController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

/**
 * Routes pour la gestion des logements
 */

// Route publique pour récupérer tous les logements disponibles 
router.get('/', authMiddleware, checkRole(['admin', 'pro', 'user']), LogementsController.getAllLogements);

// Route publique pour récupérer un logement par son ID
router.get('/:id', authMiddleware, checkRole(['admin', 'pro', 'user']), LogementsController.getLogementById);

// Routes protégées nécessitant une authentification et un rôle spécifique
// Seuls les administrateurs et les professionnels peuvent ajouter, modifier ou supprimer des logements

// Ajouter un nouveau logement
router.post('/', authMiddleware, checkRole(['admin', 'pro', 'user']), LogementsController.addLogement);

// Mettre à jour un logement existant
router.put('/:id', authMiddleware, checkRole(['admin', 'pro', 'user']), LogementsController.updateLogement);

// Supprimer un logement
router.delete('/:id', authMiddleware, checkRole(['admin', 'pro', 'user']), LogementsController.deleteLogement);

module.exports = router; 