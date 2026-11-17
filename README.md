# Champions League Atlético Paraíso 2026

Sistema web para gerenciamento da competição Champions League Atlético Paraíso.

**Aplicação:** https://atletico-champions.vercel.app

## Funcionalidades documentadas

- Classificação automática.
- Artilharia, assistências e MVP.
- Súmula com gols, assistências, cartões, ocorrências e observações.
- Votação de MVP com nota de 0 a 10.
- Média acumulada no perfil do jogador.
- Elencos, mata-mata, regulamento e galeria de fotos.
- Exportação de dados em JSON e CSV.
- Integração com Firebase Realtime Database.

## Tecnologias

- Aplicação web em JavaScript.
- Firebase Realtime Database.
- Vercel para publicação.

Consulte os arquivos do projeto para confirmar versões e dependências utilizadas.

## Executar localmente

Requisitos: Node.js e npm.

```bash
npm install
npm run dev
```

## Gerar build

```bash
npm run build
```

## Firebase e segurança

A aplicação utiliza Firebase Realtime Database. As regras do banco são parte essencial da segurança e devem ser revisadas e testadas antes de qualquer publicação.

- Não confie em PIN armazenado ou validado somente no navegador como mecanismo de autenticação.
- Para operações administrativas, implemente autenticação real com Firebase Authentication e regras de banco que validem a identidade e as permissões do usuário.
- Não publique senhas, tokens privados, chaves de serviço ou credenciais administrativas no repositório.
- A configuração cliente do Firebase não substitui regras de segurança adequadas.
- Após qualquer alteração nas regras, teste acessos permitidos e negados com perfis distintos.

Para publicar regras do Realtime Database, após revisar o arquivo de regras e confirmar o projeto Firebase correto:

```bash
firebase deploy --only database
```

## Observação de manutenção

Este README descreve as funcionalidades e o fluxo geral do projeto. Antes de novas versões, valide a implementação real, as dependências, as regras do Firebase e o comportamento da aplicação publicada.
