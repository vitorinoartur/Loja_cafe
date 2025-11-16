// controllers/pedidoController.js - AZURE SQL DATABASE

const sql = require('mssql');
const pool = require('../config/database');

console.log('✅ pedidoController.js carregado');

// CREATE - Criar novo pedido
exports.create = async (req, res) => {
  try {
    console.log('📦 [PEDIDO] Criando novo pedido...');
    console.log('📦 [PEDIDO] Body:', req.body);

    const { endereco_id, itens, forma_pagamento } = req.body;
    const usuario_id = req.user.id;

    if (!endereco_id || !itens || itens.length === 0) {
      console.log('❌ [PEDIDO] Endereço e itens são obrigatórios');
      return res.status(400).json({ error: 'Endereço e itens são obrigatórios' });
    }

    // Calcular total
    const total = itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    console.log('💰 [PEDIDO] Total calculado:', total);

    // Criar pedido
    console.log('💾 [PEDIDO] Inserindo pedido no banco...');
    const pedidoResult = await pool.request()
      .input('usuario_id', sql.Int, usuario_id)
      .input('endereco_id', sql.Int, endereco_id)
      .input('total', sql.Decimal(10, 2), total)
      .input('forma_pagamento', sql.VarChar, forma_pagamento || 'credito')
      .query(`
        INSERT INTO pedidos (usuario_id, endereco_id, total, forma_pagamento, status, created_at)
        VALUES (@usuario_id, @endereco_id, @total, @forma_pagamento, 'Pendente', GETDATE());
        SELECT @@IDENTITY as id;
      `);

    const pedido_id = pedidoResult.recordset[0].id;
    console.log('✅ [PEDIDO] Pedido criado:', pedido_id);

    // Adicionar itens do pedido
    console.log('📝 [PEDIDO] Adicionando itens...');
    for (const item of itens) {
      console.log('  ➕ Item:', item.cafe_id, 'Qtd:', item.quantidade);
      
      await pool.request()
        .input('pedido_id', sql.Int, pedido_id)
        .input('cafe_id', sql.Int, item.cafe_id)
        .input('quantidade', sql.Int, item.quantidade)
        .input('preco', sql.Decimal(10, 2), item.preco)
        .query(`
          INSERT INTO pedido_itens (pedido_id, cafe_id, quantidade, preco)
          VALUES (@pedido_id, @cafe_id, @quantidade, @preco)
        `);
    }

    console.log('✅ [PEDIDO] Todos os itens adicionados');
    res.status(201).json({ 
      pedido_id, 
      total, 
      status: 'Pendente',
      itens: itens.length 
    });

  } catch (err) {
    console.error('❌ [PEDIDO] Erro ao criar:', err.message);
    res.status(500).json({ error: 'Erro ao criar pedido: ' + err.message });
  }
};

// GET BY USUARIO - Obter pedidos do usuário
exports.getByUsuario = async (req, res) => {
  try {
    console.log('📋 [PEDIDOS] Buscando pedidos do usuário:', req.user.id);

    const result = await pool.request()
      .input('usuario_id', sql.Int, req.user.id)
      .query(`
        SELECT id, usuario_id, endereco_id, total, forma_pagamento, status, created_at
        FROM pedidos
        WHERE usuario_id = @usuario_id
        ORDER BY created_at DESC
      `);

    console.log('✅ [PEDIDOS] Total encontrado:', result.recordset.length);
    res.json(result.recordset);

  } catch (err) {
    console.error('❌ [PEDIDOS] Erro ao buscar:', err.message);
    res.status(500).json({ error: 'Erro ao obter pedidos: ' + err.message });
  }
};

// GET BY ID - Obter pedido específico com itens
exports.getById = async (req, res) => {
  try {
    console.log('🔍 [PEDIDO] Buscando pedido:', req.params.id);

    // Buscar pedido
    const pedidoResult = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT id, usuario_id, endereco_id, total, forma_pagamento, status, created_at
        FROM pedidos
        WHERE id = @id
      `);

    if (pedidoResult.recordset.length === 0) {
      console.log('❌ [PEDIDO] Pedido não encontrado');
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const pedido = pedidoResult.recordset[0];

    // Buscar itens do pedido
    const itensResult = await pool.request()
      .input('pedido_id', sql.Int, req.params.id)
      .query(`
        SELECT pi.id, pi.cafe_id, pi.quantidade, pi.preco, c.nome, c.categoria
        FROM pedido_itens pi
        JOIN cafes c ON pi.cafe_id = c.id
        WHERE pi.pedido_id = @pedido_id
      `);

    console.log('✅ [PEDIDO] Pedido encontrado com', itensResult.recordset.length, 'itens');

    res.json({
      ...pedido,
      itens: itensResult.recordset
    });

  } catch (err) {
    console.error('❌ [PEDIDO] Erro ao buscar:', err.message);
    res.status(500).json({ error: 'Erro ao obter pedido: ' + err.message });
  }
};

// UPDATE STATUS - Atualizar status do pedido
exports.updateStatus = async (req, res) => {
  try {
    console.log('✏️ [PEDIDO] Atualizando status:', req.params.id);
    console.log('✏️ [PEDIDO] Novo status:', req.body.status);

    const { status } = req.body;

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.VarChar, status)
      .query(`
        UPDATE pedidos
        SET status = @status
        WHERE id = @id;
        SELECT @@ROWCOUNT as affected;
      `);

    if (result.recordset[0].affected === 0) {
      console.log('❌ [PEDIDO] Pedido não encontrado');
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    console.log('✅ [PEDIDO] Status atualizado');
    res.json({ message: 'Status atualizado com sucesso', status });

  } catch (err) {
    console.error('❌ [PEDIDO] Erro ao atualizar:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar pedido: ' + err.message });
  }
};

// GET ALL - Listar todos os pedidos (ADMIN)
exports.getAll = async (req, res) => {
  try {
    console.log('📋 [ADMIN] Listando todos os pedidos...');

    const result = await pool.request()
      .query(`
        SELECT p.id, p.usuario_id, u.username, p.endereco_id, p.total, 
               p.forma_pagamento, p.status, p.created_at
        FROM pedidos p
        JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY p.created_at DESC
      `);

    console.log('✅ [ADMIN] Total de pedidos:', result.recordset.length);
    res.json(result.recordset);

  } catch (err) {
    console.error('❌ [ADMIN] Erro:', err.message);
    res.status(500).json({ error: 'Erro ao listar pedidos: ' + err.message });
  }
};

// DELETE - Cancelar pedido
exports.delete = async (req, res) => {
  try {
    console.log('🗑️ [PEDIDO] Cancelando pedido:', req.params.id);

    // Verificar se pedido pertence ao usuário ou é admin
    const pedidoResult = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT usuario_id FROM pedidos WHERE id = @id');

    if (pedidoResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Deletar itens primeiro
    await pool.request()
      .input('pedido_id', sql.Int, req.params.id)
      .query('DELETE FROM pedido_itens WHERE pedido_id = @pedido_id');

    // Deletar pedido
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM pedidos WHERE id = @id');

    console.log('✅ [PEDIDO] Pedido cancelado');
    res.json({ message: 'Pedido cancelado com sucesso' });

  } catch (err) {
    console.error('❌ [PEDIDO] Erro ao cancelar:', err.message);
    res.status(500).json({ error: 'Erro ao cancelar pedido: ' + err.message });
  }
};
