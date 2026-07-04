# 🔐 Guia de Autenticação e Roles

## Visão Geral

O sistema de autenticação do **Atletico Champions** foi projetado para controlar acesso baseado em **roles** (papéis). Cada usuário tem um papel que define suas permissões.

## 4 Roles Disponíveis

### 👑 Admin
**Controle Total**

Permissões:
- ✅ Editar resultados de jogos
- ✅ Criar e editar súmulas
- ✅ Adicionar gols, assistências, cartões
- ✅ Abrir e fechar votações
- ✅ Ver auditoria completa
- ✅ Exportar backups
- ✅ Gerenciar admins
- ✅ Adicionar e remover fotos

```javascript
const userInfo = {
  role: 'admin',
  email: 'admin@email.com',
  permissions: { editarResultados: true, ... }
}
```

### 🎖️ Capitão
**Gerencia seu Time**

Permissões:
- ✅ Editar dados dos jogadores de seu time
- ✅ Adicionar fotos do time
- ❌ Editar resultados
- ❌ Ver auditoria

```javascript
const userInfo = {
  role: 'capitao',
  email: 'capitao@email.com',
  team: { id: 1, nome: 'Chelsea' }
}
```

### ⚽ Jogador
**Acesso Básico**

Permissões:
- ✅ Visualizar classificação
- ✅ Participar de votações (MVP)
- ✅ Ver estatísticas e fotos
- ❌ Editar dados
- ❌ Lançar resultados

```javascript
const userInfo = {
  role: 'jogador',
  email: 'jogador@email.com',
}
```

### 👁️ Visitante
**Apenas Visualização**

Permissões:
- ✅ Ver classificação
- ✅ Ver fotos
- ✅ Ver regras
- ❌ Tudo mais

```javascript
const userInfo = {
  role: 'visitante',
  email: null,
}
```

## Como Funciona a Autenticação

### 1. AuthProvider (Contexto Global)

O `AuthProvider` envolve toda a aplicação e gerencia:
- Estado de autenticação
- Dados do usuário
- Role atual
- Métodos de login/logout

```jsx
// main.jsx
import { AuthProvider } from './auth/authContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)
```

### 2. useAuth Hook

Use em qualquer componente para acessar dados de autenticação:

```jsx
import { useAuth } from '../auth/authContext'

function MeuComponente() {
  const { authUser, userRole, hasPermission, logout } = useAuth()

  return (
    <div>
      <p>Olá, {authUser?.email}</p>
      <p>Seu role: {userRole}</p>
      {hasPermission('editarResultados') && (
        <button>Editar Resultado</button>
      )}
    </div>
  )
}
```

## Login

### Opção 1: Email/Senha (Firebase)

```javascript
const { loginWithEmail } = useAuth()

// Fazer login
await loginWithEmail('admin@email.com', 'senha123')
```

**Passos:**
1. Vá para [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Authentication** → **Users**
4. Clique **Add user**
5. Insira email e senha
6. Clique **Create user**

### Opção 2: PIN Local (Desenvolvimento)

```javascript
const { loginWithPin } = useAuth()

// Fazer login com PIN
loginWithPin('3417')  // PIN padrão para desenvolvimento
```

**Nota:** PIN é apenas para desenvolvimento. Use Firebase em produção.

## RoleGuard - Proteção por Permissão

### Exemplo 1: Esconder elemento se não tiver permissão

```jsx
import { RoleGuard } from '../components/RoleGuard'

<RoleGuard permission="editarResultados">
  <button onClick={salvarResultado}>Salvar Resultado</button>
</RoleGuard>

// Se não tiver permissão, o botão não aparece
```

### Exemplo 2: Mostrar mensagem de acesso negado

```jsx
import { ProtectedSection } from '../components/RoleGuard'

<ProtectedSection
  permission="verAuditoria"
  title="Seção de Auditoria"
  message="Apenas admins podem ver isso"
>
  <AuditLog />
</ProtectedSection>

// Se não tiver permissão, mostra mensagem
```

### Exemplo 3: Múltiplas permissões

```jsx
<RoleGuard
  permissions={['editarResultados', 'criarSumula']}
  requireAll={true}  // Precisa de TODAS as permissões
>
  <button>Criar Súmula</button>
</RoleGuard>
```

### Exemplo 4: Hook na lógica

```jsx
function MeuComponente() {
  const { useHasPermission } = useAuth()
  const podeEditar = useHasPermission('editarResultados')

  if (!podeEditar) {
    return <div>Sem permissão</div>
  }

  return <FormularioEdicao />
}
```

## Determinar Role de um Usuário

### Fluxo Automático

```javascript
const determineUserRole = (email, admins, times) => {
  // 1. Verifica se é admin
  if (admins.includes(email)) return 'admin'

  // 2. Verifica se é capitão
  const isCaptain = times.some(t => t.capitaoEmail === email)
  if (isCaptain) return 'capitao'

  // 3. Verifica se é jogador
  const isPlayer = times.some(t =>
    t.jogadores.some(j => j.email === email)
  )
  if (isPlayer) return 'jogador'

  // 4. Padrão: visitante
  return 'visitante'
}
```

### Dados Esperados no Firebase

```json
{
  "admins": [
    "admin@email.com",
    "outro-admin@email.com"
  ],
  "times": [
    {
      "id": 1,
      "nome": "Chelsea",
      "capitaoEmail": "capitao@email.com",
      "jogadores": [
        { "nome": "João", "email": "joao@email.com" },
        { "nome": "Maria", "email": "maria@email.com" }
      ]
    }
  ]
}
```

## Logout

```javascript
const { logout } = useAuth()

// Fazer logout
await logout()
```

Efeitos:
- ✅ Remove token Firebase
- ✅ Limpa dados do usuário
- ✅ Volta para role 'visitante'
- ✅ Registra na auditoria

## Segurança

### Boas Práticas

1. **Nunca confie apenas no frontend**
   ```javascript
   // ❌ ERRADO - Segurança falsa
   if (role === 'admin') {
     // fazer coisa importante
   }
   // Admin pode mudar no Dev Tools!
   ```

   ```javascript
   // ✅ CERTO - Validar no Firebase
   // Usar database.rules.json para proteger
   {
     "rules": {
       "resultados": {
         ".write": "root.child('admins').val().contains(auth.token.email)"
       }
     }
   }
   ```

2. **Use HTTPS sempre** - Firebase força HTTPS

3. **Guarde senhas com segurança**
   - Nunca guardar em localStorage
   - Firebase gerencia automaticamente

4. **Alterar PIN em produção**
   ```javascript
   // src/auth/authContext.js
   const SENHA_ADMIN_PIN = 'SEU_PIN_AQUI'  // Mude isso!
   ```

## Fluxo de Autenticação Completo

```
┌─────────────────────────────────────────────────────┐
│ Usuário acessa o app (visitante)                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Clica no login │
        └────────┬───────┘
                 │
        ┌────────┴──────────┐
        │                   │
        ▼                   ▼
  ┌─────────┐         ┌─────────┐
  │ Email   │         │ PIN     │
  └────┬────┘         └────┬────┘
       │                   │
       ▼                   ▼
    Firebase           Local
       │                   │
       └─────────┬─────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │ Autenticado? SIM/NÃO   │
    └────────┬───────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
     SIM           NÃO
      │             │
      ▼             ▼
  ┌─────────┐  ┌──────────┐
  │ Carregar│  │ Erro     │
  │ role    │  │ "Senha   │
  └────┬────┘  │ incorreta"│
       │       └──────────┘
       ▼
  ┌─────────────────────┐
  │ determineUserRole() │
  └────────┬────────────┘
           │
    ┌──────┴──────┬──────────┬─────────┐
    │             │          │         │
    ▼             ▼          ▼         ▼
  ADMIN       CAPITAO    JOGADOR   VISITANTE
    │             │          │         │
    └─────────────┼──────────┼─────────┘
                  │          │
                  ▼          ▼
           ┌──────────────────┐
           │ Definir           │
           │ permissões        │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │ App pronto para   │
           │ usar (com acesso  │
           │ controlado)       │
           └──────────────────┘
```

## Tratamento de Erros

```javascript
const { authError, loginWithEmail } = useAuth()

await loginWithEmail(email, password)

if (authError) {
  // authError contém:
  // - "Email inválido"
  // - "Usuário não encontrado"
  // - "Senha incorreta"
  // - "Muitas tentativas. Tente mais tarde."
  console.error(authError)
}
```

## Próximos Passos

1. ✅ Integrar `AuthProvider` no `main.jsx`
2. ✅ Usar `useAuth` nos componentes
3. ✅ Adicionar `RoleGuard` em botões/seções
4. ✅ Configurar regras no Firebase
5. ✅ Testar cada role

---

**Mais informações:** Veja `docs/AUDITORIA.md` para entender o sistema de logs.
