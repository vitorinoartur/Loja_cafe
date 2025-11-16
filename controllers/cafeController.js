// controllers/cafeController.js
const Cafe = require('../models/cafe');

exports.getAll = async (req, res) => {
  try {
    const cafes = await Cafe.getAll();
    res.json(cafes);
  } catch (err) {
    console.error('Erro ao buscar cafés:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const cafe = await Cafe.getById(req.params.id);
    if (!cafe) return res.status(404).json({ error: 'Café não encontrado' });
    res.json(cafe);
  } catch (err) {
    console.error('Erro ao buscar café:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Cafe.create(req.body);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    console.error('Erro ao criar café:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    await Cafe.update(req.params.id, req.body);
    res.json({ message: 'Café atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar café:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await Cafe.delete(req.params.id);
    res.json({ message: 'Café deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar café:', err);
    res.status(400).json({ error: err.message });
  }
};