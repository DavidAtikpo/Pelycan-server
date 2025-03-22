const { pool } = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');
const streamifier = require('streamifier');

/**
 * Récupérer tous les dons d'un utilisateur
 */
const getDons = async (req, res) => {
  try {
    // L'ID de l'utilisateur serait normalement récupéré du token décodé
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    const query = `
      SELECT * FROM dons 
      WHERE user_id = $1
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    // Transformer les résultats pour correspondre au format attendu par le client
    const dons = result.rows.map(don => ({
      id: don.id,
      type: don.type,
      description: don.description || null,
      montant: don.montant || null,
      imageUrl: don.image_url || null,
      coordonnees: don.coordonnees || null,
      statut: don.statut,
      date: don.date
    }));
    
    res.status(200).json(dons);
  } catch (error) {
    console.error('Erreur lors de la récupération des dons:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des dons' });
  }
};

/**
 * Créer un nouveau don
 */
const createDon = async (req, res) => {
  try {
    // L'ID de l'utilisateur serait normalement récupéré du token décodé
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    const { type, description, montant, imageUrl, coordonnees } = req.body;
    
    // Validation des données
    if (!type || (type !== 'objet' && type !== 'financier')) {
      return res.status(400).json({ message: 'Type de don invalide' });
    }
    
    if (type === 'objet' && (!description || !coordonnees)) {
      return res.status(400).json({ message: 'Description et coordonnées requis pour les dons d\'objet' });
    }
    
    if (type === 'financier' && (!montant || isNaN(montant) || montant <= 0)) {
      return res.status(400).json({ message: 'Montant invalide pour le don financier' });
    }
    
    const id = uuidv4();
    const date = new Date();
    const statut = 'en_attente';
    
    const query = `
      INSERT INTO dons(id, user_id, type, description, montant, image_url, coordonnees, statut, date)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      id,
      userId,
      type,
      description || null,
      montant || null,
      imageUrl || null,
      coordonnees || null,
      statut,
      date
    ];
    
    const result = await pool.query(query, values);
    
    // Transformer le résultat pour correspondre au format attendu par le client
    const don = {
      id: result.rows[0].id,
      type: result.rows[0].type,
      description: result.rows[0].description || null,
      montant: result.rows[0].montant || null,
      imageUrl: result.rows[0].image_url || null,
      coordonnees: result.rows[0].coordonnees || null,
      statut: result.rows[0].statut,
      date: result.rows[0].date
    };
    
    res.status(201).json(don);
  } catch (error) {
    console.error('Erreur lors de la création du don:', error);
    res.status(500).json({ message: 'Erreur lors de la création du don' });
  }
};

/**
 * Uploader une image sur Cloudinary
 */
const uploadImage = async (req, res) => {
  try {
    // Vérifier si un fichier a été envoyé
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }
    
    // L'ID de l'utilisateur serait normalement récupéré du token décodé
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    // Créer une promesse pour uploader sur Cloudinary à partir d'un buffer
    const cloudinaryUpload = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'pelycan/dons',
            public_id: `don_${Date.now()}`,
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
    res.status(200).json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image' });
  }
};

/**
 * Mettre à jour le statut d'un don
 */
const updateDonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    
    // Vérifier si le statut est valide
    if (!statut || (statut !== 'en_attente' && statut !== 'recu')) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    // Vérifier si le don existe
    const checkQuery = 'SELECT * FROM dons WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Don non trouvé' });
    }
    
    // Mettre à jour le statut
    const query = `
      UPDATE dons
      SET statut = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [statut, id]);
    
    // Transformer le résultat pour correspondre au format attendu par le client
    const don = {
      id: result.rows[0].id,
      type: result.rows[0].type,
      description: result.rows[0].description || null,
      montant: result.rows[0].montant || null,
      imageUrl: result.rows[0].image_url || null,
      coordonnees: result.rows[0].coordonnees || null,
      statut: result.rows[0].statut,
      date: result.rows[0].date
    };
    
    res.status(200).json(don);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du don:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du don' });
  }
};

module.exports = {
  getDons,
  createDon,
  uploadImage,
  updateDonStatus
}; 