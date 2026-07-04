# 📖 README - Atletico Champions

> Sistema completo de gerenciamento da Champions League Atlético Paraíso 2026

## 🚀 O que é?

**Atletico Champions** é uma aplicação web para gerenciar uma liga de futsal amador com:
- ⚽ Cadastro de times, jogadores e jogos
- 📊 Classificação automática
- 🎯 Artilharia, assistências e MVP
- 🗳️ Votação para melhor jogador
- 🏆 Mata-mata (fase eliminatória)
- 📸 Galeria de fotos
- 🔐 Sistema de autenticação com roles
- 📋 Auditoria completa de mudanças

## 🛠️ Stack Tecnológico

```
Frontend:    React 18 + Vite 5
Backend:     Firebase (Auth + Realtime Database)
Styling:     CSS3 puro (sem frameworks)
Deploy:      Vercel (https://atletico-champions.vercel.app)
```

## 📁 Estrutura do Projeto

```
atletico-champions/
├── src/
│   ├── App.jsx                 # Componente principal (UI completa)
│   ├── main.jsx                # Entry point
│   ├── firebase.js             # Config Firebase
│   ├── data.js                 # Dados estáticos (times, jogadores, rodadas)
│   │
│   ├── auth/                   # Sistema de autenticação
│   │   ├── authContext.js      # Context de auth global
│   │   └── roleManager.js      # Gerenciamento de roles e permissões
│   │
│   ├── audit/                  # Sistema de auditoria
│   │   └── auditLogger.js      # Log de todas as mudanças
│   │
│   ├── components/             # Componentes React
│   │   ├── LoginModal.jsx      # Modal de login melhorado
│   │   └── RoleGuard.jsx       # Proteção por permissão
│   │
│   ├── styles/
│   │   └── global.css          # Estilos globais (dark theme)
│   │
│   └── assets/
│       ├── background.jpg
│       ├── logo.png
│       └── .gitkeep
│
├── public/                     # Arquivos estáticos
├── index.html                  # Página HTML principal
├── package.json                # Dependências
├── vite.config.js              # Config do build
├── vercel.json                 # Config de deploy
├── database.rules.json         # Regras de segurança Firebase
│
└── docs/
    ├── AUTENTICACAO.md         # Documentação de auth
    ├── AUDITORIA.md            # Sistema de auditoria
    └── DESENVOLVIMENTO.md       # Guia para desenvolvedores
```

## ⚡ Quick Start

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/siqueira-eduardo/atletico-champions.git
cd atletico-champions

# 2. Instalar dependências
npm install

# 3. Iniciar dev server
npm run dev
```

Acesse: `http://localhost:5173`

### Build para Produção

```bash
npm run build        # Gera /dist
npm run preview      # Preview local do build
```

## 🔐 Autenticação e Roles

### 4 Papéis Diferentes

| Role | Permissões | Acesso |
|------|-----------|--------|
| **👑 Admin** | Controle total | Editar tudo, auditoria |
| **🎖️ Capitão** | Gerenciar seu time | Editar jogadores do time |
| **⚽ Jogador** | Básico | Apenas visualizar e votar |
| **👁️ Visitante** | Nenhuma | Apenas visualizar |

### Login

**Email/Senha (Firebase):**
```javascript
// Sua conta no Firebase
email: seu@email.com
password: sua_senha
```

**PIN Local (Desenvolvimento):**
```
PIN: 3417
```

## 📚 Como Usar

### 1️⃣ Ver Classificação
Clique em **"🏆 Classificação"** para ver a tabela de pontos atualizada em tempo real

### 2️⃣ Lançar Resultado (Admin)
- Faça login como **Admin**
- Vá para **"📅 Jogos"**
- Clique no jogo para abrir **Súmula**
- Adicione gols, cartões, MVP
- Clique **"💾 Salvar Súmula"**

### 3️⃣ Votação para MVP
- Admin abre votação no jogo
- Jogadores votam com CPF
- MVP automático pela média (Admin pode alterar)

### 4️⃣ Adicionar Fotos
- Admin em **"📸 Fotos"**
- Cole link da imagem
- Fotos aparecem agrupadas por rodada

### 5️⃣ Ver Regras
Clique em **"📜 Regras"** para ver todas as normas da liga

## 🔄 Firebase Realtime Sync

Todos os dados são salvos em tempo real:

```
/atletico-9030f-default-rtdb.firebaseio.com/
├── resultados/
│   └── {rodada}-{jogo}: { casa, fora, placar }
├── gols/
│   └── {rodada}-{jogo}: [ { jogador, time, assistencia } ]
├── assistencias/
│   └── {rodada}-{jogo}: [ { jogador, time } ]
├── mvps/
│   └── {rodada}-{jogo}: "Nome do MVP"
├── sumulas/
│   └── {rodada}-{jogo}: { rodada, placar, gols, cartoes, observacoes }
├── votacoes/
│   └── {rodada}-{jogo}: { aberta, votos: { cpf_hash: { notas } } }
├── fotos/
│   └── {rodada}: [ { url, legenda } ]
├── auditlog/
│   └── { action, user, timestamp, details, beforeData, afterData }
└── admins/
    └── [ "admin@email.com" ]
```

## 🎨 Design

- **Tema:** Dark mode escuro (#0a0e1a)
- **Cores:**
  - Amarelo: #FFD700 (primária)
  - Vermelho: #f44336 (derrota/perigo)
  - Verde: #4caf50 (sucesso)
  - Azul: #6CABDD (info)
  - Roxo: #c084fc (destaque)

## 🚀 Deploy no Vercel

```bash
# 1. Commit suas mudanças
git add .
git commit -m "feat: sua mensagem"

# 2. Push para GitHub
git push origin main

# 3. Vercel faz deploy automático
# Sua app fica em: https://atletico-champions.vercel.app
```

## 📋 Abas Principais

| Aba | Descrição | Acesso |
|-----|-----------|--------|
| 🏆 Classificação | Tabela de pontos + evolução | Todos |
| ⚽ Artilheiros | Ranking de goleadores | Todos |
| 🎯 Assistências | Ranking de assistentes | Todos |
| 🌟 MVP | Ranking de MVPs | Todos |
| 📅 Jogos | Cronograma + Súmula | Admin edita |
| 👥 Elencos | Jogadores por time | Todos |
| 🔥 Mata-Mata | Fase eliminatória | Todos |
| 📜 Regras | Normas da liga | Todos |
| 📸 Fotos | Galeria de imagens | Admin adiciona |

## 🔧 Configuração

### Editar Dados da Liga

Abra `src/data.js`:

```javascript
export const TIMES = [
  { id: 1, nome: "Chelsea", capitao: "Eduardo Siqueira", ... },
  // Adicione ou edite times aqui
]

export const JOGADORES = [
  { nome: "Eduardo Siqueira", time: 1, funcao: "Capitão" },
  // Adicione ou edite jogadores aqui
]

export const RODADAS = [
  { rodada: 1, data: "03/07", jogos: [...] },
  // Edite as datas e jogos aqui
]
```

### Configurar Firebase

1. Crie um projeto em [Firebase Console](https://console.firebase.google.com)
2. Copie as credenciais
3. Edite `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "sua_api_key",
  authDomain: "seu_domain",
  databaseURL: "sua_url",
  projectId: "seu_project",
  // ...
}
```

## 🛡️ Regras de Segurança Firebase

Arquivo: `database.rules.json`

```json
{
  "rules": {
    "resultados": { ".read": true, ".write": "root.child('admins').val().contains(auth.token.email)" },
    "gols": { ".read": true, ".write": "root.child('admins').val().contains(auth.token.email)" },
    // ...
  }
}
```

Altere para seu domínio no Firebase Console.

## 📱 Mobile

O app é **100% responsivo**:
- ✅ Funciona em tablets
- ✅ Funciona em smartphones
- ✅ Interface adaptativa

## 🐛 Troubleshooting

### "Erro de autenticação"
- Verifique credenciais Firebase em `src/firebase.js`
- Habilite "Email/Password" em Firebase Authentication

### "Dados não aparecem"
- Verifique conexão com Firebase
- Verifique se você tem permissão de leitura no banco

### "Deploy não funciona no Vercel"
- Verifique variáveis de ambiente
- Confira permissões de build

## 📞 Suporte

Encontrou um bug? Abra uma [issue no GitHub](https://github.com/siqueira-eduardo/atletico-champions/issues)

## 📄 Licença

MIT - Livre para usar e modificar

## 👨‍💻 Desenvolvido por

**Eduardo Siqueira** - [GitHub](https://github.com/siqueira-eduardo)

---

**Última atualização:** Julho 2026
**Versão:** 1.0.0
