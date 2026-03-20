# 💖 Bot Bruna - Sistema de Atendimento WhatsApp

Sistema completo de atendimento automático para WhatsApp com painel administrativo web.

---

## 📁 Estrutura do Projeto

```
BOTBRUNA/
├── bot/                          # Bot WhatsApp
│   ├── handlers/                 # Handlers de fluxo de conversa
│   │   ├── menuHandler.js        # Menu principal e roteamento
│   │   ├── serviceHandler.js     # Listagem de serviços
│   │   ├── faqHandler.js         # Dúvidas frequentes
│   │   └── schedulingHandler.js  # Fluxo de agendamento
│   ├── services/                 # Serviços de apoio
│   │   ├── sessionService.js     # Gerenciador de sessões
│   │   └── databaseService.js    # Acesso ao banco via Prisma
│   ├── utils/                    # Utilitários
│   │   └── messageFormatter.js   # Formatação de mensagens
│   └── index.js                  # Ponto de entrada do bot
│
├── painel/                       # Painel Administrativo (Next.js)
│   ├── app/                      # App Router do Next.js
│   │   ├── api/                  # API Routes
│   │   │   ├── settings/         # CRUD de configurações
│   │   │   ├── services/         # CRUD de serviços
│   │   │   └── faq/              # CRUD de FAQ
│   │   ├── services/             # Página de serviços
│   │   ├── faq/                  # Página de FAQ
│   │   ├── settings/             # Página de configurações
│   │   ├── layout.tsx            # Layout principal
│   │   ├── page.tsx              # Dashboard
│   │   └── globals.css           # Estilos globais
│   ├── components/               # Componentes reutilizáveis
│   │   └── Sidebar.tsx           # Menu lateral
│   ├── lib/                      # Bibliotecas de apoio
│   │   ├── prisma.ts             # Instância do Prisma
│   │   └── api.ts                # Instância do Axios
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── prisma/
│   ├── schema.prisma             # Modelagem do banco de dados
│   └── seed.js                   # Dados iniciais
│
├── package.json                  # Dependências raiz (bot)
├── .env.example                  # Variáveis de ambiente
└── README.md
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Node.js** v18 ou superior
- **PostgreSQL** instalado e rodando
- **Google Chrome** instalado (necessário para o whatsapp-web.js)

### 1. Clonar e instalar dependências

```bash
# Na raiz do projeto
npm install

# Instalar dependências do painel
cd painel
npm install
cd ..
```

### 2. Configurar banco de dados

Crie o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/botbruna?schema=public"
```

> Substitua `usuario` e `senha` pelas credenciais do seu PostgreSQL.

### 3. Criar o banco de dados

```bash
# Crie o database no PostgreSQL
# psql -U postgres -c "CREATE DATABASE botbruna;"

# Rodar migrations (cria as tabelas)
npx prisma migrate dev --name init

# Gerar o client do Prisma
npx prisma generate

# Popular o banco com dados iniciais
node prisma/seed.js
```

### 4. Iniciar o painel administrativo

```bash
cd painel
npm run dev
```

O painel estará disponível em: **http://localhost:3000**

### 5. Iniciar o bot

Em outro terminal:

```bash
# Na raiz do projeto
npm run bot
```

Um QR Code aparecerá no terminal. Escaneie com o WhatsApp para conectar.

---

## 📱 Fluxo do Bot

```
Cliente envia mensagem
    ↓
Menu Principal
    ├── 1 - Serviços → Lista serviços do banco
    ├── 2 - Valores  → Mostra promoção do banco
    ├── 3 - Agendamento → Fluxo:
    │       ├── Escolher serviço
    │       ├── Informar dia
    │       ├── Informar horário
    │       └── Confirmar
    ├── 4 - Dúvidas  → Lista FAQ do banco
    └── 5 - Atendente → Encerra fluxo
```

---

## 🌐 API Routes

| Método | Rota                | Descrição                    |
|--------|---------------------|------------------------------|
| GET    | /api/settings       | Busca configurações          |
| POST   | /api/settings       | Cria/atualiza configurações  |
| GET    | /api/services       | Lista serviços               |
| POST   | /api/services       | Adiciona serviço             |
| DELETE | /api/services/:id   | Remove serviço               |
| GET    | /api/faq            | Lista FAQ                    |
| POST   | /api/faq            | Adiciona pergunta/resposta   |
| DELETE | /api/faq/:id        | Remove pergunta              |

---

## 🖥️ Painel Administrativo

O painel permite:

- **Dashboard**: Visão geral com contagem de serviços, FAQ e status das configurações
- **Serviços**: Adicionar e remover serviços que aparecem no bot
- **FAQ**: Adicionar e remover perguntas frequentes
- **Configurações**: Editar mensagem de boas-vindas e texto de promoção/valores

---

## 🔧 Tecnologias

- **Bot**: Node.js + whatsapp-web.js
- **Painel**: Next.js 14 (App Router) + React + TypeScript
- **Banco**: PostgreSQL + Prisma ORM
- **HTTP Client**: Axios
