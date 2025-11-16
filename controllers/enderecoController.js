// controllers/enderecoController.js - AZURE SQL DATABASE

const sql = require('mssql');
const pool = require('../config/database');

console.log('✅ enderecoController.js carregado');

// CREATE - Criar novo endereço
exports.create = async (req, res) => {
  try {
    console.log('📍 [ENDERECO] Criando novo endereço...');
    console.log('📍 [ENDERECO] Body:', req.body);

    const { cep, rua, numero, complemento, bairro, cidade, estado } = req.body;
    const usuario_id = req.user.id;

    if (!rua || !numero || !cidade || !estado) {
      console.log('❌ [ENDERECO] Dados obrigatórios faltando');
      return res.status(400).json({ 
        error: 'Rua, número, cidade e estado são obrigatórios' 
      });
    }

    console.log('💾 [ENDERECO] Inserindo endereço...');
    const result = await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .input('cep', sql.VarChar, cep || null)
      .input('rua', sql.VarChar, rua)
      .input('numero', sql.VarChar, numero)
      .input('complemento', sql.VarChar, complemento || null)
      .input('bairro', sql.VarChar, bairro || null)
      .input('cidade', sql.VarChar, cidade)
      .input('estado', sql.VarChar, estado)
      .query(`
        INSERT INTO enderecos (usuario_id, cep, rua, numero, complemento, bairro, cidade, estado)
        VALUES (@usuario_id, @cep, @rua, @numero, @complemento, @bairro, @cidade, @estado);
        SELECT @@IDENTITY as id;
      `);

    const endereco_id = result.recordset[0].id;
    console.log('✅ [ENDERECO] Endereço criado:', endereco_id);

    res.status(201).json({
      id: endereco_id,
      usuario_id,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado
    });

  } catch (err) {
    console.error('❌ [ENDERECO] Erro ao criar:', err.message);
    res.status(400).json({ error: 'Erro ao criar endereço: ' + err.message });
  }
};

// GET BY USUARIO - Obter endereços do usuário
exports.getByUsuario = async (req, res) => {
  try {
    console.log('📋 [ENDERECOS] Buscando endereços do usuário:', req.user.id);

    const result = await pool.request()
      .input('usuario_id', sql.Int, req.user.id)
      .query(`
        SELECT id, usuario_id, cep, rua, numero, complemento, bairro, cidade, estado
        FROM enderecos
        WHERE usuario_id = @usuario_id
        ORDER BY id DESC
      `);

    console.log('✅ [ENDERECOS] Total encontrado:', result.recordset.length);
    res.json(result.recordset);

  } catch (err) {
    console.error('❌ [ENDERECOS] Erro ao buscar:', err.message);
    res.status(500).json({ error: 'Erro ao obter endereços: ' + err.message });
  }
};

// GET BY ID - Obter endereço específico
exports.getById = async (req, res) => {
  try {
    console.log('🔍 [ENDERECO] Buscando endereço:', req.params.id);

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT id, usuario_id, cep, rua, numero, complemento, bairro, cidade, estado
        FROM enderecos
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      console.log('❌ [ENDERECO] Endereço não encontrado');
      return res.status(404).json({ error: 'Endereço não encontrado' });
    }

    console.log('✅ [ENDERECO] Endereço encontrado');
    res.json(result.recordset[0]);

  } catch (err) {
    console.error('❌ [ENDERECO] Erro ao buscar:', err.message);
    res.status(500).json({ error: 'Erro ao obter endereço: ' + err.message });
  }
};

// UPDATE - Atualizar endereço
exports.update = async (req, res) => {
  try {
    console.log('✏️ [ENDERECO] Atualizando endereço:', req.params.id);
    console.log('✏️ [ENDERECO] Body:', req.body);

    const { cep, rua, numero, complemento, bairro, cidade, estado } = req.body;

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('cep', sql.VarChar, cep || null)
      .input('rua', sql.VarChar, rua)
      .input('numero', sql.VarChar, numero)
      .input('complemento', sql.VarChar, complemento || null)
      .input('bairro', sql.VarChar, bairro || null)
      .input('cidade', sql.VarChar, cidade)
      .input('estado', sql.VarChar, estado)
      .query(`
        UPDATE enderecos
        SET cep = @cep, rua = @rua, numero = @numero, complemento = @complemento,
            bairro = @bairro, cidade = @cidade, estado = @estado
        WHERE id = @id;
        SELECT @@ROWCOUNT as affected;
      `);

    if (result.recordset[0].affected === 0) {
      console.log('❌ [ENDERECO] Endereço não encontrado');
      return res.status(404).json({ error: 'Endereço não encontrado' });
    }

    console.log('✅ [ENDERECO] Endereço atualizado');
    res.json({ 
      message: 'Endereço atualizado com sucesso',
      id: req.params.id
    });

  } catch (err) {
    console.error('❌ [ENDERECO] Erro ao atualizar:', err.message);
    res.status(400).json({ error: 'Erro ao atualizar endereço: ' + err.message });
  }
};

// DELETE - Deletar endereço
exports.delete = async (req, res) => {
  try {
    console.log('🗑️ [ENDERECO] Deletando endereço:', req.params.id);

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        DELETE FROM enderecos WHERE id = @id;
        SELECT @@ROWCOUNT as affected;
      `);

    if (result.recordset[0].affected === 0) {
      console.log('❌ [ENDERECO] Endereço não encontrado');
      return res.status(404).json({ error: 'Endereço não encontrado' });
    }

    console.log('✅ [ENDERECO] Endereço deletado');
    res.json({ message: 'Endereço deletado com sucesso' });

  } catch (err) {
    console.error('❌ [ENDERECO] Erro ao deletar:', err.message);
    res.status(500).json({ error: 'Erro ao deletar endereço: ' + err.message });
  }
};

// GET COMPLETO - Obter endereços com detalhes do usuário
exports.getDetalhado = async (req, res) => {
  try {
    console.log('📋 [DETALHADO] Buscando endereços detalhados...');

    const result = await pool.request()
      .input('usuario_id', sql.Int, req.user.id)
      .query(`
        SELECT e.id, e.usuario_id, e.cep, e.rua, e.numero, e.complemento, 
               e.bairro, e.cidade, e.estado, u.username, u.email, u.telefone
        FROM enderecos e
        JOIN usuarios u ON e.usuario_id = u.id
        WHERE e.usuario_id = @usuario_id
        ORDER BY e.id DESC
      `);

    console.log('✅ [DETALHADO] Total encontrado:', result.recordset.length);
    res.json(result.recordset);

  } catch (err) {
    console.error('❌ [DETALHADO] Erro:', err.message);
    res.status(500).json({ error: 'Erro ao obter endereços: ' + err.message });
  }
};
