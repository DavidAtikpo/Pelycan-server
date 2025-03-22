const express = require('express');
const router = express.Router();
const StructuresController = require('../controllers/structuresController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

/**
 * Routes pour la gestion des structures (centres d'accueil, foyers...)
 */

// Routes publiques pour récupérer les structures (accessibles à tous les utilisateurs)
router.get('/', StructuresController.getAllStructures);
router.get('/type/:type', StructuresController.getStructuresByType);
router.get('/:id', StructuresController.getStructureById);

// Routes protégées nécessitant une authentification et un rôle spécifique
// Seuls les administrateurs peuvent ajouter, modifier ou supprimer des structures
router.use(authMiddleware, checkRole(['admin']));

// Ajouter une nouvelle structure
router.post('/', StructuresController.addStructure);

// Mettre à jour une structure existante
router.put('/:id', StructuresController.updateStructure);

// Supprimer une structure
router.delete('/:id', StructuresController.deleteStructure);

module.exports = router; 