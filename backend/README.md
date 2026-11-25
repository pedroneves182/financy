# Financy backend

API GraphQL para gerenciamento de contas, categorias e transações pessoais.

## Requisitos

- Node.js 20 ou superior
- pnpm
- SQLite (arquivo local, criado pelo Prisma)

## Desenvolvimento local

1. Copie `.env.example` para `.env` e defina um `JWT_SECRET` aleatório com pelo menos 32 caracteres.
2. Instale as dependências com `pnpm install`.
3. Aplique a migração inicial e gere o cliente com `pnpm db:migrate`.
4. Inicie a API com `pnpm dev`.

GraphQL fica disponível em `http://localhost:4000/graphql`; a verificação de saúde fica em `/health`. O `CORS_ORIGINS` aceita uma lista de origens separadas por vírgulas.

## Produção

Use as variáveis do ambiente de implantação, execute `pnpm db:deploy` e inicie com `pnpm start`. Configure `DATABASE_URL` com um caminho para o arquivo SQLite persistente.

## Autenticação

As operações `register` e `login` retornam um token JWT. Envie-o nas operações autenticadas pelo cabeçalho:

```text
Authorization: Bearer <token>
```

Todas as consultas e alterações de categorias e transações são limitadas ao usuário do token. Valores monetários são informados em centavos inteiros. Ao excluir uma categoria, as transações permanecem e ficam sem categoria.
