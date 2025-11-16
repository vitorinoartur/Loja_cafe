// controllers/usuarioController.js
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');

console.log('✅ usuarioController.js carregado');

exports.registrar = async (req, res) => {
  try {
    console.log('📝 [REGISTRAR] Recebendo requisição...');
    console.log('📝 [REGISTRAR] Body:', req.body);

    const { username, email, senha, telefone } = req.body;

    if (!username || !email || !senha) {
      console.log('❌ [REGISTRAR] Dados obrigatórios faltando');
      return res.status(400).json({ error: 'Username, email e senha são obrigatórios' });
    }

    console.log('🔍 [REGISTRAR] Verificando se email existe...');
    const emailExists = await Usuario.emailExists(email);
    if (emailExists) {
      console.log('❌ [REGISTRAR] Email já existe:', email);
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    console.log('🔍 [REGISTRAR] Verificando se username existe...');
    const usernameExists = await Usuario.usernameExists(username);
    if (usernameExists) {
      console.log('❌ [REGISTRAR] Username já existe:', username);
      return res.status(400).json({ error: 'Username já existe' });
    }

    console.log('💾 [REGISTRAR] Criando usuário...');
    const result = await Usuario.create({ username, email, senha, telefone });
    console.log('✅ [REGISTRAR] Usuário criado com ID:', result.insertId);
    
    console.log('🔐 [REGISTRAR] Gerando token JWT...');
    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ [REGISTRAR] Token gerado com sucesso');

    console.log('📤 [REGISTRAR] Retornando resposta de sucesso');
    res.status(201).json({ 
      token, 
      user: { 
        id: result.insertId, 
        username, 
        email 
      } 
    });
  } catch (err) {
    console.error('❌ [REGISTRAR] ERRO CAPTURADO:');
    console.error('Mensagem:', err.message);
    console.error('Stack completo:', err.stack);
    res.status(500).json({ error: 'Erro ao registrar usuário: ' + err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('🔑 [LOGIN] Recebendo requisição...');
    console.log('🔑 [LOGIN] Body:', req.body);

    const { email, senha } = req.body;

    if (!email || !senha) {
      console.log('❌ [LOGIN] Email ou senha faltando');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    console.log('🔍 [LOGIN] Buscando usuário por email:', email);
    const usuario = await Usuario.getByEmail(email);
    console.log('🔍 [LOGIN] Usuário encontrado?', usuario ? 'SIM' : 'NÃO');
    
    if (!usuario) {
      console.log('❌ [LOGIN] Usuário não encontrado:', email);
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    console.log('✅ [LOGIN] Usuário encontrado:', usuario.username);
    console.log('🔐 [LOGIN] Password hasheada no banco:', usuario.password);
    console.log('🔐 [LOGIN] Senha digitada:', senha);
    
    console.log('🔐 [LOGIN] Verificando senha com bcrypt...');
    const senhaValida = await Usuario.comparePassword(senha, usuario.password);
    console.log('🔐 [LOGIN] Senha válida?', senhaValida ? 'SIM' : 'NÃO');
    
    if (!senhaValida) {
      console.log('❌ [LOGIN] Senha inválida');
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    console.log('✅ [LOGIN] Senha válida!');
    console.log('🔐 [LOGIN] Gerando token JWT...');
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ [LOGIN] Token gerado');

    console.log('📤 [LOGIN] Retornando resposta de sucesso');
    res.json({ 
      token, 
      user: { 
        id: usuario.id, 
        username: usuario.username, 
        email: usuario.email 
      } 
    });
  } catch (err) {
    console.error('❌ [LOGIN] ERRO CAPTURADO:');
    console.error('Mensagem:', err.message);
    console.error('Stack completo:', err.stack);
    res.status(500).json({ error: 'Erro ao fazer login: ' + err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    console.log('👤 [PROFILE] Buscando perfil do usuário:', req.user.id);
    const usuario = await Usuario.getById(req.user.id);
    if (!usuario) {
      console.log('❌ [PROFILE] Usuário não encontrado');
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    console.log('✅ [PROFILE] Retornando perfil');
    res.json(usuario);
  } catch (err) {
    console.error('❌ [PROFILE] ERRO CAPTURADO:');
    console.error('Mensagem:', err.message);
    console.error('Stack completo:', err.stack);
    res.status(500).json({ error: 'Erro ao obter perfil: ' + err.message });
  }
};