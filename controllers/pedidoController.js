// controllers/pedidoController.js
const Pedido = require('../models/pedido');

exports.create = async (req, res) => {
  try {
    const { endereco_id, itens, forma_pagamento } = req.body;
    
    const total = itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    const result = await Pedido.create({
      usuario_id: req.user.id,
      endereco_id,
      total,
      forma_pagamento
    });

    for (const item of itens) {
      await Pedido.addItem(result.insertId, item.cafe_id, item.quantidade, item.preco);
    }

    res.status(201).json({ pedido_id: result.insertId, total });
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getByUsuario = async (req, res) => {
  try {
    const pedidos = await Pedido.getByUsuarioId(req.user.id);
    res.json(pedidos);
  } catch (err) {
    console.error('Erro ao obter pedidos:', err);
    res.status(500).json({ error: err.message });
  }
};