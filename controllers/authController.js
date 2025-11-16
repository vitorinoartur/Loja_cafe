// controllers/authController.js - AZURE SQL DATABASE

const sql = require('mssql');
const pool = require('../config/database');
const bcryptjs = require('bcryptjs');  // ← MUDOU AQUI
const jwt = require('jsonwebtoken');

console.log('✅ authController.js carregado');

// LOGIN
exports.login = async (req, res) => {
  try {
    console.log('🔑 [AUTH LOGIN] Recebendo requisição...');
    console.log('🔑 [AUTH LOGIN] Body:', req.body);

    const { email, senha } = req.body;

    if (!email || !senha) {
      console.log('❌ [AUTH LOGIN] Email ou senha faltando');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    console.log('🔍 [AUTH LOGIN] Buscando usuário:', email);
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id, username, email, password FROM usuarios WHERE email = @email');

    if (result.recordset.length === 0) {
      console.log('❌ [AUTH LOGIN] Usuário não encontrado');
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const usuario = result.recordset[0];
    console.log('✅ [AUTH LOGIN] Usuário encontrado:', usuario.username);

    console.log('🔐 [AUTH LOGIN] Verificando senha...');
    const senhaValida = await bcryptjs.compare(senha, usuario.password);

    if (!senhaValida) {
      console.log('❌ [AUTH LOGIN] Senha inválida');
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    console.log('✅ [AUTH LOGIN] Senha válida!');
    console.log('🔐 [AUTH LOGIN] Gerando token JWT...');

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, username: usuario.username },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );

    console.log('✅ [AUTH LOGIN] Token gerado');
    res.json({ 
      token, 
      user: { 
        id: usuario.id, 
        username: usuario.username, 
        email: usuario.email 
      } 
    });

  } catch (err) {
    console.error('❌ [AUTH LOGIN] ERRO:', err.message);
    res.status(500).json({ error: 'Erro ao fazer login: ' + err.message });
  }
};

// VERIFY TOKEN
exports.verifyToken = (req, res) => {
  try {
    console.log('🔐 [VERIFY] Verificando token...');
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('❌ [VERIFY] Token não fornecido');
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');
    console.log('✅ [VERIFY] Token válido:', decoded.email);

    res.json({ valid: true, user: decoded });

  } catch (err) {
    console.error('❌ [VERIFY] Token inválido:', err.message);
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  try {
    console.log('🚪 [LOGOUT] Usuário:', req.user?.email);
    res.json({ mensagem: 'Logout realizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer logout: ' + err.message });
  }
};

// REFRESH TOKEN
exports.refreshToken = (req, res) => {
  try {
    console.log('🔄 [REFRESH] Renovando token...');
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta');

    const novoToken = jwt.sign(
      { id: decoded.id, email: decoded.email, username: decoded.username },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '24h' }
    );

    console.log('✅ [REFRESH] Token renovado');
    res.json({ token: novoToken });

  } catch (err) {
    console.error('❌ [REFRESH] ERRO:', err.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};
