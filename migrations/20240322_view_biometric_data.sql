-- Afficher les données biométriques avec les informations utilisateur associées
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    bd.biometric_id,
    bd.created_at as biometric_created_at,
    bd.updated_at as biometric_updated_at
FROM users u
JOIN biometric_data bd ON u.id = bd.user_id
ORDER BY bd.created_at DESC; 