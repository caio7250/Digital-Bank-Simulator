import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dbPromise from '../database/app.js';

dotenv.config();

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
  const db = await dbPromise;
  try {
    await db.get('SELECT 1');
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    const usuarios = await db.get('SELECT COUNT(*) as count FROM usuarios');
    console.log(`👥 Usuários no banco: ${usuarios.count}`);
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:');
    console.error('Detalhes:', error.message);
    console.error('Verifique se o arquivo ./database/banco.db existe e está acessível.');
  }
}

app.post('/api/login', async (req, res) => {
  const db = await dbPromise;
  try {
    const { email, senha } = req.body;
    const usuario = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
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
  const db = await dbPromise;
  try {
    const { id } = req.params;
    const usuario = await db.get('SELECT id, nome, email, saldo FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/transacoes/:userId', async (req, res) => {
  const db = await dbPromise;
  try {
    const { userId } = req.params;
    const transacoes = await db.all(
      `SELECT t.*, u.nome as nome_destino 
       FROM transacoes t 
       LEFT JOIN usuarios u ON t.usuario_destino_id = u.id 
       WHERE t.usuario_id = ? 
       ORDER BY t.created_at DESC 
       LIMIT 10`,
      [userId]
    );
    res.json(transacoes);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/transacao', async (req, res) => {
  const db = await dbPromise;
  try {
    await db.exec('BEGIN');
    const { usuarioId, tipo, valor, descricao, emailDestino } = req.body;

    const usuario = await db.get('SELECT saldo FROM usuarios WHERE id = ?', [usuarioId]);
    if (!usuario) throw new Error('Usuário não encontrado');

    const saldoAtual = parseFloat(usuario.saldo);
    const valorTransacao = parseFloat(valor);
    let novoSaldo = saldoAtual;
    let usuarioDestinoId = null;

    if (tipo === 'deposito') {
      novoSaldo = saldoAtual + valorTransacao;
    } else if (tipo === 'saque') {
      if (saldoAtual < valorTransacao) throw new Error('Saldo insuficiente');
      novoSaldo = saldoAtual - valorTransacao;
    } else if (tipo === 'transferencia') {
      if (saldoAtual < valorTransacao) throw new Error('Saldo insuficiente');
      const destinatario = await db.get('SELECT id, saldo FROM usuarios WHERE email = ?', [emailDestino]);
      if (!destinatario) throw new Error('Destinatário não encontrado');
      if (destinatario.id === usuarioId) throw new Error('Destinário deve ser diferente do remetente');

      usuarioDestinoId = destinatario.id;
      const saldoDestinatario = parseFloat(destinatario.saldo);
      await db.run('UPDATE usuarios SET saldo = ? WHERE id = ?', [saldoDestinatario + valorTransacao, usuarioDestinoId]);
      novoSaldo = saldoAtual - valorTransacao;
    }

    await db.run('UPDATE usuarios SET saldo = ? WHERE id = ?', [novoSaldo, usuarioId]);
    await db.run(
      'INSERT INTO transacoes (usuario_id, tipo, valor, descricao, usuario_destino_id) VALUES (?, ?, ?, ?, ?)',
      [usuarioId, tipo, valorTransacao, descricao, usuarioDestinoId]
    );
    await db.exec('COMMIT');

    res.json({ 
      success: true, 
      novoSaldo: novoSaldo,
      mensagem: 'Transação realizada com sucesso' 
    });
  } catch (error) {
    const db = await dbPromise;
    await db.exec('ROLLBACK');
    console.error('Erro na transação:', error);
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  await testarConexaoBanco();
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
  console.log('✨ Backend pronto para receber requisições!');
});