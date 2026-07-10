# Projeto Renda Familiar

Aplicação full stack para controle de gastos residenciais. O sistema permite cadastrar pessoas da família, registrar receitas e despesas vinculadas a cada pessoa, remover pessoas com suas transações e acompanhar totais individuais e gerais.

## Como executar

### Opção 1: Docker

Pré-requisitos:

- Docker
- Docker Compose

```bash
docker compose up --build
```

Serviços:

- Web: http://localhost:5173
- API: http://localhost:5044
- Swagger: http://localhost:5044/swagger
- PostgreSQL: `localhost:5434`

Para encerrar:

```bash
docker compose down
```

Para remover também os dados persistidos do banco:

```bash
docker compose down -v
```

### Opção 2: desenvolvimento local

Suba apenas o PostgreSQL:

```bash
docker compose up -d db
```

Execute a API:

```bash
dotnet run --project apps/api/api.csproj
```

Execute o front-end:

```bash
cd apps/web
npm install
npm run dev
```

Por padrão, o front-end usa `http://localhost:5044` como API. Para mudar:

```bash
VITE_API_URL=http://localhost:5044 npm run dev
```

## Tecnologias

- React 19
- TypeScript
- Vite
- ASP.NET Core 8 Minimal API
- Entity Framework Core
- Npgsql
- PostgreSQL 16
- Swagger/OpenAPI
- Docker e Docker Compose
- Nginx para servir o build do front-end no container

## Organização

```text
.
├── apps
│   ├── api
│   │   ├── data
│   │   ├── dtos
│   │   ├── models
│   │   ├── Migrations
│   │   └── Program.cs
│   └── web
│       ├── public
│       └── src
│           ├── utils
│           ├── api.ts
│           ├── app.tsx
│           ├── index.css
│           └── types.ts
├── docs
└── docker-compose.yml
```

## Regras de negócio

- Pessoa deve ter nome preenchido.
- Pessoa não pode ter idade negativa.
- Transação deve ter descrição preenchida.
- Transação deve ter valor maior que zero.
- Transação deve ser do tipo `Receita` ou `Despesa`.
- Transação deve estar vinculada a uma pessoa cadastrada.
- Pessoa menor de 18 anos não pode receber transação do tipo `Receita`.
- Ao deletar uma pessoa, suas transações são deletadas em cascata.
- Total por pessoa considera receitas menos despesas.
- Total geral soma todas as receitas e despesas do sistema.

## Endpoints principais

- `GET /health`
- `GET /health/db`
- `GET /pessoas`
- `POST /pessoas`
- `DELETE /pessoas/{id}`
- `GET /transacoes`
- `POST /transacoes`
- `GET /totais`

## Documentação

A documentação para Obsidian está em `docs/`:

- `01 - Visao Geral.md`
- `02 - Arquitetura.md`
- `03 - Modelo de Dados.md`
- `04 - Fluxos.md`
- `05 - Regras de Negocio.md`

## Validação

Comandos úteis antes da entrega:

```bash
dotnet build apps/api/api.csproj
```

```bash
cd apps/web
npm run lint
npm run build
```
