// models/endereco.js
const pool = require('../config/database');

class Endereco {
  static async create(endereco) {
    const { usuario_id, cep, rua, numero, complemento, bairro, cidade, estado } = endereco;
    
    const [result] = await pool.query(
      'INSERT INTO enderecos (usuario_id, cep, rua, numero, complemento, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [usuario_id, cep, rua, numero, complemento, bairro, cidade, estado]
    );
    return result;
  }

  static async getByUsuarioId(usuario_id) {
    const [rows] = await pool.query(
      'SELECT * FROM enderecos WHERE usuario_id = ?',
      [usuario_id]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM enderecos WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = Endereco;