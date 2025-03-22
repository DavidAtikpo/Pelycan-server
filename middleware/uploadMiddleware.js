const multer = require('multer');
const path = require('path');

// Configuration de Multer pour stocker les fichiers en mémoire (buffer)
// Cela permet d'éviter d'écrire sur le disque avant d'uploader sur Cloudinary
const storage = multer.memoryStorage();

// Configuration pour les images de logements
const uploadConfig = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier que le fichier est une image
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont autorisées'), false);
    }
    
    // Vérifier les formats d'image autorisés
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error('Format d\'image non supporté'), false);
    }
    
    cb(null, true);
  }
});

// Middleware pour upload d'une seule image
const uploadSingle = (fieldName = 'image') => {
  return uploadConfig.single(fieldName);
};

// Middleware pour upload de plusieurs images
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return uploadConfig.array(fieldName, maxCount);
};

// Middleware pour gérer les erreurs d'upload
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erreur Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Le fichier est trop volumineux (max 5MB)' });
    }
    return res.status(400).json({ message: `Erreur lors de l'upload: ${err.message}` });
  } else if (err) {
    // Autre erreur
    return res.status(400).json({ message: err.message });
  }
  
  // Pas d'erreur, continuer
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadErrors
}; 