-- Ajout des colonnes manquantes à la table logements
ALTER TABLE logements 
ADD COLUMN IF NOT EXISTS equipements TEXT,
ADD COLUMN IF NOT EXISTS images JSONB,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Ajout d'un index sur la colonne user_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_logements_user_id ON logements(user_id);

-- Commentaires sur les colonnes
COMMENT ON COLUMN logements.equipements IS 'Liste des équipements disponibles dans le logement, sous forme de texte séparé par des virgules';
COMMENT ON COLUMN logements.images IS 'Liste des URLs des images du logement au format JSON';
COMMENT ON COLUMN logements.user_id IS 'Référence à l''utilisateur qui a ajouté le logement'; 