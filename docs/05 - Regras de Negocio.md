# 05 - Regras de Negocio

## Pessoas

- Nome é obrigatório.
- Nome é salvo sem espaços no começo ou no fim.
- Idade não pode ser negativa.
- Idade deve ser um número inteiro no front-end.
- Uma pessoa pode ter zero ou mais transações.
- Ao remover uma pessoa, todas as suas transações são removidas por cascata.

## Transacoes

- Descrição é obrigatória.
- Descrição é salva sem espaços no começo ou no fim.
- Valor deve ser maior que zero.
- Tipo deve ser `Receita` ou `Despesa`.
- Toda transação deve estar vinculada a uma pessoa existente.
- Menores de 18 anos não podem ter transações do tipo `Receita`.

## Totais

- Receitas aumentam o saldo.
- Despesas reduzem o saldo.
- Saldo por pessoa é calculado como `totalReceitas - totalDespesas`.
- Saldo geral é calculado como `totalReceitasGeral - totalDespesasGeral`.
- Pessoas sem transações aparecem com totais zerados.

## Regras tecnicas

- A API serializa o enum `TipoDeTransacao` como texto.
- A API executa migrations automaticamente ao iniciar.
- O front-end recarrega os dados após cadastrar ou deletar registros.
- A URL da API no front-end pode ser configurada com `VITE_API_URL`.
- O Docker Compose aguarda o PostgreSQL ficar saudável antes de iniciar a API.
