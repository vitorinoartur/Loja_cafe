// debug-env.js
require('dotenv').config();

console.log('=== DEBUG VARIÁVEIS DE AMBIENTE ===\n');

console.log('DB_HOST:', process.env.DB_HOST || '❌ NÃO DEFINIDO');
console.log('DB_USER:', process.env.DB_USER || '❌ NÃO DEFINIDO');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ DEFINIDO' : '❌ NÃO DEFINIDO');
console.log('DB_NAME:', process.env.DB_NAME || '❌ NÃO DEFINIDO');

console.log('\n=== VERIFICAÇÃO ===\n');

if (!process.env.DB_USER || !process.env.DB_USER.includes('@')) {
  console.log('❌ ERRO: DB_USER não tem o formato correto!');
  console.log('   Esperado: usuario@servidor');
  console.log('   Recebido:', process.env.DB_USER);
} else {
  console.log('✅ DB_USER está no formato correto');
}