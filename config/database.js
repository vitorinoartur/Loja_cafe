// config/database.js - AZURE SQL DATABASE

const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  user: process.env.DB_USER,              // Exemplo: admin@meuservidor
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,            // Exemplo: meuservidor.database.windows.net
  database: process.env.DB_NAME,          // loja_cafe
  port: 1433,
  pool: {
    max: 10,                              // Equivalente ao connectionLimit do MySQL
    min: 1,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,                        // OBRIGATÓRIO no Azure SQL
    trustServerCertificate: false,        // true apenas para desenvolvimento
    enableKeepAlive: true,
    requestTimeout: 30000
  }
};

// Criar pool de conexões
const pool = new sql.ConnectionPool(config);

// Conectar ao banco
pool.connect()
  .then(() => {
    console.log('✅ Conectado com sucesso ao Azure SQL Database');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco:', err);
    process.exit(1);
  });

// Tratar erros de pool
pool.on('error', err => {
  console.error('❌ Erro no pool de conexão:', err);
});

module.exports = pool;
