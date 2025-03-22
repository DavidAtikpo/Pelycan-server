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

        // Insérer le nouvel utilisateur
        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, password, phone_number, biometric_data, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, full_name, email',
            [fullName, email, hashedPassword, phoneNumber, biometricData]
        );

        // Générer un token JWT
        const token = jwt.sign(
            { userId: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                user: {
                    id: newUser.rows[0].id,
                    fullName: newUser.rows[0].full_name,
                    email: newUser.rows[0].email
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

module.exports = {
    register,
    login,
    googleSignIn
};
