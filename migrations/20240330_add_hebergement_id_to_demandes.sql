-- Ajout de la colonne hebergement_id à la table demandes si elle n'existe pas déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'demandes' AND column_name = 'hebergement_id'
    ) THEN
        ALTER TABLE demandes 
        ADD COLUMN hebergement_id UUID REFERENCES hebergements_temporaires(id) ON DELETE SET NULL;
        
        -- Ajout d'un index sur la colonne pour optimiser les recherches
        CREATE INDEX IF NOT EXISTS idx_demandes_hebergement_id ON demandes(hebergement_id);
        
        -- Ajout d'un commentaire sur la colonne pour la documentation
        COMMENT ON COLUMN demandes.hebergement_id IS 'Identifiant de l''hébergement temporaire associé à la demande';
    END IF;
END $$; 