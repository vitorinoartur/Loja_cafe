// app.js - Servidor Express
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ===== REQUIRES DAS ROTAS =====
const usuarioRoutes = require('./routes/usuarios');
const enderecoRoutes = require('./routes/enderecos');
const pedidoRoutes = require('./routes/pedidos');
const cafeRoutes = require('./routes/cafes');
const authRoutes = require('./routes/auth');

// ===== MIDDLEWARES =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== ROTAS DA API =====
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/enderecos', enderecoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api/auth', authRoutes);

// ===== ROTA RAIZ =====
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send('Aplicação Loja Café rodando no Azure!');
    }
  });
});

// ===== TRATAMENTO DE ERROS =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro no servidor' });
});

// ===== INICIAR SERVIDOR =====
// IMPORTANTE: no Azure App Service, use process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
