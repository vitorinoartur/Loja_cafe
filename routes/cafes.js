// routes/cafes.js
const express = require('express');
const router = express.Router();
const cafeController = require('../controllers/cafeController');

router.get('/', cafeController.getAll);
router.get('/:id', cafeController.getById);
router.post('/', cafeController.create);
router.put('/:id', cafeController.update);
router.delete('/:id', cafeController.delete);

module.exports = router;