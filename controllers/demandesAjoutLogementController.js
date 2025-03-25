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
    
    // Requête principale adaptée à la structure réelle
    const query = `
      SELECT 
        id,
        logement_details,
        status,
        created_at,
        updated_at,
        documents,
        commentaire_admin,
        user_id,
        logement_id
      FROM demandes_ajout_logement
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    console.log('Nombre de demandes trouvées:', result.rows.length);
    
    // Transformer les résultats pour correspondre au format attendu par le client
    const demandes = result.rows.map(demande => ({
      id: demande.id,
      ...demande.logement_details, // Déstructurer les détails du logement
      status: demande.status,
      dateCreation: demande.created_at,
      dateMiseAJour: demande.updated_at,
      documents: demande.documents || [],
      commentaireAdmin: demande.commentaire_admin,
      userId: demande.user_id,
      logementId: demande.logement_id
    }));
    
    res.status(200).json(demandes);
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
        logement_details,
        status,
        created_at,
        updated_at,
        documents,
        commentaire_admin,
        user_id,
        logement_id
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
    
    res.status(200).json({
      id: demande.id,
      ...demande.logement_details,
      status: demande.status,
      dateCreation: demande.created_at,
      dateMiseAJour: demande.updated_at,
      documents: demande.documents || [],
      commentaireAdmin: demande.commentaire_admin,
      userId: demande.user_id,
      logementId: demande.logement_id
    });
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
      logementDetails,
      documents = []
    } = req.body;
    
    // Validation des données
    if (!logementDetails) {
      return res.status(400).json({ message: 'Veuillez fournir les détails du logement' });
    }
    
    const id = uuidv4();
    const now = new Date();
    
    const query = `
      INSERT INTO demandes_ajout_logement(
        id,
        logement_details,
        status,
        created_at,
        updated_at,
        documents,
        user_id
      )
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      id,
      logementDetails,
      'en_attente',
      now,
      now,
      documents,
      req.user ? req.user.id : null
    ];
    
    const result = await pool.query(query, values);
    const demande = result.rows[0];
    
    res.status(201).json({
      id: demande.id,
      ...demande.logement_details,
      status: demande.status,
      dateCreation: demande.created_at,
      dateMiseAJour: demande.updated_at,
      documents: demande.documents || [],
      commentaireAdmin: demande.commentaire_admin,
      userId: demande.user_id,
      logementId: demande.logement_id
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
      SET status = $1, 
          commentaire_admin = $2,
          updated_at = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, commentaireAdmin, new Date(), id]);
    const demande = result.rows[0];
    
    res.status(200).json({
      id: demande.id,
      ...demande.logement_details,
      status: demande.status,
      dateCreation: demande.created_at,
      dateMiseAJour: demande.updated_at,
      documents: demande.documents || [],
      commentaireAdmin: demande.commentaire_admin,
      userId: demande.user_id,
      logementId: demande.logement_id
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

module.exports = {
  getAllDemandes,
  getDemandeById,
  createDemande,
  updateDemandeStatus,
  deleteDemande
}; 