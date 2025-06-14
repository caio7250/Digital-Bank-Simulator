# Simulador Banco Digital 

Sistema simples de gerenciamento bancário desenvolvido para trabalho acadêmico da disciplina de POO.

##Tecnologias

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Banco**: PostgreSQL com driver nativo (pg)

## Configuração do projeto

### 1. Configurar Banco
```bash
# No pgAdmin, crie o banco:
CREATE DATABASE banco_digital;

# Execute o script completo:
database/setup.sql
```

### 2. Configurar Backend
```bash
# Crie arquivo backend/.env:
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=banco_digital
DB_USER=postgres
DB_PASSWORD=sua_senha
```

### 3. Executar Sistema
```bash
# Instalar dependências
cd backend && npm install
cd ../frontend && npm install

# Executar 
npm run dev #Dentro da raiz do projeto
```

### 4. Acessar
- **Sistema**: http://localhost:3000
- **API**: http://localhost:3001

## Usuários de Teste

| Email | Senha |
|-------|--------|
| joao@email.com | password |
| maria@email.com | password |
| pedro@email.com | password |

## Funcionalidades

- ✅ Login/Logout
- ✅ Dashboard com saldo
- ✅ Depósito
- ✅ Saque
- ✅ Transferência entre contas
- ✅ Histórico de transações

## Estrutura

```
banco-digital-simulado/
├── backend/           # API Express + PostgreSQL
├── frontend/          # Next.js + React
├── database/          # Scripts SQL
└── README.md
```

## 🔧 Troubleshooting

**Erro de conexão com banco:**
- Verifique se PostgreSQL está rodando
- Confirme credenciais no `.env`

**Senha com símbolos especiais:**
- Use aspas: `DB_PASSWORD="senha#123"`

**Porta ocupada:**
- Mude a porta no `.env` ou feche processos 