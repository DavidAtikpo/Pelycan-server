-- Fonction pour insérer un utilisateur avec ses données biométriques
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
    v_first_name VARCHAR;
    v_last_name VARCHAR;
BEGIN
    -- Diviser le nom complet en prénom et nom
    v_first_name := SPLIT_PART(p_full_name, ' ', 1);
    v_last_name := SUBSTRING(p_full_name FROM POSITION(' ' IN p_full_name) + 1);

    -- Insérer l'utilisateur
    INSERT INTO users (
        id,
        first_name,
        last_name,
        email,
        password,
        phone_number,
        role,
        status,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_first_name,
        v_last_name,
        p_email,
        p_password,
        p_phone_number,
        p_role,
        p_status,
        NOW()
    ) RETURNING id INTO v_user_id;

    -- Insérer les données biométriques
    INSERT INTO biometric_data (
        user_id,
        biometric_id,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        p_biometric_id,
        NOW(),
        NOW()
    );

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Créer une vue pour faciliter la consultation des données utilisateur avec biométrie
CREATE OR REPLACE VIEW user_biometric_view AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number,
    u.role,
    u.status,
    bd.biometric_id,
    bd.created_at as biometric_created_at,
    bd.updated_at as biometric_updated_at
FROM users u
LEFT JOIN biometric_data bd ON u.id = bd.user_id; 