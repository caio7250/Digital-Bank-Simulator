const { Pool } = require('pg');

const cleanPassword = (password) => {
  if (!password) return password;
  return password.replace(/^["']|["']$/g, '');
};

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'database não definido',
  user: process.env.DB_USER || 'postgres',
  password: cleanPassword(process.env.DB_PASSWORD) || 'postgres',
});

pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente do banco:', err);
});

module.exports = pool; 