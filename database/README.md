# Configuração do Banco de Dados

## Pré-requisitos
- PostgreSQL instalado
- pgAdmin ou ferramenta similar

## Configuração Rápida

### 1. Criar Banco
```sql
CREATE DATABASE banco_digital;
-- OU
CREATE DATABASE bank_simulator;
```

### 2. Executar Setup
1. Conecte ao banco criado no pgAdmin
2. Execute o script `setup.sql` completo

### 3. Configurar Backend
Crie arquivo `.env` na pasta `backend`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_digital
DB_USER=postgres
DB_PASSWORD=sua_senha
```

## Usuários de Teste
- **joao@email.com** - senha: password
- **maria@email.com** - senha: password
- **pedro@email.com** - senha: password

## Troubleshooting
- Senha com símbolos especiais: use aspas no .env
- Erro de conexão: verifique se PostgreSQL está rodando
- Banco não existe: execute primeiro o CREATE DATABASE 