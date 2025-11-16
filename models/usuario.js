// models/usuario.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  static async create(usuario) {
    const { username, email, senha, telefone } = usuario;
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const [result] = await pool.query(
      'INSERT INTO usuarios (username, email, password, telefone) VALUES (?, ?, ?, ?)',
      [username, email, senhaHash, telefone]
    );
    return result;
  }

  static async getByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async getByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, telefone, created_at FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async comparePassword(senha, senhaHash) {
    return await bcrypt.compare(senha, senhaHash);
  }

  static async emailExists(email) {
    const [rows] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    return rows.length > 0;
  }

  static async usernameExists(username) {
    const [rows] = await pool.query(
      'SELECT id FROM usuarios WHERE username = ?',
      [username]
    );
    return rows.length > 0;
  }
}

module.exports = Usuario;