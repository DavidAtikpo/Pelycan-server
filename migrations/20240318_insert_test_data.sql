-- Migration: insertion des données de test
-- Date: 2024-03-18

-- Insertion de structures de test

-- Centres d'accueil
INSERT INTO structures (nom, description, adresse, ville, code_postal, telephone, email, type, capacite, services, horaires, image_url) 
VALUES 
(
    'Centre d''Accueil d''Urgence Paris', 
    'Centre d''accueil pour les personnes en situation d''urgence sociale à Paris',
    '24 Rue de la Solidarité', 
    'Paris', 
    '75013', 
    '01 45 67 89 10', 
    'contact@cau-paris.fr', 
    'centre_accueil', 
    50, 
    'Douches, repas, assistance sociale, soutien psychologique',
    'Ouvert 7j/7 de 9h à 21h',
    'https://example.com/images/cau-paris.jpg'
),
(
    'Centre SOS Hébergement Lyon', 
    'Accueil et orientation des personnes sans domicile fixe',
    '12 Avenue des Solidarités', 
    'Lyon', 
    '69003', 
    '04 72 33 44 55', 
    'contact@sos-hebergement.org', 
    'centre_accueil', 
    35, 
    'Repas, conseils juridiques, accompagnement social, vestiaire',
    'Ouvert du lundi au vendredi de 8h30 à 19h',
    'https://example.com/images/sos-lyon.jpg'
);

-- Foyers
INSERT INTO structures (nom, description, adresse, ville, code_postal, telephone, email, type, capacite, services, horaires, image_url) 
VALUES 
(
    'Foyer Jeunes Travailleurs Marseille', 
    'Hébergement temporaire pour jeunes travailleurs et apprentis',
    '55 Boulevard de l''Avenir', 
    'Marseille', 
    '13008', 
    '04 91 22 33 44', 
    'contact@fjt-marseille.fr', 
    'foyer', 
    80, 
    'Chambres individuelles, espaces communs, accompagnement professionnel',
    'Accueil 24h/24',
    'https://example.com/images/fjt-marseille.jpg'
),
(
    'Foyer Familial Bordeaux', 
    'Hébergement pour familles en difficulté temporaire',
    '8 Rue de l''Espoir', 
    'Bordeaux', 
    '33000', 
    '05 56 78 90 12', 
    'accueil@foyer-familial33.fr', 
    'foyer', 
    60, 
    'Appartements familiaux, espace enfants, soutien parental',
    'Permanence téléphonique 24h/24',
    'https://example.com/images/foyer-bordeaux.jpg'
);

-- Centres d'hébergement
INSERT INTO structures (nom, description, adresse, ville, code_postal, telephone, email, type, capacite, services, horaires, image_url) 
VALUES 
(
    'CHRS Nouveau Départ', 
    'Centre d''Hébergement et de Réinsertion Sociale pour adultes isolés',
    '42 Rue du Renouveau', 
    'Lille', 
    '59000', 
    '03 20 45 67 89', 
    'contact@nouveau-depart.org', 
    'centre_hebergement', 
    65, 
    'Hébergement individuel, accompagnement social global, insertion professionnelle',
    'Accueil administratif de 9h à 17h',
    'https://example.com/images/chrs-lille.jpg'
),
(
    'Maison Relais Nantes', 
    'Hébergement durable pour personnes en grande précarité',
    '17 Rue de la Fraternité', 
    'Nantes', 
    '44000', 
    '02 40 12 34 56', 
    'contact@maison-relais.fr', 
    'centre_hebergement', 
    40, 
    'Studios autonomes, espaces collectifs, animations, médiation',
    'Présence d''encadrants 7j/7',
    'https://example.com/images/maison-relais.jpg'
);

-- Insertion de logements de test
INSERT INTO logements (titre, description, adresse, ville, code_postal, nombre_pieces, superficie, loyer, charges, disponibilite, type_logement, image_url) 
VALUES 
(
    'Studio meublé Paris 18ème', 
    'Studio entièrement rénové et meublé dans le 18ème arrondissement',
    '78 Rue des Poissonniers', 
    'Paris', 
    '75018', 
    1, 
    22.5, 
    650.00, 
    80.00, 
    '2024-04-01', 
    'studio', 
    'https://example.com/images/studio-paris18.jpg'
),
(
    'T2 Quartier des Chartrons', 
    'Appartement T2 lumineux dans quartier dynamique',
    '24 Rue Notre Dame', 
    'Bordeaux', 
    '33000', 
    2, 
    45.0, 
    700.00, 
    90.00, 
    '2024-03-15', 
    'appartement', 
    'https://example.com/images/t2-bordeaux.jpg'
),
(
    'Maison T3 proche centre-ville', 
    'Petite maison avec jardin idéale pour famille',
    '5 Rue des Lilas', 
    'Toulouse', 
    '31000', 
    3, 
    75.0, 
    950.00, 
    120.00, 
    '2024-05-01', 
    'maison', 
    'https://example.com/images/maison-toulouse.jpg'
),
(
    'Studio étudiant Lyon Part-Dieu', 
    'Studio confortable pour étudiant près du campus',
    '35 Avenue Félix Faure', 
    'Lyon', 
    '69003', 
    1, 
    18.0, 
    450.00, 
    60.00, 
    '2024-03-20', 
    'studio', 
    'https://example.com/images/studio-lyon.jpg'
),
(
    'T4 familial avec balcon', 
    'Grand appartement familial avec balcon et vue dégagée',
    '12 Boulevard Victor Hugo', 
    'Nice', 
    '06000', 
    4, 
    85.0, 
    1200.00, 
    150.00, 
    '2024-04-15', 
    'appartement', 
    'https://example.com/images/t4-nice.jpg'
);

-- Insertion d'hébergements temporaires de test
INSERT INTO hebergements_temporaires (nom, description, adresse, ville, code_postal, places_disponibles, type_hebergement, duree_max_sejour, public_cible, conditions_acces, services_inclus, image_url) 
VALUES 
(
    'Centre d''Hébergement d''Urgence Paris', 
    'Hébergement d''urgence ouvert à tous',
    '10 Rue de l''Asile', 
    'Paris', 
    '75020', 
    25, 
    'urgence', 
    '15 jours', 
    'Tout public majeur', 
    'Priorité aux personnes à la rue',
    'Lit, repas, douche, accompagnement social',
    'https://example.com/images/chu-paris.jpg'
),
(
    'Centre d''Accueil Temporaire Femmes', 
    'Centre réservé aux femmes isolées ou avec enfants',
    '8 Rue Marie Curie', 
    'Lyon', 
    '69007', 
    18, 
    'temporaire', 
    '3 mois', 
    'Femmes isolées ou avec enfants', 
    'Sur orientation sociale uniquement',
    'Chambre individuelle, repas, accompagnement global, soutien à la parentalité',
    'https://example.com/images/cat-femmes.jpg'
),
(
    'Pension de Famille Marseille', 
    'Hébergement durable pour personnes isolées',
    '22 Boulevard National', 
    'Marseille', 
    '13003', 
    30, 
    'longue_duree', 
    '2 ans', 
    'Personnes isolées en rupture sociale', 
    'Admission sur dossier après entretien',
    'Logement autonome, animations collectives, référent social',
    'https://example.com/images/pension-famille.jpg'
),
(
    'Centre Hivernal d''Urgence', 
    'Centre ouvert pendant la période hivernale',
    '5 Rue des Glacières', 
    'Strasbourg', 
    '67000', 
    40, 
    'urgence', 
    'Nuitée', 
    'Tout public', 
    'Accueil inconditionnel',
    'Lit, soupe chaude, douche',
    'https://example.com/images/chu-hiver.jpg'
),
(
    'Résidence Sociale Jeunes', 
    'Hébergement temporaire pour jeunes en insertion',
    '18 Rue de l''Avenir', 
    'Nantes', 
    '44000', 
    45, 
    'temporaire', 
    '1 an', 
    'Jeunes 18-30 ans en insertion professionnelle', 
    'Sur dossier, ressources minimum requises',
    'Studio équipé, accompagnement professionnel, salles communes',
    'https://example.com/images/residence-jeunes.jpg'
);

-- Insertion de demandes de test
INSERT INTO demandes (nom, prenom, telephone, email, nombre_personnes, niveau_urgence, message, logement_id, type, status) 
VALUES 
(
    'Dupont', 
    'Thomas', 
    '06 12 34 56 78', 
    'thomas.dupont@email.com', 
    '1 adulte', 
    'Modérée', 
    'Je recherche un logement rapidement suite à une séparation',
    (SELECT id FROM logements WHERE titre = 'Studio meublé Paris 18ème' LIMIT 1), 
    'logement',
    'en_attente'
),
(
    'Martin', 
    'Sophie', 
    '07 65 43 21 09', 
    'sophie.martin@email.com', 
    '1 adulte et 2 enfants', 
    'Élevée', 
    'Situation d''expulsion imminente, recherche hébergement d''urgence pour ma famille',
    NULL, 
    'hebergement',
    'en_cours'
),
(
    'Petit', 
    'Marc', 
    '06 78 90 12 34', 
    'marc.petit@email.com', 
    '1 adulte', 
    'Faible', 
    'Je souhaite quitter ma colocation dans 2 mois',
    (SELECT id FROM logements WHERE titre = 'T2 Quartier des Chartrons' LIMIT 1), 
    'logement',
    'en_attente'
),
(
    'Leroy', 
    'Julie', 
    '07 23 45 67 89', 
    'julie.leroy@email.com', 
    '1 adulte', 
    'Élevée', 
    'Sans domicile fixe depuis 2 semaines, besoin urgent d''un hébergement',
    NULL, 
    'hebergement',
    'acceptee'
),
(
    'Bernard', 
    'Nicolas', 
    '06 56 78 90 12', 
    'nicolas.bernard@email.com', 
    '2 adultes et 1 enfant', 
    'Modérée', 
    'Recherche logement plus grand pour accueillir notre enfant',
    (SELECT id FROM logements WHERE titre = 'T4 familial avec balcon' LIMIT 1), 
    'logement',
    'en_attente'
);

-- Insertion de messages de test
INSERT INTO messages (structure_id, message, date, lu) 
VALUES 
(
    (SELECT id FROM structures WHERE nom = 'Centre d''Accueil d''Urgence Paris' LIMIT 1),
    'Bonjour, je souhaiterais savoir si vous acceptez les animaux domestiques dans votre centre. Merci.',
    NOW() - INTERVAL '3 days',
    true
),
(
    (SELECT id FROM structures WHERE nom = 'Foyer Jeunes Travailleurs Marseille' LIMIT 1),
    'Bonjour, quelles sont les démarches pour obtenir une place dans votre foyer? Je suis un jeune travailleur de 23 ans.',
    NOW() - INTERVAL '2 days',
    false
),
(
    (SELECT id FROM structures WHERE nom = 'CHRS Nouveau Départ' LIMIT 1),
    'Je souhaite plus d''informations sur les conditions d''admission dans votre centre. Merci de me recontacter.',
    NOW() - INTERVAL '5 days',
    true
),
(
    (SELECT id FROM structures WHERE nom = 'Maison Relais Nantes' LIMIT 1),
    'Bonjour, j''aimerais savoir quel est le délai d''attente actuel pour une place dans votre structure? Ma situation est urgente.',
    NOW() - INTERVAL '1 day',
    false
),
(
    (SELECT id FROM structures WHERE nom = 'Centre SOS Hébergement Lyon' LIMIT 1),
    'Bonjour, pouvez-vous me dire quels documents sont nécessaires pour constituer un dossier? Cordialement.',
    NOW(),
    false
); 