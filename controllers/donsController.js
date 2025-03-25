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
      SELECT 
        id,
        type,
        description,
        quantite,
        photos,
        localisation,
        status,
        created_at,
        updated_at,
        etat
      FROM dons 
      WHERE donateur_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    console.log('Nombre de dons trouvés:', result.rows.length);
    
    // Transformer les résultats pour correspondre au format attendu par le client
    const dons = result.rows.map(don => ({
      id: don.id,
      type: don.type,
      description: don.description || null,
      quantite: don.quantite || null,
      photos: don.photos || [],
      localisation: don.localisation || null,
      status: don.status,
      dateCreation: don.created_at,
      dateMiseAJour: don.updated_at,
      etat: don.etat
    }));
    
    res.status(200).json(dons);
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des dons:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des dons',
      error: error.message,
      stack: error.stack
    });
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
    
    const { type, description, quantite, photos, localisation, etat } = req.body;
    
    // Validation des données
    if (!type) {
      return res.status(400).json({ message: 'Type de don requis' });
    }
    
    if (!description) {
      return res.status(400).json({ message: 'Description requise' });
    }
    
    if (!localisation) {
      return res.status(400).json({ message: 'Localisation requise' });
    }
    
    const id = uuidv4();
    const now = new Date();
    
    const query = `
      INSERT INTO dons(
        id,
        donateur_id,
        type,
        description,
        quantite,
        photos,
        localisation,
        status,
        created_at,
        updated_at,
        etat
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      id,
      userId,
      type,
      description,
      quantite || null,
      photos || [],
      localisation,
      'en_attente',
      now,
      now,
      etat || 'neuf'
    ];
    
    const result = await pool.query(query, values);
    const don = result.rows[0];
    
    res.status(201).json({
      id: don.id,
      type: don.type,
      description: don.description,
      quantite: don.quantite,
      photos: don.photos,
      localisation: don.localisation,
      status: don.status,
      dateCreation: don.created_at,
      dateMiseAJour: don.updated_at,
      etat: don.etat
    });
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
    const { status } = req.body;
    
    // Vérifier si le statut est valide
    if (!status || !['en_attente', 'recu', 'refuse'].includes(status)) {
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
      SET status = $1,
          updated_at = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, new Date(), id]);
    const don = result.rows[0];
    
    res.status(200).json({
      id: don.id,
      type: don.type,
      description: don.description,
      quantite: don.quantite,
      photos: don.photos,
      localisation: don.localisation,
      status: don.status,
      dateCreation: don.created_at,
      dateMiseAJour: don.updated_at,
      etat: don.etat
    });
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