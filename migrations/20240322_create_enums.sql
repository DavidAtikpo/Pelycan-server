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
ALTER TABLE cases ALTER COLUMN priority DROP DEFAULT;
ALTER TABLE cases ALTER COLUMN status DROP DEFAULT;

-- Convertir les colonnes
ALTER TABLE users 
    ALTER COLUMN role TYPE user_role_enum USING 
        CASE 
            WHEN role IS NULL THEN 'user'::user_role_enum
            WHEN role::text = 'user' THEN 'user'::user_role_enum
            WHEN role::text = 'pro' THEN 'pro'::user_role_enum
            WHEN role::text = 'admin' THEN 'admin'::user_role_enum
            ELSE 'user'::user_role_enum
        END,
    ALTER COLUMN status TYPE user_status_enum USING 
        CASE 
            WHEN status IS NULL THEN 'active'::user_status_enum
            WHEN status::text = 'active' THEN 'active'::user_status_enum
            WHEN status::text = 'pending' THEN 'pending'::user_status_enum
            WHEN status::text = 'inactive' THEN 'inactive'::user_status_enum
            ELSE 'active'::user_status_enum
        END;

ALTER TABLE cases 
    ALTER COLUMN priority TYPE case_priority_enum USING 
        CASE 
            WHEN priority IS NULL THEN 'medium'::case_priority_enum
            WHEN priority::text = 'high' THEN 'high'::case_priority_enum
            WHEN priority::text = 'medium' THEN 'medium'::case_priority_enum
            WHEN priority::text = 'low' THEN 'low'::case_priority_enum
            ELSE 'medium'::case_priority_enum
        END,
    ALTER COLUMN status TYPE case_status_enum USING 
        CASE 
            WHEN status IS NULL THEN 'new'::case_status_enum
            WHEN status::text = 'new' THEN 'new'::case_status_enum
            WHEN status::text = 'assigned' THEN 'assigned'::case_status_enum
            WHEN status::text = 'in_progress' THEN 'in_progress'::case_status_enum
            WHEN status::text = 'completed' THEN 'completed'::case_status_enum
            ELSE 'new'::case_status_enum
        END;

ALTER TABLE alerts 
    ALTER COLUMN status TYPE alert_status_enum USING 
        CASE 
            WHEN status IS NULL THEN 'active'::alert_status_enum
            WHEN status::text = 'active' THEN 'active'::alert_status_enum
            WHEN status::text = 'processed' THEN 'processed'::alert_status_enum
            WHEN status::text = 'closed' THEN 'closed'::alert_status_enum
            ELSE 'active'::alert_status_enum
        END;

ALTER TABLE emergency_requests 
    ALTER COLUMN status TYPE emergency_status_enum USING 
        CASE 
            WHEN status IS NULL THEN 'pending'::emergency_status_enum
            WHEN status::text = 'pending' THEN 'pending'::emergency_status_enum
            WHEN status::text = 'assigned' THEN 'assigned'::emergency_status_enum
            WHEN status::text = 'in_progress' THEN 'in_progress'::emergency_status_enum
            WHEN status::text = 'completed' THEN 'completed'::emergency_status_enum
            ELSE 'pending'::emergency_status_enum
        END;

-- Remettre les valeurs par défaut
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'::user_role_enum;
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active'::user_status_enum;
ALTER TABLE alerts ALTER COLUMN status SET DEFAULT 'active'::alert_status_enum;
ALTER TABLE emergency_requests ALTER COLUMN status SET DEFAULT 'pending'::emergency_status_enum;
ALTER TABLE cases ALTER COLUMN priority SET DEFAULT 'medium'::case_priority_enum;
ALTER TABLE cases ALTER COLUMN status SET DEFAULT 'new'::case_status_enum; 