const express = require('express');
const router = express.Router();
const { register, login, googleSignIn, biometricLogin } = require('../controllers/authenticate');

// Routes existantes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);

// Nouvelle route pour la connexion biométrique
router.post('/biometric-login', biometricLogin);

module.exports = router; 