-- Créer la table des dons
CREATE TABLE IF NOT EXISTS dons (
    id VARCHAR(36) PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('objet', 'financier')),
    description TEXT,
    montant DECIMAL(10, 2),
    image_url VARCHAR(255),
    coordonnees VARCHAR(255),
    statut VARCHAR(20) NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'recu')),
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
      REFERENCES users(id)
      ON DELETE CASCADE
);

-- Créer un index sur le type de don pour faciliter les recherches
CREATE INDEX idx_dons_type ON dons(type);

-- Créer un index sur l'ID utilisateur pour faciliter les recherches
CREATE INDEX idx_dons_user_id ON dons(user_id);

-- Créer un index sur la date pour faciliter les recherches
CREATE INDEX idx_dons_date ON dons(date);

-- Ajouter des commentaires descriptifs aux colonnes
COMMENT ON TABLE dons IS 'Table contenant les dons (objets et financiers)';
COMMENT ON COLUMN dons.id IS 'Identifiant unique du don';
COMMENT ON COLUMN dons.user_id IS 'Identifiant de l''utilisateur ayant fait le don';
COMMENT ON COLUMN dons.type IS 'Type de don: objet ou financier';
COMMENT ON COLUMN dons.description IS 'Description du don (pour les dons d''objets)';
COMMENT ON COLUMN dons.montant IS 'Montant du don (pour les dons financiers)';
COMMENT ON COLUMN dons.image_url IS 'URL de l''image du don (pour les dons d''objets)';
COMMENT ON COLUMN dons.coordonnees IS 'Coordonnées de contact du donateur (pour les dons d''objets)';
COMMENT ON COLUMN dons.statut IS 'Statut du don: en_attente ou recu';
COMMENT ON COLUMN dons.date IS 'Date de création du don';

-- Insérer quelques données de test
INSERT INTO dons (id, user_id, type, description, image_url, coordonnees, statut, date)
VALUES 
('de0d8e6f-85c9-4d56-a4c2-a5e6b4e7f8a9', 'a2976cb7-7cab-4fc3-b580-615e49051fae', 'objet', 'Canapé 3 places en bon état', '/uploads/canape.jpg', 'jean@example.com', 'recu', NOW() - INTERVAL '3 months'),
('ee1d9f7g-96d0-5e67-b5d3-b6f7c5e8g9b0', 'a2976cb7-7cab-4fc3-b580-615e49051fae', 'objet', 'Vêtements pour enfant 3-5 ans', '/uploads/vetements.jpg', 'jean@example.com', 'en_attente', NOW() - INTERVAL '1 month');

INSERT INTO dons (id, user_id, type, montant, statut, date)
VALUES 
('ff2e0g8h-07e1-6f78-c6e4-c7g8d6f9h0c1', 'a2976cb7-7cab-4fc3-b580-615e49051fae', 'financier', 50.00, 'recu', NOW() - INTERVAL '2 months'); 