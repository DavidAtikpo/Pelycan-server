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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur l'email
CREATE INDEX idx_users_email ON users(email);

-- Vérifier la structure de la table
\d users 