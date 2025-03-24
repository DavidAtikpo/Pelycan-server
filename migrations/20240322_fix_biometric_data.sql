-- Supprimer la colonne biometric_data de la table users si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'biometric_data'
    ) THEN
        ALTER TABLE users DROP COLUMN biometric_data;
    END IF;
END$$;

-- Créer une fonction pour gérer l'insertion des données biométriques
CREATE OR REPLACE FUNCTION insert_user_with_biometric(
    p_full_name VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR,
    p_phone_number VARCHAR,
    p_biometric_id VARCHAR,
    p_role user_role_enum DEFAULT 'user'::user_role_enum,
    p_status user_status_enum DEFAULT 'active'::user_status_enum
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Insérer l'utilisateur
    INSERT INTO users (
        first_name,
        last_name,
        email,
        password,
        phone_number,
        role,
        status
    ) VALUES (
        SPLIT_PART(p_full_name, ' ', 1),
        SPLIT_PART(p_full_name, ' ', 2),
        p_email,
        p_password,
        p_phone_number,
        p_role,
        p_status
    ) RETURNING id INTO v_user_id;

    -- Insérer les données biométriques
    INSERT INTO biometric_data (user_id, biometric_id)
    VALUES (v_user_id, p_biometric_id);

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql; 