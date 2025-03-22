const express = require('express');
const router = express.Router();
const HebergementsController = require('../controllers/hebergementsController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

/**
 * Routes pour la gestion des hébergements temporaires
 */

// Routes publiques pour récupérer les hébergements temporaires (accessibles à tous les utilisateurs)
router.get('/', HebergementsController.getAllHebergements);
router.get('/:id', HebergementsController.getHebergementById);

// Routes protégées nécessitant une authentification et un rôle spécifique
// Seuls les administrateurs et les professionnels peuvent ajouter, modifier ou supprimer des hébergements temporaires

// Ajouter un nouvel hébergement temporaire
router.post('/', authMiddleware, checkRole(['admin', 'pro']), HebergementsController.addHebergement);

// Mettre à jour un hébergement temporaire existant
router.put('/:id', authMiddleware, checkRole(['admin', 'pro']), HebergementsController.updateHebergement);

// Supprimer un hébergement temporaire
router.delete('/:id', authMiddleware, checkRole(['admin', 'pro']), HebergementsController.deleteHebergement);

module.exports = router; 