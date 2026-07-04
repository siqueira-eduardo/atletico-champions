# Champions League Atlético Paraíso 2026

Sistema para gerenciamento da Champions League Atlético Paraíso.

Produção: https://atletico-champions.vercel.app

## Funcionalidades

- Classificação automática
- Artilharia, assistências e MVP
- Súmula com gols, assistências, cartões, ocorrências e observações
- Votação por CPF com nota de 0 a 10
- MVP automático pela votação, com ajuste manual do admin
- Média acumulada no perfil do jogador
- Elencos, mata-mata, regras e galeria de fotos
- Exportação JSON/CSV
- Firebase em tempo real

## Instalação

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Firebase

As credenciais estão em `src/firebase.js`.

Para aplicar as regras do Realtime Database:

```bash
firebase deploy --only database
```

As regras deixam a leitura pública, restringem gravações administrativas a usuários autenticados e permitem voto público somente quando a votação do jogo estiver aberta.

## Admin

O PIN local é `3417`. Para segurança real no Firebase, use login por Firebase Auth com e-mail/senha, porque regras de banco não conseguem validar um PIN local do navegador.
