const jwt = require('jsonwebtoken');
const { pool } = require('../config/dbConfig');

const authMiddleware = async (req, res, next) => {
    try {
        // Vérifier si le token est présent dans les headers
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token d\'authentification manquant' });
        }

        // Extraire le token du header (format: "Bearer <token>")
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Format de token invalide' });
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier si l'utilisateur existe toujours en base de données
        const query = 'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1';
        const result = await pool.query(query, [decoded.userId]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Ajouter les informations de l'utilisateur à l'objet request
        req.user = {
            id: result.rows[0].id,
            email: result.rows[0].email,
            role: result.rows[0].role,
            name: `${result.rows[0].first_name} ${result.rows[0].last_name}`
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Token invalide' });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expiré' });
        }
        console.error('Erreur d\'authentification:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

// Middleware pour vérifier les rôles
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Non authentifié' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Accès non autorisé pour ce rôle' 
            });
        }

        next();
    };
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const adminMiddleware = checkRole(['admin']);

module.exports = {
    authMiddleware,
    checkRole,
    adminMiddleware
}; 