const cloudinary = require('../config/cloudinaryConfig');
const streamifier = require('streamifier');

/**
 * Uploader une image sur Cloudinary
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const uploadImage = async (req, res) => {
  try {
    // Vérifier si un fichier a été envoyé
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }
    
    // L'ID de l'utilisateur est récupéré du token décodé
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    // Récupérer le type de ressource (logement, don, etc.) depuis la requête
    const resourceType = req.query.type || 'generic';
    
    // Créer une promesse pour uploader sur Cloudinary à partir d'un buffer
    const cloudinaryUpload = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `pelycan/${resourceType}s`,
            public_id: `${resourceType}_${Date.now()}`,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        // Utiliser streamifier pour convertir le buffer en stream
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
    };
    
    const uploadResult = await cloudinaryUpload();
    
    // Retourner l'URL secure de Cloudinary
    res.status(200).json({ 
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image' });
  }
};

/**
 * Uploader plusieurs images sur Cloudinary
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
const uploadMultipleImages = async (req, res) => {
  try {
    // Vérifier si des fichiers ont été envoyés
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }
    
    // L'ID de l'utilisateur est récupéré du token décodé
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    // Récupérer le type de ressource (logement, don, etc.) depuis la requête
    const resourceType = req.query.type || 'generic';
    
    // Tableau pour stocker les résultats des uploads
    const uploadResults = [];
    
    // Fonction pour uploader une image sur Cloudinary
    const cloudinaryUpload = (file, index) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `pelycan/${resourceType}s`,
            public_id: `${resourceType}_${Date.now()}_${index}`,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        // Utiliser streamifier pour convertir le buffer en stream
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    };
    
    // Uploader chaque image
    for (let i = 0; i < req.files.length; i++) {
      const result = await cloudinaryUpload(req.files[i], i);
      uploadResults.push({
        url: result.secure_url,
        public_id: result.public_id
      });
    }
    
    // Retourner les URLs secure de Cloudinary
    res.status(200).json({ images: uploadResults });
  } catch (error) {
    console.error('Erreur lors de l\'upload des images:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload des images' });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages
}; 