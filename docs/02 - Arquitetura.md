# 02 - Arquitetura

## Componentes

- `apps/web`: front-end React com TypeScript e Vite.
- `apps/api`: API ASP.NET Core 8 com Minimal API.
- `apps/api/data`: contexto do Entity Framework Core.
- `apps/api/models`: entidades do domínio.
- `apps/api/dtos`: contratos de entrada e saída.
- `apps/api/Migrations`: migrations do banco.
- `docker-compose.yml`: orquestra PostgreSQL, API e web.

## Fluxo HTTP

```mermaid
flowchart LR
    React[React] -->|fetch HTTP| API[API ASP.NET Core]
    API -->|DbContext| EF[Entity Framework Core]
    EF -->|SQL| Postgres[(PostgreSQL)]
    Postgres -->|Resultado| EF
    EF -->|Entidades/DTOs| API
    API -->|JSON| React
```

## Fluxo do Docker

```mermaid
flowchart TB
    Compose[docker-compose.yml] --> DB[db: postgres:16]
    DB -. healthcheck .-> API[api: ASP.NET Core]
    Compose --> API
    API -->|ConnectionStrings__DefaultConnection| DB
    Compose --> Web[web: Nginx + build Vite]
    Web --> Browser[Navegador em localhost:5173]
    Browser -->|HTTP localhost:5044| API
```

## Sequência de uma requisição

```mermaid
sequenceDiagram
    participant U as Usuario
    participant R as React
    participant A as API
    participant E as EF Core
    participant P as PostgreSQL

    U->>R: Preenche formulario
    R->>A: POST /transacoes
    A->>A: Valida DTO e regras
    A->>E: Busca pessoa
    E->>P: SELECT pessoa
    P-->>E: Pessoa encontrada
    E-->>A: Entidade Pessoa
    A->>E: Salva transacao
    E->>P: INSERT transacao
    P-->>E: Confirmacao
    A-->>R: 201 Created
    R->>A: GET /totais
    A-->>R: Totais atualizados
    R-->>U: Atualiza a tela
```

## Estrutura das pastas

```mermaid
flowchart TB
    Raiz["ProjetoRendaFamiliar/"]
    Raiz --> Compose["docker-compose.yml"]
    Raiz --> Docs["docs/"]
    Raiz --> Apps["apps/"]
    Apps --> Api["api/"]
    Apps --> Web["web/"]
    Api --> Data["data/AppDbContexto.cs"]
    Api --> DTOs["dtos/"]
    Api --> Models["models/"]
    Api --> Migrations["Migrations/"]
    Api --> Program["Program.cs"]
    Web --> Public["public/"]
    Web --> Src["src/"]
    Src --> Utils["utils/"]
    Src --> ApiClient["api.ts"]
    Src --> App["app.tsx"]
    Src --> Css["index.css"]
    Src --> Types["types.ts"]
```
