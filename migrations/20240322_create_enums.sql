-- Créer les types ENUM nécessaires
DO $$
BEGIN
    -- Users
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('user', 'pro', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
        CREATE TYPE user_status_enum AS ENUM ('active', 'pending', 'inactive');
    END IF;

    -- Cases
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_priority_enum') THEN
        CREATE TYPE case_priority_enum AS ENUM ('high', 'medium', 'low');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status_enum') THEN
        CREATE TYPE case_status_enum AS ENUM ('new', 'assigned', 'in_progress', 'completed');
    END IF;

    -- Alerts
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_status_enum') THEN
        CREATE TYPE alert_status_enum AS ENUM ('active', 'processed', 'closed');
    END IF;

    -- Emergency Requests
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emergency_status_enum') THEN
        CREATE TYPE emergency_status_enum AS ENUM ('pending', 'assigned', 'in_progress', 'completed');
    END IF;
END$$;

-- Supprimer les valeurs par défaut
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
ALTER TABLE alerts ALTER COLUMN status DROP DEFAULT;
ALTER TABLE emergency_requests ALTER COLUMN status DROP DEFAULT;

-- Convertir les colonnes
ALTER TABLE users 
    ALTER COLUMN role TYPE user_role_enum USING role::user_role_enum,
    ALTER COLUMN status TYPE user_status_enum USING status::user_status_enum;

ALTER TABLE cases 
    ALTER COLUMN priority TYPE case_priority_enum USING priority::case_priority_enum,
    ALTER COLUMN status TYPE case_status_enum USING status::case_status_enum;

ALTER TABLE alerts 
    ALTER COLUMN status TYPE alert_status_enum USING status::alert_status_enum;

ALTER TABLE emergency_requests 
    ALTER COLUMN status TYPE emergency_status_enum USING status::emergency_status_enum;

-- Remettre les valeurs par défaut
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::user_role_enum;
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active'::user_status_enum;
ALTER TABLE alerts ALTER COLUMN status SET DEFAULT 'active'::alert_status_enum;
ALTER TABLE emergency_requests ALTER COLUMN status SET DEFAULT 'pending'::emergency_status_enum; 