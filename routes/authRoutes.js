const express = require('express');
const router = express.Router();
const { register, login, googleSignIn, biometricLogin } = require('../controllers/authenticate');

// Route pour l'inscription
router.post('/register', register);

// Route pour la connexion
router.post('/login', login);

// Route pour la connexion Google
router.post('/google', googleSignIn);

// Route pour la connexion biométrique
router.post('/biometric-login', biometricLogin);

module.exports = router;
