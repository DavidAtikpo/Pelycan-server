-- Ajout de la colonne viewed_by_admin à la table alerts
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS viewed_by_admin BOOLEAN DEFAULT FALSE;

-- Création d'un index pour optimiser les requêtes sur viewed_by_admin
CREATE INDEX IF NOT EXISTS idx_alerts_viewed ON alerts(viewed_by_admin, status); 