-- Vérifier si l'extension uuid-ossp est installée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supprimer la table users si elle existe
DROP TABLE IF EXISTS users CASCADE;

-- Recréer la table users avec la bonne structure
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role user_role_enum DEFAULT 'user'::user_role_enum,
    status user_status_enum DEFAULT 'active'::user_status_enum,
    availability BOOLEAN DEFAULT true,
    notes TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur l'email
CREATE INDEX idx_users_email ON users(email);

-- Créer un index sur le rôle
CREATE INDEX idx_users_role ON users(role);

-- Créer un index sur le statut
CREATE INDEX idx_users_status ON users(status);

-- Créer un index sur la disponibilité
CREATE INDEX idx_users_availability ON users(availability);

-- Créer la table ratings
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL REFERENCES users(id),
    user_id UUID NOT NULL REFERENCES users(id),
    case_id UUID NOT NULL REFERENCES cases(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(professional_id, case_id)
);

-- Créer les index pour la table ratings
CREATE INDEX idx_ratings_professional_id ON ratings(professional_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_case_id ON ratings(case_id);

-- Vérifier la structure de la table
\d users
\d ratings 