-- Tester l'insertion avec les données fournies
SELECT insert_user_with_biometric(
    'David',
    'atikpododzi4@gmail.com',
    '$2b$10$YourHashedPasswordHere', -- Le mot de passe sera hashé par l'API
    '+22892591228',
    'biometric_1742835593761_y7r6i0m6x'
);

-- Vérifier que l'insertion a réussi
SELECT * FROM user_biometric_view WHERE email = 'atikpododzi4@gmail.com';

-- Vérifier les données biométriques
SELECT * FROM biometric_data WHERE user_id = (
    SELECT id FROM users WHERE email = 'atikpododzi4@gmail.com'
); 