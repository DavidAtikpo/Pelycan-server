const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const donsController = require('../controllers/donsController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Configuration de multer pour stocker les fichiers en mémoire (buffer)
const storage = multer.memoryStorage();

// Configuration plus permissive de multer pour les images venant de React Native
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Accepter tous les types d'images courants
    cb(null, true);
  }
});

// Routes pour les dons
router.post('/', authMiddleware, donsController.createDon);
router.get('/', authMiddleware, donsController.getDons);
router.put('/:id/status', authMiddleware, donsController.updateDonStatus);

// Route pour l'upload d'image
router.post('/upload', authMiddleware, upload.single('image'), donsController.uploadImage);

module.exports = router; 