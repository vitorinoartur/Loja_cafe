// routes/pedidos.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, pedidoController.create);
router.get('/', verifyToken, pedidoController.getByUsuario);

module.exports = router;