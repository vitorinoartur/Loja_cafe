// routes/enderecos.js
const express = require('express');
const router = express.Router();
const enderecoController = require('../controllers/enderecoController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, enderecoController.create);
router.get('/', verifyToken, enderecoController.getByUsuario);

module.exports = router;