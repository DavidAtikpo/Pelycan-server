-- Vérifier la connexion et les permissions
SELECT current_user, current_database();

-- Vérifier les extensions installées
SELECT * FROM pg_extension;

-- Vérifier les types énumérés existants
SELECT t.typname, e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
ORDER BY t.typname, e.enumsortorder;

-- Vérifier les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Vérifier la structure de la table users si elle existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users';

-- Vérifier la connexion à la base de données
SELECT current_database(), current_user, version();

-- Vérifier la structure de la table demandes_ajout_logement
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'demandes_ajout_logement'
ORDER BY ordinal_position;

-- Vérifier la structure de la table dons
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dons'
ORDER BY ordinal_position; 