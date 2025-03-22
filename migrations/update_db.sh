#!/bin/bash

# Configuration de la base de données
export PGPASSWORD="12345678"
DB_NAME="pelycan"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"

# Rendre ce script exécutable
# chmod +x update_db.sh

echo "Exécution des migrations..."

# Exécuter les migrations dans l'ordre
echo "1. Création des tables principales..."
psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -f migrations/20240318_create_tables.sql

echo "2. Insertion des données de test..."
psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -f migrations/20240318_insert_test_data.sql

echo "3. Ajout des colonnes d'assignation des urgences..."
psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -f migrations/20240320_add_emergency_assignment_columns.sql

echo "Migrations terminées avec succès!"
echo "Base de données prête pour l'application Pelycan!" 