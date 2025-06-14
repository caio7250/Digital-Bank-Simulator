require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: '🏦 API Banco Digital Simulado',
    status: 'Funcionando!',
    endpoints: [
      'POST /api/login',
      'GET /api/usuario/:id', 
      'GET /api/transacoes/:userId',
      'POST /api/transacao'
    ],
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: '🏦 API Banco Digital Simulado',
    status: 'Online',
    timestamp: new Date().toISOString()
  });
});

async function testarConexaoBanco() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    
    const usuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
    console.log(`👥 Usuários no banco: ${usuarios.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:');
    console.error('Detalhes:', error.message);
    console.error('Verifique:');
    console.error('- Se o PostgreSQL está rodando');
    console.error(`- Se o banco "${process.env.DB_NAME || 'nome não identificado'}" existe`);
    console.error('- Se as credenciais no arquivo .env estão corretas');
  }
}

app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    const { senha: _, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, nome, email, saldo FROM usuarios WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/transacoes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT t.*, u.nome as nome_destino 
       FROM transacoes t 
       LEFT JOIN usuarios u ON t.usuario_destino_id = u.id 
       WHERE t.usuario_id = $1 
       ORDER BY t.created_at DESC 
       LIMIT 10`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/transacao', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { usuarioId, tipo, valor, descricao, emailDestino } = req.body;
    
    const usuarioResult = await client.query(
      'SELECT saldo FROM usuarios WHERE id = $1',
      [usuarioId]
    );
    
    if (usuarioResult.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    const saldoAtual = parseFloat(usuarioResult.rows[0].saldo);
    const valorTransacao = parseFloat(valor);
    
    let novoSaldo = saldoAtual;
    let usuarioDestinoId = null;
    
    if (tipo === 'deposito') {
      novoSaldo = saldoAtual + valorTransacao;
    } else if (tipo === 'saque') {
      if (saldoAtual < valorTransacao) {
        throw new Error('Saldo insuficiente');
      }
      novoSaldo = saldoAtual - valorTransacao;
    } else if (tipo === 'transferencia') {
      if (saldoAtual < valorTransacao) {
        throw new Error('Saldo insuficiente');
      }
      
      const destinatarioResult = await client.query(
        'SELECT id, saldo FROM usuarios WHERE email = $1',
        [emailDestino]
      );
      
      if (destinatarioResult.rows.length === 0) {
        throw new Error('Destinatário não encontrado');
      }
      
      usuarioDestinoId = destinatarioResult.rows[0].id;
      const saldoDestinatario = parseFloat(destinatarioResult.rows[0].saldo);
      
      novoSaldo = saldoAtual - valorTransacao;
      
      await client.query(
        'UPDATE usuarios SET saldo = $1 WHERE id = $2',
        [saldoDestinatario + valorTransacao, usuarioDestinoId]
      );
    }
    
    await client.query(
      'UPDATE usuarios SET saldo = $1 WHERE id = $2',
      [novoSaldo, usuarioId]
    );
    
    await client.query(
      'INSERT INTO transacoes (usuario_id, tipo, valor, descricao, usuario_destino_id) VALUES ($1, $2, $3, $4, $5)',
      [usuarioId, tipo, valorTransacao, descricao, usuarioDestinoId]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      novoSaldo: novoSaldo,
      mensagem: 'Transação realizada com sucesso' 
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.listen(PORT, async () => {
  console.log('🚀 ===================================');
  console.log(`🌐 API Banco Digital rodando!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('📋 Endpoints disponíveis:');
  console.log(`   • POST http://localhost:${PORT}/api/login`);
  console.log(`   • GET  http://localhost:${PORT}/api/usuario/:id`);
  console.log(`   • GET  http://localhost:${PORT}/api/transacoes/:userId`);
  console.log(`   • POST http://localhost:${PORT}/api/transacao`);
  console.log('🚀 ===================================');
  console.log('');
  await testarConexaoBanco();
  console.log('');
  console.log('✨ Backend pronto para receber requisições!');
}); 