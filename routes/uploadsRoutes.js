const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple, handleUploadErrors } = require('../middleware/uploadMiddleware');
const uploadController = require('../controllers/uploadController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Routes pour la gestion des uploads
 */

// Route pour uploader une seule image
router.post('/single', 
  authMiddleware, 
  uploadSingle('image'),
  handleUploadErrors,
  uploadController.uploadImage
);

// Route pour uploader plusieurs images
router.post('/multiple', 
  authMiddleware, 
  uploadMultiple('images', 5),
  handleUploadErrors,
  uploadController.uploadMultipleImages
);

module.exports = router; 