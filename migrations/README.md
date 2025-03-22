# Migrations de la Base de Données Pelycan

Ce dossier contient les scripts de migration pour créer et maintenir la structure de la base de données PostgreSQL utilisée par l'application Pelycan.

## Structure de la Base de Données

La base de données Pelycan est conçue pour gérer les données suivantes :

1. **Structures d'accueil** (table `structures`) : centres d'accueil, foyers, centres d'hébergement
2. **Logements disponibles** (table `logements`) : appartements, maisons, studios
3. **Hébergements temporaires** (table `hebergements_temporaires`) : lieux d'hébergement d'urgence
4. **Demandes** (table `demandes`) : demandes de logement ou d'hébergement
5. **Messages** (table `messages`) : messages envoyés aux structures

## Tables Principales

### Table `structures`

Stocke les informations sur les structures d'accueil et d'hébergement.

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique (clé primaire) |
| nom | VARCHAR(255) | Nom de la structure |
| description | TEXT | Description détaillée |
| adresse | TEXT | Adresse postale |
| ville | VARCHAR(100) | Ville |
| code_postal | VARCHAR(10) | Code postal |
| telephone | VARCHAR(20) | Numéro de téléphone |
| email | VARCHAR(100) | Adresse email |
| type | VARCHAR(50) | Type de structure (centre_accueil, foyer, centre_hebergement, autre) |
| capacite | INTEGER | Capacité d'accueil |
| services | TEXT | Services proposés |
| horaires | TEXT | Horaires d'ouverture |
| image_url | TEXT | URL de l'image de la structure |
| actif | BOOLEAN | Indique si la structure est active |
| date_creation | TIMESTAMP | Date de création de l'enregistrement |
| date_modification | TIMESTAMP | Date de dernière modification |

### Table `logements`

Stocke les informations sur les logements disponibles.

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique (clé primaire) |
| titre | VARCHAR(255) | Titre du logement |
| description | TEXT | Description détaillée |
| adresse | TEXT | Adresse postale |
| ville | VARCHAR(100) | Ville |
| code_postal | VARCHAR(10) | Code postal |
| nombre_pieces | INTEGER | Nombre de pièces |
| superficie | NUMERIC(10, 2) | Superficie en m² |
| loyer | NUMERIC(10, 2) | Montant du loyer en euros |
| charges | NUMERIC(10, 2) | Montant des charges en euros |
| disponibilite | DATE | Date de disponibilité |
| type_logement | VARCHAR(50) | Type de logement (studio, appartement, maison) |
| image_url | TEXT | URL de l'image du logement |
| disponible | BOOLEAN | Indique si le logement est disponible |
| date_creation | TIMESTAMP | Date de création de l'enregistrement |
| date_modification | TIMESTAMP | Date de dernière modification |

### Table `hebergements_temporaires`

Stocke les informations sur les hébergements temporaires d'urgence.

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique (clé primaire) |
| nom | VARCHAR(255) | Nom de l'hébergement |
| description | TEXT | Description détaillée |
| adresse | TEXT | Adresse postale |
| ville | VARCHAR(100) | Ville |
| code_postal | VARCHAR(10) | Code postal |
| places_disponibles | INTEGER | Nombre de places disponibles |
| type_hebergement | VARCHAR(50) | Type d'hébergement (urgence, temporaire, longue_duree) |
| duree_max_sejour | VARCHAR(50) | Durée maximale de séjour |
| public_cible | TEXT | Public ciblé |
| conditions_acces | TEXT | Conditions d'accès |
| services_inclus | TEXT | Services inclus |
| image_url | TEXT | URL de l'image de l'hébergement |
| disponible | BOOLEAN | Indique si l'hébergement est disponible |
| date_creation | TIMESTAMP | Date de création de l'enregistrement |
| date_modification | TIMESTAMP | Date de dernière modification |

### Table `demandes`

Stocke les demandes de logement ou d'hébergement.

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique (clé primaire) |
| nom | VARCHAR(100) | Nom du demandeur |
| prenom | VARCHAR(100) | Prénom du demandeur |
| telephone | VARCHAR(20) | Numéro de téléphone |
| email | VARCHAR(100) | Adresse email |
| nombre_personnes | VARCHAR(50) | Nombre de personnes concernées |
| niveau_urgence | VARCHAR(50) | Niveau d'urgence de la demande |
| message | TEXT | Message ou information supplémentaire |
| logement_id | UUID | Référence au logement demandé (si applicable) |
| centre_type | VARCHAR(50) | Type de centre demandé (si applicable) |
| type | VARCHAR(20) | Type de demande (logement ou hebergement) |
| status | VARCHAR(20) | Statut de la demande (en_attente, en_cours, acceptee, refusee, annulee) |
| date_creation | TIMESTAMP | Date de création de l'enregistrement |
| date_modification | TIMESTAMP | Date de dernière modification |

### Table `messages`

Stocke les messages envoyés aux structures.

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique (clé primaire) |
| structure_id | UUID | Référence à la structure destinataire |
| message | TEXT | Contenu du message |
| date | TIMESTAMP | Date du message |
| lu | BOOLEAN | Indique si le message a été lu |
| date_creation | TIMESTAMP | Date de création de l'enregistrement |
| date_modification | TIMESTAMP | Date de dernière modification |

## Exécution des Migrations

### Sous Windows (PowerShell)

```powershell
./update_db.ps1
```

### Sous Linux/macOS (Bash)

```bash
chmod +x update_db.sh
./update_db.sh
```

## Ordre des Migrations

1. `20240318_create_tables.sql` - Création des tables principales
2. `20240318_insert_test_data.sql` - Insertion de données de test
3. `20240320_add_emergency_assignment_columns.sql` - Ajout de colonnes spécifiques pour les urgences

## Remarques

- Les UUID sont générés automatiquement pour chaque nouvel enregistrement
- Les dates de création (`date_creation`) sont automatiquement définies à la date et l'heure actuelles
- Les champs booléens (`actif`, `disponible`, `lu`) ont des valeurs par défaut
- Des index ont été créés pour optimiser les requêtes fréquentes 