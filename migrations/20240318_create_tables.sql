-- Migration: creation des tables principales
-- Date: 2024-03-18

-- Table des structures (centres d'accueil, foyers, etc.)
CREATE TABLE IF NOT EXISTS structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    telephone VARCHAR(20),
    email VARCHAR(100),
    type VARCHAR(50) NOT NULL, -- centre_accueil, foyer, centre_hebergement, autre
    capacite INTEGER,
    services TEXT, -- Stocké en JSON ou en texte avec séparateurs 
    horaires TEXT,
    image_url TEXT,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP
);

-- Table des logements
CREATE TABLE IF NOT EXISTS logements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    nombre_pieces INTEGER,
    superficie NUMERIC(10, 2), -- en m²
    loyer NUMERIC(10, 2), -- en euros
    charges NUMERIC(10, 2), -- en euros
    disponibilite DATE, -- Date à laquelle le logement est disponible
    type_logement VARCHAR(50), -- appartement, maison, studio, etc.
    image_url TEXT,
    disponible BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP
);

-- Table des hébergements temporaires
CREATE TABLE IF NOT EXISTS hebergements_temporaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    places_disponibles INTEGER DEFAULT 0,
    type_hebergement VARCHAR(50) NOT NULL, -- urgence, temporaire, longue_duree
    duree_max_sejour VARCHAR(50), -- en jours/semaines/mois
    public_cible TEXT, -- hommes, femmes, familles, etc.
    conditions_acces TEXT,
    services_inclus TEXT, -- Stocké en JSON ou en texte avec séparateurs
    image_url TEXT,
    disponible BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP
);

-- Table des demandes (logement ou hébergement)
CREATE TABLE IF NOT EXISTS demandes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    nombre_personnes VARCHAR(50), -- Nombre d'adultes et d'enfants
    niveau_urgence VARCHAR(50), -- Description du niveau d'urgence
    message TEXT, -- Message ou information supplémentaire
    logement_id UUID REFERENCES logements(id) ON DELETE SET NULL, -- Si demande de logement spécifique
    centre_type VARCHAR(50), -- Si demande d'hébergement de type spécifique
    type VARCHAR(20) NOT NULL, -- logement ou hebergement
    status VARCHAR(20) NOT NULL DEFAULT 'en_attente', -- en_attente, en_cours, acceptee, refusee, annulee
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP
);

-- Table des messages envoyés aux structures
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    structure_id UUID NOT NULL REFERENCES structures(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP
);

-- Ajout d'index pour accélérer les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_logements_disponible ON logements(disponible) WHERE disponible = TRUE;
CREATE INDEX IF NOT EXISTS idx_hebergements_temporaires_disponible ON hebergements_temporaires(disponible) WHERE disponible = TRUE;
CREATE INDEX IF NOT EXISTS idx_structures_actif ON structures(actif) WHERE actif = TRUE;
CREATE INDEX IF NOT EXISTS idx_structures_type ON structures(type);
CREATE INDEX IF NOT EXISTS idx_demandes_status ON demandes(status);
CREATE INDEX IF NOT EXISTS idx_demandes_type ON demandes(type);
CREATE INDEX IF NOT EXISTS idx_messages_structure ON messages(structure_id);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages(lu);

-- Commentaires sur les tables
COMMENT ON TABLE structures IS 'Structures d''accueil et centres d''hébergement';
COMMENT ON TABLE logements IS 'Logements disponibles pour les personnes en situation d''urgence';
COMMENT ON TABLE hebergements_temporaires IS 'Hébergements temporaires d''urgence';
COMMENT ON TABLE demandes IS 'Demandes de logement ou d''hébergement';
COMMENT ON TABLE messages IS 'Messages envoyés aux structures pour demandes d''information'; 