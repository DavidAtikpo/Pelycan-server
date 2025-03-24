const { pool } = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fonction pour créer un nouvel utilisateur
const register = async (req, res) => {
    const { fullName, email, password, phoneNumber, biometricData } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Un compte existe déjà avec cet email'
            });
        }

        // Hasher le mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insérer le nouvel utilisateur avec les données biométriques
        const newUser = await pool.query(
            `SELECT insert_user_with_biometric($1, $2, $3, $4, $5, $6::user_role_enum, $7::user_status_enum)`,
            [fullName, email, hashedPassword, phoneNumber, biometricData, 'user', 'active']
        );

        // Récupérer les informations de l'utilisateur créé
        const userResult = await pool.query(
            `SELECT id, first_name, last_name, email, role, status 
             FROM users 
             WHERE id = $1`,
            [newUser.rows[0].insert_user_with_biometric]
        );

        const user = userResult.rows[0];

        // Générer un token JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                user: {
                    id: user.id,
                    fullName: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    role: user.role,
                    status: user.status
                },
                token
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription'
        });
    }
};

// Fonction pour la connexion
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        const user = userResult.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        const token = jwt.sign(
            { 
                userId: user.id,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Déterminer le chemin de redirection selon le rôle
        let redirectPath = '/(app)/HomeScreen';
        if (user.role === 'admin') redirectPath = '/(admin)/DashboardScreen';
        if (user.role === 'pro') redirectPath = '/(pro)/DashboardScreen';

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                    role: user.role
                },
                token,
                redirectPath // Inclure le chemin de redirection dans la réponse
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
};

// Fonction pour la connexion Google
const googleSignIn = async (req, res) => {
    const { id_token } = req.body;

    try {
        // Vérifier le token avec l'API Google (à implémenter)
        // Créer ou mettre à jour l'utilisateur dans la base de données
        // Générer un token JWT

        res.status(200).json({
            success: true,
            message: 'Connexion Google réussie',
            // Ajouter les données de l'utilisateur et le token
        });

    } catch (error) {
        console.error('Erreur lors de la connexion Google:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion Google'
        });
    }
};

const biometricLogin = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Tentative de connexion biométrique pour:', email);

        // Vérifier si l'utilisateur existe
        const userQuery = await pool.query(
            `SELECT u.*, bd.biometric_id 
             FROM users u 
             LEFT JOIN biometric_data bd ON u.id = bd.user_id 
             WHERE u.email = $1`,
            [email]
        );

        console.log('Résultat de la requête utilisateur:', userQuery.rows);

        if (userQuery.rows.length === 0) {
            console.log('Utilisateur non trouvé pour l\'email:', email);
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        const user = userQuery.rows[0];
        console.log('Données utilisateur trouvées:', {
            id: user.id,
            email: user.email,
            has_biometric: !!user.biometric_id
        });

        // Vérifier si l'utilisateur a des données biométriques
        if (!user.biometric_id) {
            console.log('Pas de données biométriques pour l\'utilisateur:', user.id);
            return res.status(401).json({
                success: false,
                message: 'Aucune donnée biométrique trouvée pour cet utilisateur'
            });
        }

        // Générer le token JWT
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Déterminer le chemin de redirection selon le rôle
        let redirectPath = '/(app)/HomeScreen';
        if (user.role === 'admin') redirectPath = '/(admin)/DashboardScreen';
        if (user.role === 'pro') redirectPath = '/(pro)/DashboardScreen';

        console.log('Connexion biométrique réussie pour:', user.email);

        // Retourner les informations de l'utilisateur
        res.json({
            success: true,
            message: 'Connexion biométrique réussie',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: `${user.first_name} ${user.last_name}`,
                    status: user.status
                },
                redirectPath
            }
        });

    } catch (error) {
        console.error('Erreur détaillée lors de la connexion biométrique:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion biométrique: ' + error.message
        });
    }
};

module.exports = {
    register,
    login,
    googleSignIn,
    biometricLogin
};
