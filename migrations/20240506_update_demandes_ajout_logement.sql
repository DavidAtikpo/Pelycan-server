-- Migration: Mise à jour de la table demandes_ajout_logement
-- Date: 2024-05-06

-- Suppression de la table existante si elle existe
DROP TABLE IF EXISTS demandes_ajout_logement CASCADE;

-- Création de la table
CREATE TABLE demandes_ajout_logement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    commentaire_admin TEXT,
    date_traitement TIMESTAMP,
    admin_id UUID REFERENCES users(id)
);

-- Supprimer la contrainte d'unicité sur l'email si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'demandes_ajout_logement_email_unique'
    ) THEN
        ALTER TABLE demandes_ajout_logement 
        DROP CONSTRAINT demandes_ajout_logement_email_unique;
    END IF;
END $$;

-- Ajouter une contrainte de format pour l'email
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'demandes_ajout_logement_email_format'
    ) THEN
        ALTER TABLE demandes_ajout_logement 
        ADD CONSTRAINT demandes_ajout_logement_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
END $$;

-- Ajouter une contrainte de format pour le téléphone
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'demandes_ajout_logement_telephone_format'
    ) THEN
        ALTER TABLE demandes_ajout_logement 
        ADD CONSTRAINT demandes_ajout_logement_telephone_format 
        CHECK (telephone ~* '^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$');
    END IF;
END $$;

-- Créer les index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_demandes_ajout_logement_email ON demandes_ajout_logement(email);
CREATE INDEX IF NOT EXISTS idx_demandes_ajout_logement_date_creation ON demandes_ajout_logement(date_creation);
CREATE INDEX IF NOT EXISTS idx_demandes_ajout_logement_statut ON demandes_ajout_logement(statut);
CREATE INDEX IF NOT EXISTS idx_demandes_ajout_logement_user_id ON demandes_ajout_logement(user_id);

-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'demandes_ajout_logement' 
        AND column_name = 'commentaire_admin'
    ) THEN
        ALTER TABLE demandes_ajout_logement 
        ADD COLUMN commentaire_admin TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'demandes_ajout_logement' 
        AND column_name = 'date_traitement'
    ) THEN
        ALTER TABLE demandes_ajout_logement 
        ADD COLUMN date_traitement TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'demandes_ajout_logement' 
        AND column_name = 'admin_id'
    ) THEN
        ALTER TABLE demandes_ajout_logement 
        ADD COLUMN admin_id UUID REFERENCES users(id);
    END IF;
END $$;

-- Mettre à jour les commentaires
COMMENT ON TABLE demandes_ajout_logement IS 'Table des demandes d''ajout de logement avec gestion des statuts et des commentaires administrateurs';
COMMENT ON COLUMN demandes_ajout_logement.commentaire_admin IS 'Commentaires de l''administrateur sur la demande';
COMMENT ON COLUMN demandes_ajout_logement.date_traitement IS 'Date de traitement de la demande par l''administrateur';
COMMENT ON COLUMN demandes_ajout_logement.admin_id IS 'ID de l''administrateur qui a traité la demande';

-- Ajout d'une contrainte sur le format du numéro de téléphone
ALTER TABLE demandes_ajout_logement
ADD CONSTRAINT demandes_ajout_logement_telephone_check 
CHECK (telephone ~ '^(0|\+33)[1-9]([-. ]?[0-9]{2}){4}$');

-- Ajout d'un index sur la date de création pour l'ordre d'affichage
CREATE INDEX idx_demandes_ajout_logement_date_creation 
ON demandes_ajout_logement(date_creation DESC);

-- Mise à jour des commentaires pour plus de clarté
COMMENT ON TABLE demandes_ajout_logement IS 'Table contenant les demandes d''ajout de logement en attente de validation par les administrateurs';
COMMENT ON COLUMN demandes_ajout_logement.id IS 'Identifiant unique de la demande (UUID)';
COMMENT ON COLUMN demandes_ajout_logement.nom IS 'Nom de famille du demandeur';
COMMENT ON COLUMN demandes_ajout_logement.prenom IS 'Prénom du demandeur';
COMMENT ON COLUMN demandes_ajout_logement.telephone IS 'Numéro de téléphone du demandeur (format français)';
COMMENT ON COLUMN demandes_ajout_logement.email IS 'Adresse email du demandeur (format valide)';
COMMENT ON COLUMN demandes_ajout_logement.justificatif IS 'URL ou chemin vers le justificatif fourni par le demandeur';
COMMENT ON COLUMN demandes_ajout_logement.statut IS 'Statut de la demande: en_attente, approuvee, refusee';
COMMENT ON COLUMN demandes_ajout_logement.date_creation IS 'Date de création de la demande';
COMMENT ON COLUMN demandes_ajout_logement.date_mise_a_jour IS 'Date de la dernière mise à jour de la demande';
COMMENT ON COLUMN demandes_ajout_logement.raison_demande IS 'Explication détaillée de la raison de la demande par le demandeur';
COMMENT ON COLUMN demandes_ajout_logement.est_proprio IS 'Indique si le demandeur est propriétaire du logement';
COMMENT ON COLUMN demandes_ajout_logement.user_id IS 'Lien vers l''utilisateur qui a créé la demande, si connecté';
COMMENT ON COLUMN demandes_ajout_logement.commentaire_admin IS 'Commentaires de l''administrateur lors de la modification du statut';
COMMENT ON COLUMN demandes_ajout_logement.date_traitement IS 'Date à laquelle la demande a été traitée par un administrateur';
COMMENT ON COLUMN demandes_ajout_logement.admin_id IS 'ID de l''administrateur qui a traité la demande'; 