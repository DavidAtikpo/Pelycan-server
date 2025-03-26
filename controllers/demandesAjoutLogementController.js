const { pool } = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

/**
 * Récupérer toutes les demandes d'ajout de logement 
 * (réservé aux administrateurs)
 */
const getAllDemandes = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const query = `
      SELECT 
        id,
        nom,
        prenom,
        telephone,
        email,
        justificatif,
        statut,
        date_creation,
        date_mise_a_jour,
        raison_demande,
        est_proprio,
        user_id
      FROM demandes_ajout_logement
      ORDER BY date_creation DESC
    `;
    
    const result = await pool.query(query);
    console.log('Nombre de demandes trouvées:', result.rows.length);
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des demandes:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des demandes',
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Récupérer une demande spécifique par son ID
 */
const getDemandeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur est un administrateur ou le propriétaire de la demande
    const isAdmin = req.user && req.user.role === 'admin';
    
    const query = `
      SELECT 
        id,
        nom,
        prenom,
        telephone,
        email,
        justificatif,
        statut,
        date_creation,
        date_mise_a_jour,
        raison_demande,
        est_proprio,
        user_id
      FROM demandes_ajout_logement
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    
    const demande = result.rows[0];
    
    // Si c'est un utilisateur standard, vérifier qu'il accède à sa propre demande
    if (!isAdmin && demande.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    res.status(200).json(demande);
  } catch (error) {
    console.error('Erreur lors de la récupération de la demande:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la demande' });
  }
};

/**
 * Créer une nouvelle demande d'ajout de logement
 */
const createDemande = async (req, res) => {
  try {
    const { 
      nom,
      prenom,
      telephone,
      email,
      justificatif,
      statut,
      dateCreation,
      raisonDemande,
      estProprio
    } = req.body;
    
    // Validation des données
    if (!nom || !prenom || !telephone || !email || !raisonDemande) {
      return res.status(400).json({ message: 'Veuillez fournir tous les champs obligatoires' });
    }
    
    // Récupérer l'ID de l'utilisateur authentifié
    const userId = req.user?.id;
    console.log('User ID from request:', userId); // Log pour debug
    
    // Vérifier si l'utilisateur a déjà une demande en attente ou approuvée
    const checkExistingQuery = `
      SELECT * FROM demandes_ajout_logement 
      WHERE user_id = $1 
      AND statut IN ('en_attente', 'approuvee')
    `;
    const existingResult = await pool.query(checkExistingQuery, [userId]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Vous avez déjà une demande en cours de traitement ou approuvée. Veuillez attendre la réponse de cette demande avant d\'en soumettre une nouvelle.' 
      });
    }
    
    const id = uuidv4();
    const now = new Date();
    
    const query = `
      INSERT INTO demandes_ajout_logement(
        id,
        nom,
        prenom,
        telephone,
        email,
        justificatif,
        statut,
        date_creation,
        date_mise_a_jour,
        raison_demande,
        est_proprio,
        user_id
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      id,
      nom,
      prenom,
      telephone,
      email,
      justificatif || '',
      statut || 'en_attente',
      now,
      now,
      raisonDemande,
      estProprio || false,
      userId
    ];
    
    console.log('Values for insertion:', values); // Log pour debug
    
    const result = await pool.query(query, values);
    const demande = result.rows[0];
    
    res.status(201).json({
      id: demande.id,
      nom: demande.nom,
      prenom: demande.prenom,
      telephone: demande.telephone,
      email: demande.email,
      justificatif: demande.justificatif,
      statut: demande.statut,
      dateCreation: demande.date_creation,
      dateMiseAJour: demande.date_mise_a_jour,
      raisonDemande: demande.raison_demande,
      estProprio: demande.est_proprio,
      userId: demande.user_id
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la demande' });
  }
};

/**
 * Mettre à jour le statut d'une demande d'ajout de logement
 * (réservé aux administrateurs)
 */
const updateDemandeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, commentaireAdmin } = req.body;
    
    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Vérifier si le statut est valide
    if (!status || !['en_attente', 'approuvee', 'refusee'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    // Vérifier si la demande existe
    const checkQuery = 'SELECT * FROM demandes_ajout_logement WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    
    // Mettre à jour le statut
    const query = `
      UPDATE demandes_ajout_logement
      SET statut = $1, 
          date_mise_a_jour = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, new Date(), id]);
    const demande = result.rows[0];
    
    res.status(200).json({
      id: demande.id,
      nom: demande.nom,
      prenom: demande.prenom,
      telephone: demande.telephone,
      email: demande.email,
      justificatif: demande.justificatif,
      statut: demande.statut,
      dateCreation: demande.date_creation,
      dateMiseAJour: demande.date_mise_a_jour,
      raisonDemande: demande.raison_demande,
      estProprio: demande.est_proprio,
      userId: demande.user_id
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la demande:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de la demande' });
  }
};

/**
 * Supprimer une demande d'ajout de logement
 */
const deleteDemande = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur est un administrateur ou le propriétaire de la demande
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isAdmin) {
      // Vérifier si l'utilisateur est le propriétaire de la demande
      const checkOwnerQuery = 'SELECT * FROM demandes_ajout_logement WHERE id = $1 AND user_id = $2';
      const checkOwnerResult = await pool.query(checkOwnerQuery, [id, req.user.id]);
      
      if (checkOwnerResult.rows.length === 0) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }
    
    // Supprimer la demande
    const query = 'DELETE FROM demandes_ajout_logement WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    
    res.status(200).json({ message: 'Demande supprimée avec succès', id: result.rows[0].id });
  } catch (error) {
    console.error('Erreur lors de la suppression de la demande:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la demande' });
  }
};

/**
 * Annuler une demande d'ajout de logement
 */
const cancelDemande = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur est un administrateur ou le propriétaire de la demande
    const isAdmin = req.user && req.user.role === 'admin';
    
    if (!isAdmin) {
      // Vérifier si l'utilisateur est le propriétaire de la demande
      const checkOwnerQuery = 'SELECT * FROM demandes_ajout_logement WHERE id = $1 AND user_id = $2';
      const checkOwnerResult = await pool.query(checkOwnerQuery, [id, req.user.id]);
      
      if (checkOwnerResult.rows.length === 0) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
    }
    
    // Vérifier si la demande existe et n'est pas déjà approuvée
    const checkQuery = 'SELECT * FROM demandes_ajout_logement WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    
    if (checkResult.rows[0].statut === 'approuvee') {
      return res.status(400).json({ message: 'Impossible d\'annuler une demande déjà approuvée' });
    }
    
    // Annuler la demande
    const query = `
      UPDATE demandes_ajout_logement
      SET statut = 'refusee',
          date_mise_a_jour = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [new Date(), id]);
    const demande = result.rows[0];
    
    res.status(200).json({
      id: demande.id,
      nom: demande.nom,
      prenom: demande.prenom,
      telephone: demande.telephone,
      email: demande.email,
      justificatif: demande.justificatif,
      statut: demande.statut,
      dateCreation: demande.date_creation,
      dateMiseAJour: demande.date_mise_a_jour,
      raisonDemande: demande.raison_demande,
      estProprio: demande.est_proprio,
      userId: demande.user_id
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la demande:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de la demande' });
  }
};

module.exports = {
  getAllDemandes,
  getDemandeById,
  createDemande,
  updateDemandeStatus,
  deleteDemande,
  cancelDemande
}; 