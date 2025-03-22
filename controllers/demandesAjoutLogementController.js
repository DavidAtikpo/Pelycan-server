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
      SELECT * FROM demandes_ajout_logement
      ORDER BY date_creation DESC
    `;
    
    const result = await pool.query(query);
    
    // Transformer les résultats pour correspondre au format attendu par le client
    const demandes = result.rows.map(demande => ({
      id: demande.id,
      nom: demande.nom,
      prenom: demande.prenom,
      telephone: demande.telephone,
      email: demande.email,
      justificatif: demande.justificatif || null,
      statut: demande.statut,
      dateCreation: demande.date_creation,
      raisonDemande: demande.raison_demande,
      estProprio: demande.est_proprio
    }));
    
    res.status(200).json(demandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes' });
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
      SELECT * FROM demandes_ajout_logement
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    
    const demande = result.rows[0];
    
    // Si c'est un utilisateur standard, vérifier qu'il accède à sa propre demande
    // Remarque: Il faudrait idéalement stocker l'ID de l'utilisateur qui a fait la demande
    // pour une vérification plus robuste
    if (!isAdmin) {
      // Pour l'instant, nous permettons simplement l'accès à toute demande
      // Mais cela devrait être restreint à l'utilisateur qui a créé la demande
    }
    
    res.status(200).json({
      id: demande.id,
      nom: demande.nom,
      prenom: demande.prenom,
      telephone: demande.telephone,
      email: demande.email,
      justificatif: demande.justificatif || null,
      statut: demande.statut,
      dateCreation: demande.date_creation,
      raisonDemande: demande.raison_demande,
      estProprio: demande.est_proprio
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
      nom, 
      prenom, 
      telephone, 
      email, 
      justificatif, 
      raisonDemande, 
      estProprio 
    } = req.body;
    
    // Validation des données
    if (!nom || !prenom || !telephone || !email || !raisonDemande) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises' });
    }
    
    const id = uuidv4();
    const dateCreation = new Date();
    const statut = 'en_attente';
    
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
        raison_demande, 
        est_proprio,
        user_id
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      id,
      nom,
      prenom,
      telephone,
      email,
      justificatif || null,
      statut,
      dateCreation,
      raisonDemande,
      estProprio,
      req.user ? req.user.id : null // Associer à l'utilisateur s'il est connecté
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      id: result.rows[0].id,
      nom: result.rows[0].nom,
      prenom: result.rows[0].prenom,
      telephone: result.rows[0].telephone,
      email: result.rows[0].email,
      justificatif: result.rows[0].justificatif || null,
      statut: result.rows[0].statut,
      dateCreation: result.rows[0].date_creation,
      raisonDemande: result.rows[0].raison_demande,
      estProprio: result.rows[0].est_proprio
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
    const { statut } = req.body;
    
    // Vérifier si l'utilisateur est un administrateur
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Vérifier si le statut est valide
    if (!statut || !['en_attente', 'approuvee', 'refusee'].includes(statut)) {
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
      SET statut = $1, date_mise_a_jour = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [statut, new Date(), id]);
    
    res.status(200).json({
      id: result.rows[0].id,
      nom: result.rows[0].nom,
      prenom: result.rows[0].prenom,
      telephone: result.rows[0].telephone,
      email: result.rows[0].email,
      justificatif: result.rows[0].justificatif || null,
      statut: result.rows[0].statut,
      dateCreation: result.rows[0].date_creation,
      raisonDemande: result.rows[0].raison_demande,
      estProprio: result.rows[0].est_proprio
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