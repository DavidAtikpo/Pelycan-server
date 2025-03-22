const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: 'Accès refusé. Vous devez être administrateur pour accéder à cette ressource.' 
        });
    }
    next();
};

module.exports = { adminMiddleware }; 