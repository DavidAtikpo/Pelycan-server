-- Supprimer d'abord la table hebergements_temporaires qui dépend de logements
DROP TABLE IF EXISTS hebergements_temporaires CASCADE;

-- Supprimer la table logements
DROP TABLE IF EXISTS logements CASCADE;

-- Recréer la table avec les nouveaux champs
CREATE TABLE logements (
    id SERIAL PRIMARY KEY,
    proprietaire_id UUID NOT NULL REFERENCES users(id),
    titre VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    code_postal VARCHAR(5) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacite INTEGER NOT NULL,
    surface INTEGER NOT NULL,
    description TEXT NOT NULL,
    equipements JSONB DEFAULT '{}',
    disponibilite BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'disponible',
    photos TEXT[] DEFAULT '{}',
    type_hebergement VARCHAR(20) DEFAULT 'permanent' CHECK (type_hebergement IN ('permanent', 'temporaire')),
    date_debut DATE,
    date_fin DATE,
    conditions_temporaire TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter les contraintes
ALTER TABLE logements
    ADD CONSTRAINT check_code_postal CHECK (code_postal ~ '^[0-9]{5}$'),
    ADD CONSTRAINT check_dates_temporaire CHECK (
        (type_hebergement = 'temporaire' AND date_debut IS NOT NULL AND date_fin IS NOT NULL AND date_fin > date_debut)
        OR (type_hebergement = 'permanent' AND date_debut IS NULL AND date_fin IS NULL)
    );

-- Créer les index
CREATE INDEX idx_logements_proprietaire ON logements(proprietaire_id);
CREATE INDEX idx_logements_type_hebergement ON logements(type_hebergement);
CREATE INDEX idx_logements_dates ON logements(date_debut, date_fin);
CREATE INDEX idx_logements_status ON logements(status);

-- Ajouter les commentaires
COMMENT ON TABLE logements IS 'Table des logements disponibles sur la plateforme';
COMMENT ON COLUMN logements.type_hebergement IS 'Type d''hébergement : permanent ou temporaire';
COMMENT ON COLUMN logements.date_debut IS 'Date de début de disponibilité pour les hébergements temporaires';
COMMENT ON COLUMN logements.date_fin IS 'Date de fin de disponibilité pour les hébergements temporaires';
COMMENT ON COLUMN logements.conditions_temporaire IS 'Conditions spécifiques pour les hébergements temporaires'; 