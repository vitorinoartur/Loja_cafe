// routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verifyToken } = require('../middleware/auth');

console.log('Carregando rotas de usuários...');
console.log('usuarioController:', usuarioController);
console.log('usuarioController.registrar:', usuarioController.registrar);

router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);
router.get('/profile', verifyToken, usuarioController.getProfile);

module.exports = router;