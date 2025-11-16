// controllers/enderecoController.js
const Endereco = require('../models/endereco');

exports.create = async (req, res) => {
  try {
    const enderecoData = { ...req.body, usuario_id: req.user.id };
    const result = await Endereco.create(enderecoData);
    res.status(201).json({ id: result.insertId, ...enderecoData });
  } catch (err) {
    console.error('Erro ao criar endereço:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getByUsuario = async (req, res) => {
  try {
    const enderecos = await Endereco.getByUsuarioId(req.user.id);
    res.json(enderecos);
  } catch (err) {
    console.error('Erro ao obter endereços:', err);
    res.status(500).json({ error: err.message });
  }
};