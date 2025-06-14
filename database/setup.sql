-- ==============================================
-- BANCO DIGITAL SIMULADO - SETUP COMPLETO
-- ==============================================
-- 
-- INSTRUÇÕES:
-- 1. Crie o banco 'banco_digital' ou 'bank_simulator' no PostgreSQL
-- 2. Conecte ao banco criado
-- 3. Execute este script completo
-- 4. Configure o arquivo .env no backend com as credenciais
-- 
-- USUÁRIOS DE TESTE:
-- Email: joao@email.com | maria@email.com | pedro@email.com
-- Senha: password (para todos)
-- ==============================================

-- Criação das tabelas
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    saldo DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo VARCHAR(20) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    usuario_destino_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_transacoes_usuario ON transacoes(usuario_id);
CREATE INDEX idx_transacoes_data ON transacoes(created_at);

-- Inserção de dados de teste
INSERT INTO usuarios (nome, email, senha, saldo) VALUES
('João Silva', 'joao@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5000.00),
('Maria Santos', 'maria@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3000.00),
('Pedro Oliveira', 'pedro@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1500.00);

INSERT INTO transacoes (usuario_id, tipo, valor, descricao) VALUES
(1, 'deposito', 1000.00, 'Depósito inicial'),
(1, 'saque', 200.00, 'Saque no caixa eletrônico'),
(2, 'deposito', 500.00, 'Transferência recebida'),
(3, 'deposito', 300.00, 'Depósito em conta'),
(1, 'transferencia', 250.00, 'Transferência para Maria Santos'),
(2, 'transferencia', 150.00, 'Transferência para Pedro Oliveira'); 