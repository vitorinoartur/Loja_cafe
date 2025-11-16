// controllers/usuarioController.js - AZURE SQL DATABASE (com bcryptjs)

const sql = require('mssql');
const pool = require('../config/database');
const bcryptjs = require('bcryptjs');  // ← MUDOU AQUI
const jwt = require('jsonwebtoken');

console.log('✅ usuarioController.js carregado');

// REGISTRAR
exports.registrar = async (req, res) => {
  try {
    console.log('📝 [REGISTRAR] Recebendo requisição...');
    console.log('📝 [REGISTRAR] Body:', req.body);

    const { username, email, senha, telefone } = req.body;

    if (!username || !email || !senha) {
      console.log('❌ [REGISTRAR] Dados obrigatórios faltando');
      return res.status(400).json({ error: 'Username, email e senha são obrigatórios' });
    }

    // Verificar email
    console.log('🔍 [REGISTRAR] Verificando email...');
    const emailResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id FROM usuarios WHERE email = @email');
    
    if (emailResult.recordset.length > 0) {
      console.log('❌ [REGISTRAR] Email já existe');
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Verificar username
    console.log('🔍 [REGISTRAR] Verificando username...');
    const usernameResult = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT id FROM usuarios WHERE username = @username');
    
    if (usernameResult.recordset.length > 0) {
      console.log('❌ [REGISTRAR] Username já existe');
      return res.status(400).json({ error: 'Username já existe' });
    }

    // Hash senha com bcryptjs
    console.log('💾 [REGISTRAR] Fazendo hash da senha...');
    const senhaHash = await bcryptjs.hash(senha, 10);

    // Criar usuário
    console.log('💾 [REGISTRAR] Criando usuário...');
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, senhaHash)
      .input('telefone', sql.VarChar, telefone || null)
      .query(`
        INSERT INTO usuarios (username, email, password, telefone, created_at)
        VALUES (@username, @email, @password, @telefone, GETDATE());
        SELECT @@IDENTITY as id;
      `);

    const usuarioId = result.recordset[0].id;
    console.log('✅ [REGISTRAR] Usuário criado:', usuarioId);

    // Token JWT
    console.log('🔐 [REGISTRAR] Gerando token...');
    const token = jwt.sign(
      { id: usuarioId, email },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '7d' }
    );
    console.log('✅ [REGISTRAR] Token gerado');

    res.status(201).json({ token, user: { id: usuarioId, username, email } });
  } catch (err) {
    console.error('❌ [REGISTRAR] ERRO:', err.message);
    res.status(500).json({ error: 'Erro ao registrar: ' + err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    console.log('🔑 [LOGIN] Recebendo requisição...');
    console.log('🔑 [LOGIN] Body:', req.body);

    const { email, senha } = req.body;

    if (!email || !senha) {
      console.log('❌ [LOGIN] Email ou senha faltando');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    console.log('🔍 [LOGIN] Buscando usuário...');
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT id, username, email, password FROM usuarios WHERE email = @email');
    
    if (result.recordset.length === 0) {
      console.log('❌ [LOGIN] Usuário não encontrado');
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const usuario = result.recordset[0];
    console.log('✅ [LOGIN] Usuário encontrado:', usuario.username);

    // Verificar senha com bcryptjs
    console.log('🔐 [LOGIN] Verificando senha...');
    const senhaValida = await bcryptjs.compare(senha, usuario.password);
    console.log('🔐 [LOGIN] Senha válida?', senhaValida ? 'SIM' : 'NÃO');
    
    if (!senhaValida) {
      console.log('❌ [LOGIN] Senha inválida');
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Token JWT
    console.log('🔐 [LOGIN] Gerando token...');
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: usuario.id, username: usuario.username, email: usuario.email } });
  } catch (err) {
    console.error('❌ [LOGIN] ERRO:', err.message);
    res.status(500).json({ error: 'Erro ao fazer login: ' + err.message });
  }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    console.log('👤 [PROFILE] Buscando perfil:', req.user.id);
    
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, username, email, telefone, created_at FROM usuarios WHERE id = @id');

    if (result.recordset.length === 0) {
      console.log('❌ [PROFILE] Usuário não encontrado');
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ [PROFILE] Retornando perfil');
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('❌ [PROFILE] ERRO:', err.message);
    res.status(500).json({ error: 'Erro ao obter perfil: ' + err.message });
  }
};

// LISTAR TODOS
exports.listarTodos = async (req, res) => {
  try {
    console.log('📋 [LISTAR] Listando usuários...');
    
    const result = await pool.request()
      .query('SELECT id, username, email, telefone, created_at FROM usuarios ORDER BY created_at DESC');

    res.json({ total: result.recordset.length, usuarios: result.recordset });
  } catch (err) {
    console.error('❌ [LISTAR] ERRO:', err.message);
    res.status(500).json({ error: 'Erro ao listar: ' + err.message });
  }
};

// ATUALIZAR
exports.atualizar = async (req, res) => {
  try {
    console.log('✏️ [ATUALIZAR] Atualizando:', req.user.id);

    const { email, telefone } = req.body;

    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('email', sql.VarChar, email)
      .input('telefone', sql.VarChar, telefone || null)
      .query(`
        UPDATE usuarios SET email = @email, telefone = @telefone WHERE id = @id;
        SELECT id, username, email, telefone FROM usuarios WHERE id = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('✅ [ATUALIZAR] Usuário atualizado');
    res.json({ mensagem: 'Atualizado!', usuario: result.recordset[0] });
  } catch (err) {
    console.error('❌ [ATUALIZAR] ERRO:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar: ' + err.message });
  }
};

// DELETAR
exports.deletar = async (req, res) => {
  try {
    console.log('🗑️ [DELETAR] Deletando:', req.user.id);

    await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('DELETE FROM usuarios WHERE id = @id');

    console.log('✅ [DELETAR] Usuário deletado');
    res.json({ mensagem: 'Deletado com sucesso!' });
  } catch (err) {
    console.error('❌ [DELETAR] ERRO:', err.message);
    res.status(500).json({ error: 'Erro ao deletar: ' + err.message });
  }
};
