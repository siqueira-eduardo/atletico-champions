# 📋 Sistema de Auditoria

## O que é Auditoria?

Auditoria é um **registro de todas as mudanças importantes** no sistema. Permite:
- 🔍 Rastrear quem fez o quê
- ⏰ Quando foi feito
- 📝 Antes e depois da mudança
- 🔒 Segurança e conformidade

## Eventos Auditados

### 🔐 Autenticação
- `LOGIN` - Alguém fez login
- `LOGOUT` - Alguém saiu
- `LOGIN_FAILED` - Tentativa de login falhou

### 📊 Resultados de Jogos
- `SUMULA_CRIADA` - Nova súmula criada
- `SUMULA_EDITADA` - Súmula alterada
- `SUMULA_DELETADA` - Súmula removida
- `GOL_ADICIONADO` - Gol registrado
- `GOL_REMOVIDO` - Gol removido
- `CARTAO_ADICIONADO` - Cartão aplicado
- `CARTAO_REMOVIDO` - Cartão removido

### 🗳️ Votação
- `VOTACAO_ABERTA` - Votação iniciada
- `VOTACAO_FECHADA` - Votação encerrada
- `VOTO_REGISTRADO` - Voto computado
- `VOTOS_APAGADOS` - Votos limpos

### 📸 Mídia
- `FOTO_ADICIONADA` - Foto enviada
- `FOTO_REMOVIDA` - Foto deletada

### 👥 Dados
- `JOGADOR_ADICIONADO` - Novo jogador
- `JOGADOR_EDITADO` - Jogador alterado
- `JOGADOR_REMOVIDO` - Jogador removido
- `TIME_EDITADO` - Time alterado

### 🔑 Segurança
- `ADMIN_ADICIONADO` - Novo admin
- `ADMIN_REMOVIDO` - Admin removido
- `EXPORTACAO_REALIZADA` - Backup exportado

## Como Registrar um Evento

### Método Genérico

```javascript
import { logAudit } from '../audit/auditLogger'

const salvarResultado = async () => {
  const usuarioAtual = {
    uid: authUser.uid,
    email: authUser.email,
    role: userRole
  }

  const dadosAntes = { placar: '0 x 0' }  // Estado anterior
  const dadosDepois = { placar: '3 x 2' } // Estado novo

  await logAudit(
    'SUMULA_EDITADA',           // Tipo de ação
    usuarioAtual,               // Quem fez
    {
      rodada: 1,
      jogo: 0,
      detalhes: 'Resultado do Chelsea vs Juventus'
    },
    dadosAntes,                 // Antes
    dadosDepois                 // Depois
  )
}
```

### Métodos Simplificados

#### Login
```javascript
import { auditLogin } from '../audit/auditLogger'

const handleLogin = async (email, password) => {
  try {
    const success = await loginWithEmail(email, password)
    await auditLogin({ email, role: userRole }, success)
  } catch (error) {
    // erro
  }
}
```

#### Logout
```javascript
import { auditLogout } from '../audit/auditLogger'

const handleLogout = async () => {
  await auditLogout({ email: authUser.email, role: userRole })
  await logout()
}
```

#### Gol
```javascript
import { auditGol, AUDIT_ACTIONS } from '../audit/auditLogger'

const adicionarGol = async (jogador, assistente) => {
  await auditGol(
    usuarioAtual,
    AUDIT_ACTIONS.GOL_ADICIONADO,
    1,  // rodada
    0,  // jogo
    'Eduardo Siqueira',  // jogador
    'Maguila'           // assistente
  )
}
```

#### Súmula
```javascript
import { auditSumula, AUDIT_ACTIONS } from '../audit/auditLogger'

const salvarSumula = async () => {
  const sumulaAntes = sumulas[modalJogo.key]
  const sumulaDepois = { /* nova súmula */ }

  await auditSumula(
    usuarioAtual,
    AUDIT_ACTIONS.SUMULA_EDITADA,
    1,  // rodada
    0,  // jogo
    sumulaAntes,
    sumulaDepois
  )
}
```

## Visualizar Auditoria

### No Firebase Console

1. Vá em [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Realtime Database**
4. Procure por **`auditlog`**
5. Veja todos os eventos registrados

### Estrutura de um Evento

```json
{
  "-MjQ3QmXyZaB1234567890": {
    "action": "SUMULA_EDITADA",
    "actionLabel": "✏️ Súmula editada",
    "timestamp": "2026-07-04T19:30:00.000Z",
    "user": {
      "uid": "user123",
      "email": "admin@email.com",
      "role": "admin"
    },
    "details": {
      "rodada": 1,
      "jogo": 0,
      "tipo": "SUMULA"
    },
    "beforeData": {
      "placar": { "casa": "0", "fora": "0" },
      "gols": []
    },
    "afterData": {
      "placar": { "casa": "3", "fora": "2" },
      "gols": [
        { "jogador": "Eduardo", "time": 1 },
        { "jogador": "Eduardo", "time": 1 },
        { "jogador": "Maguila", "time": 1 },
        { "jogador": "Dioguinho", "time": 2 },
        { "jogador": "Enrique", "time": 2 }
      ]
    },
    "changes": {
      "placar": {
        "before": "0 x 0",
        "after": "3 x 2"
      },
      "gols": {
        "before": [],
        "after": [/* 5 gols */]
      }
    }
  }
}
```

## Exportar Auditoria

### Como JSON

```javascript
import { ref, get } from 'firebase/database'
import { db } from '../firebase'

const exportarAuditoria = async () => {
  const auditRef = ref(db, 'auditlog')
  const snapshot = await get(auditRef)
  const dados = snapshot.val()

  const json = JSON.stringify(dados, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `auditoria-${new Date().toISOString()}.json`
  a.click()
}
```

### Como CSV

```javascript
const exportarAuditoriaCSV = async () => {
  const auditRef = ref(db, 'auditlog')
  const snapshot = await get(auditRef)
  const dados = snapshot.val()

  const linhas = [[
    'Data/Hora',
    'Ação',
    'Usuário',
    'Email',
    'Role',
    'Detalhes',
    'Antes',
    'Depois'
  ]]

  Object.values(dados || {}).forEach(event => {
    linhas.push([
      event.timestamp,
      event.actionLabel,
      event.user.uid,
      event.user.email,
      event.user.role,
      JSON.stringify(event.details),
      JSON.stringify(event.beforeData),
      JSON.stringify(event.afterData)
    ])
  })

  const csv = linhas
    .map(linha => linha.map(v => `"${v}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `auditoria-${new Date().toISOString()}.csv`
  a.click()
}
```

## Conformidade e Segurança

### LGPD (Lei Geral de Proteção de Dados)

O sistema segue princípios LGPD:

✅ **Transparência**
- Logs mostram quem acessou/mudou dados
- Timestamps precisos

✅ **Responsabilidade**
- Rastreio de quem fez cada mudança
- Email e role registrados

✅ **Direito ao Esquecimento**
- Dados podem ser apagados
- Auditoria preservada (sem dados pessoais sensíveis)

✅ **Segurança**
- Apenas admins veem logs
- Salvo no Firebase com criptografia
- HTTPS sempre

### Política de Retenção

```javascript
// Manter por 90 dias e depois arquivar
const arquivarLogsAntigos = async () => {
  const dias90Atras = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  
  const auditRef = ref(db, 'auditlog')
  const snapshot = await get(auditRef)
  
  Object.entries(snapshot.val() || {}).forEach(([id, event]) => {
    if (new Date(event.timestamp) < dias90Atras) {
      // Mover para arquivo
      // Ou deletar
    }
  })
}
```

## Relatórios

### Atividade por Usuário

```javascript
const relatorioAtividadeUsuario = (email) => {
  const auditRef = ref(db, `auditlog`)
  
  return get(auditRef).then(snapshot => {
    const eventos = Object.values(snapshot.val() || {})
      .filter(e => e.user.email === email)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return {
      email,
      totalEventos: eventos.length,
      ultimoAcesso: eventos[0]?.timestamp,
      eventos
    }
  })
}
```

### Mudanças em um Jogo

```javascript
const relatorioMudancasJogo = (rodada, jogo) => {
  const auditRef = ref(db, `auditlog`)
  
  return get(auditRef).then(snapshot => {
    const eventos = Object.values(snapshot.val() || {})
      .filter(e => 
        e.details?.rodada === rodada && 
        e.details?.jogo === jogo
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    return {
      rodada,
      jogo,
      totalMudancas: eventos.length,
      timeline: eventos.map(e => ({
        hora: new Date(e.timestamp).toLocaleTimeString('pt-BR'),
        acao: e.actionLabel,
        usuario: e.user.email,
        mudancas: e.changes
      }))
    }
  })
}
```

## Boas Práticas

1. **Sempre registre ações importantes**
   ```javascript
   // ✅ CERTO
   await logAudit(action, user, details, before, after)
   ```

2. **Inclua contexto suficiente**
   ```javascript
   // ✅ CERTO
   await logAudit(
     'GOL_ADICIONADO',
     user,
     {
       rodada: 1,
       jogo: 0,
       jogador: 'Eduardo',
       assistente: 'Maguila'
     }
   )

   // ❌ ERRADO (sem contexto)
   await logAudit('GOL_ADICIONADO', user, {})
   ```

3. **Não exponha dados sensíveis**
   ```javascript
   // ❌ ERRADO
   await logAudit(
     'LOGIN',
     user,
     { senha: password }  // NUNCA!
   )

   // ✅ CERTO
   await logAudit(
     'LOGIN',
     user,
     { metodo: 'email' }
   )
   ```

4. **Use antes/depois para mudanças**
   ```javascript
   // ✅ CERTO - Rastrear o que mudou
   await logAudit(
     'JOGADOR_EDITADO',
     user,
     { jogador: 'Eduardo' },
     { numero: 10, posicao: 'Goleiro' },    // Antes
     { numero: 10, posicao: 'Atacante' }    // Depois
   )
   ```

## Dashboard de Auditoria (Futuro)

Planejado:
- 📊 Gráficos de atividade por hora/dia
- 🔍 Filtros avançados (data, usuário, ação)
- 📥 Exportação em múltiplos formatos
- 🔔 Alertas de ações suspeitas
- 📈 Relatórios automáticos

---

**Relacionado:** Veja `docs/AUTENTICACAO.md` para entender roles e permissões.
