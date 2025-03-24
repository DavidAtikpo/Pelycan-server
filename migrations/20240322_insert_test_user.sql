-- Insérer l'utilisateur avec ses données biométriques
SELECT insert_user_with_biometric(
    'David',
    'atikpododzi4@gmail.com',
    '12345678',
    '+22892591228',
    'biometric_1742835593761_y7r6i0m6x'
);

-- Vérifier que l'insertion a réussi
SELECT * FROM user_biometric_view WHERE email = 'atikpododzi4@gmail.com'; 