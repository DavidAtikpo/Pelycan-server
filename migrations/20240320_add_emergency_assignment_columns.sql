-- Migration: Ajout de colonnes d'assignation pour les urgences
-- Date: 2024-03-20

-- Ajouter des colonnes à la table des demandes pour assigner des intervenants aux urgences
ALTER TABLE demandes
ADD COLUMN IF NOT EXISTS intervenant_id UUID,
ADD COLUMN IF NOT EXISTS date_assignation TIMESTAMP,
ADD COLUMN IF NOT EXISTS priorite VARCHAR(20),
ADD COLUMN IF NOT EXISTS commentaires_internes TEXT,
ADD COLUMN IF NOT EXISTS date_resolution TIMESTAMP;

-- Créer un index sur la colonne intervenant_id
CREATE INDEX IF NOT EXISTS idx_demandes_intervenant ON demandes(intervenant_id);

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN demandes.intervenant_id IS 'Identifiant de l''intervenant assigné à la demande';
COMMENT ON COLUMN demandes.date_assignation IS 'Date à laquelle la demande a été assignée à un intervenant';
COMMENT ON COLUMN demandes.priorite IS 'Niveau de priorité de la demande (basse, moyenne, haute, critique)';
COMMENT ON COLUMN demandes.commentaires_internes IS 'Commentaires internes pour le suivi de la demande';
COMMENT ON COLUMN demandes.date_resolution IS 'Date à laquelle la demande a été résolue';

-- Ajouter une table pour les intervenants si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS intervenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    service VARCHAR(50),
    role VARCHAR(50),
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP
);

-- Créer un index sur le nom et le prénom de l'intervenant
CREATE INDEX IF NOT EXISTS idx_intervenants_nom_prenom ON intervenants(nom, prenom);

-- Créer un index sur l'email de l'intervenant
CREATE INDEX IF NOT EXISTS idx_intervenants_email ON intervenants(email);

-- Ajouter la contrainte de clé étrangère entre demandes et intervenants
ALTER TABLE demandes
ADD CONSTRAINT fk_demandes_intervenant
FOREIGN KEY (intervenant_id)
REFERENCES intervenants(id)
ON DELETE SET NULL;

-- Commentaire sur la table intervenants
COMMENT ON TABLE intervenants IS 'Intervenants pouvant être assignés à des demandes d''urgence'; 