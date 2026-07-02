# Champions League Atletico Paraiso 2026

Sistema completo para gerenciamento da Champions League Atletico Paraiso.

## Funcionalidades

- Classificacao automatica
- Artilharia
- Assistencias
- MVP
- Mata-mata
- Elencos
- Estatisticas
- Sumula do jogo com gols, assistencias, MVP, cartoes e ocorrencias
- Exportacao JSON/CSV
- Galeria de fotos
- Firebase em tempo real

## Instalacao

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tecnologias

- React
- Vite
- Firebase

## Firebase

Edite `src/firebase.js` com as credenciais do seu projeto Firebase antes de publicar.

## Admin

O app aceita login por Firebase Auth usando e-mail/senha. Se o e-mail ficar vazio, o PIN local `3417` continua funcionando como atalho.

Para seguranca real, habilite Email/Password no Firebase Authentication e aplique as regras de `database.rules.json` no Realtime Database. Com essas regras, leitura continua publica e escrita fica restrita a usuarios autenticados.
