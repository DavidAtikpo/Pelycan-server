$env:PGPASSWORD = "12345678"
$DbName = "pelycan"
$DbHost = "localhost"
$DbPort = "5432"
$DbUser = "postgres"

Write-Host "Exécution des migrations..."

# Exécuter les migrations dans l'ordre
Write-Host "1. Création des tables principales..."
Get-Content "migrations/20240318_create_tables.sql" | psql -U $dbUser -d $dbName -h $dbHost -p $dbPort

Write-Host "2. Insertion des données de test..."
Get-Content "migrations/20240318_insert_test_data.sql" | psql -U $dbUser -d $dbName -h $dbHost -p $dbPort

Write-Host "3. Ajout des colonnes d'assignation des urgences..."
Get-Content "migrations/20240320_add_emergency_assignment_columns.sql" | psql -U $dbUser -d $dbName -h $dbHost -p $dbPort

Write-Host "4. Ajout de la table des alertes..."
Get-Content "migrations/20240321_add_alerts_table.sql" | psql -U $dbUser -d $dbName -h $dbHost -p $dbPort

Write-Host "Migrations terminées avec succès!"
Write-Host "Base de données prête pour l'application Pelycan!" 