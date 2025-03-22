-- Table des demandes d'ajout de logement
CREATE TABLE IF NOT EXISTS demandes_ajout_logement (
  id UUID PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  justificatif VARCHAR(255),
  statut VARCHAR(20) NOT NULL DEFAULT 'en_attente',
  date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_mise_a_jour TIMESTAMP,
  raison_demande TEXT NOT NULL,
  est_proprio BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Index sur le statut pour faciliter les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_demandes_ajout_logement_statut ON demandes_ajout_logement(statut);

-- Index sur la date de création pour l'ordre d'affichage
CREATE INDEX IF NOT EXISTS idx_demandes_ajout_logement_date ON demandes_ajout_logement(date_creation);

-- Ajout de commentaires pour la documentation
COMMENT ON TABLE demandes_ajout_logement IS 'Table contenant les demandes d''ajout de logement en attente de validation';
COMMENT ON COLUMN demandes_ajout_logement.id IS 'Identifiant unique de la demande';
COMMENT ON COLUMN demandes_ajout_logement.nom IS 'Nom de famille du demandeur';
COMMENT ON COLUMN demandes_ajout_logement.prenom IS 'Prénom du demandeur';
COMMENT ON COLUMN demandes_ajout_logement.telephone IS 'Numéro de téléphone du demandeur';
COMMENT ON COLUMN demandes_ajout_logement.email IS 'Adresse email du demandeur';
COMMENT ON COLUMN demandes_ajout_logement.justificatif IS 'URL ou chemin vers le justificatif fourni par le demandeur';
COMMENT ON COLUMN demandes_ajout_logement.statut IS 'Statut de la demande: en_attente, approuvee, refusee';
COMMENT ON COLUMN demandes_ajout_logement.date_creation IS 'Date de création de la demande';
COMMENT ON COLUMN demandes_ajout_logement.date_mise_a_jour IS 'Date de la dernière mise à jour de la demande';
COMMENT ON COLUMN demandes_ajout_logement.raison_demande IS 'Explication de la raison de la demande par le demandeur';
COMMENT ON COLUMN demandes_ajout_logement.est_proprio IS 'Indique si le demandeur est propriétaire du logement';
COMMENT ON COLUMN demandes_ajout_logement.user_id IS 'Lien vers l''utilisateur qui a créé la demande, si connecté';

-- Insertion de données de test (optionnel)
INSERT INTO demandes_ajout_logement (
  id, 
  nom, 
  prenom, 
  telephone, 
  email, 
  statut, 
  date_creation, 
  raison_demande, 
  est_proprio
) VALUES (
  '8f7e6d5c-4b3a-2c1d-9e8f-7a6b5c4d3e2f',
  'Dupont',
  'Jean',
  '0612345678',
  'jean.dupont@example.com',
  'en_attente',
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  'Je souhaite proposer mon logement pour aider des personnes en situation d''urgence suite aux récentes inondations.',
  TRUE
), (
  '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
  'Martin',
  'Sophie',
  '0687654321',
  'sophie.martin@example.com',
  'approuvee',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  'Je suis propriétaire d''un appartement vide que je souhaite mettre à disposition pour l''aide humanitaire.',
  TRUE
), (
  'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  'Leroy',
  'Paul',
  '0654321789',
  'paul.leroy@example.com',
  'refusee',
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  'J''ai un logement vacant suite à un départ en maison de retraite et je voudrais le proposer temporairement.',
  FALSE
); 