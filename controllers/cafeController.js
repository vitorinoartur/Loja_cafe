// controllers/cafeController.js - AZURE SQL DATABASE

const sql = require('mssql');
const pool = require('../config/database');

console.log('✅ cafeController.js carregado');

// GET ALL - Listar todos os cafés
exports.getAll = async (req, res) => {
  try {
    console.log('📋 [CAFES] Buscando todos os cafés...');
    
    const result = await pool.request()
      .query('SELECT id, nome, categoria, descricao, preco, imagem, torra, intensidade, estoque, created_at FROM cafes ORDER BY nome');

    console.log('✅ [CAFES] Total encontrado:', result.recordset.length);
    res.json(result.recordset);

  } catch (err) {
    console.error('❌ [CAFES] Erro ao buscar:', err.message);
    res.status(500).json({ error: 'Erro ao buscar cafés: ' + err.message });
  }
};

// GET BY ID - Buscar café por ID
exports.getById = async (req, res) => {
  try {
    console.log('🔍 [CAFE] Buscando café:', req.params.id);
    
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT id, nome, categoria, descricao, preco, imagem, torra, intensidade, estoque, created_at FROM cafes WHERE id = @id');

    if (result.recordset.length === 0) {
      console.log('❌ [CAFE] Café não encontrado');
      return res.status(404).json({ error: 'Café não encontrado' });
    }

    console.log('✅ [CAFE] Café encontrado:', result.recordset[0].nome);
    res.json(result.recordset[0]);

  } catch (err) {
    console.error('❌ [CAFE] Erro ao buscar:', err.message);
    res.status(500).json({ error: 'Erro ao buscar café: ' + err.message });
  }
};

// CREATE - Criar novo café
exports.create = async (req, res) => {
  try {
    console.log('➕ [CAFE] Criando novo café...');
    console.log('➕ [CAFE] Body:', req.body);

    const { nome, categoria, descricao, preco, imagem, torra, intensidade, estoque } = req.body;

    if (!nome || !preco) {
      console.log('❌ [CAFE] Nome e preço são obrigatórios');
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const result = await pool.request()
      .input('nome', sql.VarChar, nome)
      .input('categoria', sql.VarChar, categoria || null)
      .input('descricao', sql.VarChar(sql.MAX), descricao || null)
      .input('preco', sql.Decimal(10, 2), preco)
      .input('imagem', sql.VarChar, imagem || null)
      .input('torra', sql.VarChar, torra || null)
      .input('intensidade', sql.Int, intensidade || null)
      .input('estoque', sql.Int, estoque || 100)
      .query(`
        INSERT INTO cafes (nome, categoria, descricao, preco, imagem, torra, intensidade, estoque, created_at, updated_at)
        VALUES (@nome, @categoria, @descricao, @preco, @imagem, @torra, @intensidade, @estoque, GETDATE(), GETDATE());
        SELECT @@IDENTITY as id;
      `);

    const cafeId = result.recordset[0].id;
    console.log('✅ [CAFE] Café criado:', cafeId);

    res.status(201).json({ 
      id: cafeId, 
      nome, 
      categoria, 
      descricao, 
      preco, 
      imagem, 
      torra, 
      intensidade, 
      estoque 
    });

  } catch (err) {
    console.error('❌ [CAFE] Erro ao criar:', err.message);
    res.status(400).json({ error: 'Erro ao criar café: ' + err.message });
  }
};

// UPDATE - Atualizar café
exports.update = async (req, res) => {
  try {
    console.log('✏️ [CAFE] Atualizando café:', req.params.id);
    console.log('✏️ [CAFE] Body:', req.body);

    const { nome, categoria, descricao, preco, imagem, torra, intensidade, estoque } = req.body;

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('nome', sql.VarChar, nome)
      .input('categoria', sql.VarChar, categoria || null)
      .input('descricao', sql.VarChar(sql.MAX), descricao || null)
      .input('preco', sql.Decimal(10, 2), preco)
      .input('imagem', sql.VarChar, imagem || null)
      .input('torra', sql.VarChar, torra || null)
      .input('intensidade', sql.Int, intensidade || null)
      .input('estoque', sql.Int, estoque)
      .query(`
        UPDATE cafes 
        SET nome = @nome, categoria = @categoria, descricao = @descricao, 
            preco = @preco, imagem = @imagem, torra = @torra, 
            intensidade = @intensidade, estoque = @estoque, updated_at = GETDATE()
        WHERE id = @id;
        SELECT @@ROWCOUNT as affected;
      `);

    if (result.recordset[0].affected === 0) {
      console.log('❌ [CAFE] Café não encontrado');
      return res.status(404).json({ error: 'Café não encontrado' });
    }

    console.log('✅ [CAFE] Café atualizado');
    res.json({ message: 'Café atualizado com sucesso', id: req.params.id });

  } catch (err) {
    console.error('❌ [CAFE] Erro ao atualizar:', err.message);
    res.status(400).json({ error: 'Erro ao atualizar café: ' + err.message });
  }
};

// DELETE - Deletar café
exports.delete = async (req, res) => {
  try {
    console.log('🗑️ [CAFE] Deletando café:', req.params.id);

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM cafes WHERE id = @id; SELECT @@ROWCOUNT as affected;');

    if (result.recordset[0].affected === 0) {
      console.log('❌ [CAFE] Café não encontrado');
      return res.status(404).json({ error: 'Café não encontrado' });
    }

    console.log('✅ [CAFE] Café deletado');
    res.json({ message: 'Café deletado com sucesso' });

  } catch (err) {
    console.error('❌ [CAFE] Erro ao deletar:', err.message);
    res.status(400).json({ error: 'Erro ao deletar café: ' + err.message });
  }
};

// SEARCH - Buscar cafés por termo
exports.search = async (req, res) => {
  try {
    console.log('🔍 [SEARCH] Buscando por:', req.query.termo);

    const termo = `%${req.query.termo}%`;
    const result = await pool.request()
      .input('termo', sql.VarChar, termo)
      .query(`
        SELECT id, nome, categoria, descricao, preco, imagem, torra, intensidade, estoque 
        FROM cafes 
        WHERE nome LIKE @termo OR categoria LIKE @termo OR descricao LIKE @termo
        ORDER BY nome
      `);

    console.log('✅ [SEARCH] Encontrados:', result.recordset.length);
    res.json(result.recordset);

  } catch (err) {
    console.error('❌ [SEARCH] Erro:', err.message);
    res.status(500).json({ error: 'Erro ao buscar: ' + err.message });
  }
};

// FILTER BY CATEGORY - Filtrar por categoria
exports.filterByCategory = async (req, res) => {
  try {
    console.log('📂 [FILTER] Filtrar por categoria:', req.params.categoria);

    const result = await pool.request()
      .input('categoria', sql.VarChar, req.params.categoria)
      .query(`
        SELECT id, nome, categoria, descricao, preco, imagem, torra, intensidade, estoque 
        FROM cafes 
        WHERE categoria = @categoria
        ORDER BY nome
      `);

    console.log('✅ [FILTER] Encontrados:', result.recordset.length);
    res.json(result.recordset);

  } catch (err) {
    console.error('❌ [FILTER] Erro:', err.message);
    res.status(500).json({ error: 'Erro ao filtrar: ' + err.message });
  }
};
