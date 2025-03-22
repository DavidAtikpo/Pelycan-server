const { pool } = require('../config/dbConfig');
const bcrypt = require('bcrypt');

class RegisterModel {
    // Vérifier si un utilisateur existe déjà
    static async checkUserExists(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows.length > 0;
    }

    // Créer un nouvel utilisateur
    static async createUser(userData) {
        const { fullName, email, password, phoneNumber, biometricData } = userData;
        
        try {
            // Hasher le mot de passe
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Requête SQL pour insérer un nouvel utilisateur avec UUID
            const query = `
                INSERT INTO users (
                    full_name, 
                    email, 
                    password, 
                    phone_number, 
                    biometric_data, 
                    created_at
                ) 
                VALUES ($1, $2, $3, $4, $5, NOW()) 
                RETURNING id, full_name, email
            `;

            const values = [
                fullName,
                email,
                hashedPassword,
                phoneNumber,
                biometricData
            ];

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw new Error('Erreur lors de la création de l\'utilisateur');
        }
    }

    // Créer ou mettre à jour un utilisateur Google
    static async createOrUpdateGoogleUser(googleData) {
        const { email, fullName, googleId } = googleData;

        try {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                // Mettre à jour l'utilisateur existant
                const query = `
                    UPDATE users 
                    SET google_id = $1, 
                        full_name = $2,
                        updated_at = NOW()
                    WHERE email = $3
                    RETURNING id, full_name, email
                `;
                const result = await pool.query(query, [googleId, fullName, email]);
                return result.rows[0];
            } else {
                // Créer un nouvel utilisateur avec UUID généré automatiquement
                const query = `
                    INSERT INTO users (
                        full_name, 
                        email, 
                        google_id, 
                        created_at
                    ) 
                    VALUES ($1, $2, $3, NOW()) 
                    RETURNING id, full_name, email
                `;
                const result = await pool.query(query, [fullName, email, googleId]);
                return result.rows[0];
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de l\'utilisateur Google:', error);
            throw new Error('Erreur lors de la gestion de l\'utilisateur Google');
        }
    }
}

module.exports = RegisterModel;
