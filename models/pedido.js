// models/pedido.js
const pool = require('../config/database');

class Pedido {
  static async create(pedido) {
    const { usuario_id, endereco_id, total, forma_pagamento } = pedido;
    
    const [result] = await pool.query(
      'INSERT INTO pedidos (usuario_id, endereco_id, total, forma_pagamento) VALUES (?, ?, ?, ?)',
      [usuario_id, endereco_id, total, forma_pagamento]
    );
    return result;
  }

  static async addItem(pedido_id, cafe_id, quantidade, preco) {
    const [result] = await pool.query(
      'INSERT INTO pedido_itens (pedido_id, cafe_id, quantidade, preco) VALUES (?, ?, ?, ?)',
      [pedido_id, cafe_id, quantidade, preco]
    );
    return result;
  }

  static async getByUsuarioId(usuario_id) {
    const [rows] = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY created_at DESC',
      [usuario_id]
    );
    return rows;
  }
}

module.exports = Pedido;