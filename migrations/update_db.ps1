# Charger les variables d'environnement depuis le fichier .env
$envPath = Join-Path $PSScriptRoot "../.env"
Write-Host "Lecture du fichier .env : $envPath"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            Set-Item "env:$key" $value
            Write-Host "$key=$value"
        }
    }
} else {
    Write-Host "Le fichier .env n'existe pas : $envPath"
    exit 1
}

# Vérifier que DATABASE_URL est défini
if (-not $env:DATABASE_URL) {
    Write-Host "La variable DATABASE_URL n'est pas définie dans le fichier .env"
    exit 1
}

# Extraire les informations de connexion de DATABASE_URL
$databaseUrl = $env:DATABASE_URL
Write-Host "DATABASE_URL: $databaseUrl"

try {
    # Vérifier que les fichiers de migration existent
    $migrationsPath = $PSScriptRoot
    $createEnumsFile = Join-Path $migrationsPath "20240322_create_enums.sql"
    $createTablesFile = Join-Path $migrationsPath "20240322_create_tables.sql"
    $fixBiometricDataFile = Join-Path $migrationsPath "20240322_fix_biometric_data.sql"
    $fixUsersTableFile = Join-Path $migrationsPath "20240322_fix_users_table.sql"

    if (-not (Test-Path $createEnumsFile)) {
        Write-Host "Le fichier de migration des types énumérés n'existe pas : $createEnumsFile"
        exit 1
    }

    if (-not (Test-Path $createTablesFile)) {
        Write-Host "Le fichier de migration des tables n'existe pas : $createTablesFile"
        exit 1
    }

    if (-not (Test-Path $fixBiometricDataFile)) {
        Write-Host "Le fichier de correction des données biométriques n'existe pas : $fixBiometricDataFile"
        exit 1
    }

    if (-not (Test-Path $fixUsersTableFile)) {
        Write-Host "Le fichier de correction de la table users n'existe pas : $fixUsersTableFile"
        exit 1
    }

    # Exécuter les migrations
    Write-Host "Exécution des migrations..."
    
    # Exécuter la migration des types énumérés
    Write-Host "Exécution de la migration des types énumérés..."
    $env:PGPASSWORD = $env:DB_PASSWORD
    psql -h $env:DB_HOST -U $env:DB_USER -d $env:DB_NAME -f $createEnumsFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'exécution de la migration des types énumérés"
        exit 1
    }

    # Exécuter la migration des tables
    Write-Host "Exécution de la migration des tables..."
    psql -h $env:DB_HOST -U $env:DB_USER -d $env:DB_NAME -f $createTablesFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'exécution de la migration des tables"
        exit 1
    }

    # Exécuter la correction des données biométriques
    Write-Host "Exécution de la correction des données biométriques..."
    psql -h $env:DB_HOST -U $env:DB_USER -d $env:DB_NAME -f $fixBiometricDataFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'exécution de la correction des données biométriques"
        exit 1
    }

    # Exécuter la correction de la table users
    Write-Host "Exécution de la correction de la table users..."
    psql -h $env:DB_HOST -U $env:DB_USER -d $env:DB_NAME -f $fixUsersTableFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'exécution de la correction de la table users"
        exit 1
    }

    Write-Host "Migrations terminées avec succès!"
    Write-Host "La base de données est prête pour l'application Pelycan"
} catch {
    Write-Host "Une erreur est survenue lors de l'exécution des migrations :"
    Write-Host $_.Exception.Message
    Write-Host $_.ScriptStackTrace
    exit 1
} 