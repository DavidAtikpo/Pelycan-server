-- Activer l'extension uuid-ossp si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role_enum DEFAULT 'user'::user_role_enum,
    status user_status_enum DEFAULT 'active'::user_status_enum,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table cases si elle n'existe pas
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority case_priority_enum DEFAULT 'medium'::case_priority_enum,
    status case_status_enum DEFAULT 'new'::case_status_enum,
    user_id UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table alerts si elle n'existe pas
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status alert_status_enum DEFAULT 'active'::alert_status_enum,
    user_id UUID REFERENCES users(id),
    case_id UUID REFERENCES cases(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table emergency_requests si elle n'existe pas
CREATE TABLE IF NOT EXISTS emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status emergency_status_enum DEFAULT 'pending'::emergency_status_enum,
    location VARCHAR(255),
    user_id UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer la table biometric_data si elle n'existe pas
CREATE TABLE IF NOT EXISTS biometric_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    biometric_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, biometric_id)
);

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
    -- Users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
        ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role user_role_enum DEFAULT 'user'::user_role_enum;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status user_status_enum DEFAULT 'active'::user_status_enum;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_number') THEN
        ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
    END IF;

    -- Cases
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'title') THEN
        ALTER TABLE cases ADD COLUMN title VARCHAR(255) NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'description') THEN
        ALTER TABLE cases ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'priority') THEN
        ALTER TABLE cases ADD COLUMN priority case_priority_enum DEFAULT 'medium'::case_priority_enum;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'status') THEN
        ALTER TABLE cases ADD COLUMN status case_status_enum DEFAULT 'new'::case_status_enum;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'user_id') THEN
        ALTER TABLE cases ADD COLUMN user_id UUID REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'assigned_to') THEN
        ALTER TABLE cases ADD COLUMN assigned_to UUID REFERENCES users(id);
    END IF;

    -- Alerts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'title') THEN
        ALTER TABLE alerts ADD COLUMN title VARCHAR(255) NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'description') THEN
        ALTER TABLE alerts ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'status') THEN
        ALTER TABLE alerts ADD COLUMN status alert_status_enum DEFAULT 'active'::alert_status_enum;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'user_id') THEN
        ALTER TABLE alerts ADD COLUMN user_id UUID REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'case_id') THEN
        ALTER TABLE alerts ADD COLUMN case_id UUID REFERENCES cases(id);
    END IF;

    -- Emergency Requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_requests' AND column_name = 'title') THEN
        ALTER TABLE emergency_requests ADD COLUMN title VARCHAR(255) NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_requests' AND column_name = 'description') THEN
        ALTER TABLE emergency_requests ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_requests' AND column_name = 'status') THEN
        ALTER TABLE emergency_requests ADD COLUMN status emergency_status_enum DEFAULT 'pending'::emergency_status_enum;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_requests' AND column_name = 'location') THEN
        ALTER TABLE emergency_requests ADD COLUMN location VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_requests' AND column_name = 'user_id') THEN
        ALTER TABLE emergency_requests ADD COLUMN user_id UUID REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'emergency_requests' AND column_name = 'assigned_to') THEN
        ALTER TABLE emergency_requests ADD COLUMN assigned_to UUID REFERENCES users(id);
    END IF;

    -- Biometric Data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biometric_data' AND column_name = 'user_id') THEN
        ALTER TABLE biometric_data ADD COLUMN user_id UUID REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biometric_data' AND column_name = 'biometric_id') THEN
        ALTER TABLE biometric_data ADD COLUMN biometric_id VARCHAR(255) NOT NULL;
    END IF;
END$$; 