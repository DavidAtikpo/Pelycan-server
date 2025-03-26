-- Migration pour ajouter la colonne specialite à la table users
BEGIN;

-- Ajout de la colonne specialite
ALTER TABLE users
ADD COLUMN specialite VARCHAR(255);

-- Mise à jour des commentaires de la colonne
COMMENT ON COLUMN users.specialite IS 'Spécialité du professionnel';

-- Mise à jour des professionnels existants avec une valeur par défaut
UPDATE users 
SET specialite = 'Non spécifié' 
WHERE role = 'pro';

-- Rendre la colonne NOT NULL pour les professionnels uniquement
ALTER TABLE users
ADD CONSTRAINT check_specialite_for_pros 
CHECK (
    (role = 'pro' AND specialite IS NOT NULL) OR 
    (role != 'pro' AND specialite IS NULL)
);

COMMIT; 