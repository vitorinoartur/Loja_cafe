// models/cafe.js
const pool = require('../config/database');

class Cafe {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM cafes ORDER BY nome');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM cafes WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(cafe) {
    const { nome, categoria, descricao, preco, imagem, torra, intensidade, estoque } = cafe;
    const [result] = await pool.query(
      'INSERT INTO cafes (nome, categoria, descricao, preco, imagem, torra, intensidade, estoque) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, categoria, descricao, preco, imagem, torra, intensidade, estoque]
    );
    return result;
  }

  static async update(id, cafe) {
    const { nome, categoria, descricao, preco, imagem, torra, intensidade, estoque } = cafe;
    const [result] = await pool.query(
      'UPDATE cafes SET nome = ?, categoria = ?, descricao = ?, preco = ?, imagem = ?, torra = ?, intensidade = ?, estoque = ? WHERE id = ?',
      [nome, categoria, descricao, preco, imagem, torra, intensidade, estoque, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM cafes WHERE id = ?', [id]);
    return result;
  }
}

module.exports = Cafe;