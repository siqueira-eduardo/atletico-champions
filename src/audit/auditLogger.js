import { ref, push, set } from 'firebase/database'
import { db } from '../firebase'

/**
 * Sistema de Auditoria
 * Rastreia todas as mudanças importantes no sistema
 */

export const AUDIT_ACTIONS = {
  // Autenticação
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',

  // Resultados
  SUMULA_CRIADA: 'SUMULA_CRIADA',
  SUMULA_EDITADA: 'SUMULA_EDITADA',
  SUMULA_DELETADA: 'SUMULA_DELETADA',
  GOL_ADICIONADO: 'GOL_ADICIONADO',
  GOL_REMOVIDO: 'GOL_REMOVIDO',
  CARTAO_ADICIONADO: 'CARTAO_ADICIONADO',
  CARTAO_REMOVIDO: 'CARTAO_REMOVIDO',

  // Votação
  VOTACAO_ABERTA: 'VOTACAO_ABERTA',
  VOTACAO_FECHADA: 'VOTACAO_FECHADA',
  VOTO_REGISTRADO: 'VOTO_REGISTRADO',
  VOTOS_APAGADOS: 'VOTOS_APAGADOS',

  // Fotos
  FOTO_ADICIONADA: 'FOTO_ADICIONADA',
  FOTO_REMOVIDA: 'FOTO_REMOVIDA',

  // Dados
  JOGADOR_ADICIONADO: 'JOGADOR_ADICIONADO',
  JOGADOR_EDITADO: 'JOGADOR_EDITADO',
  JOGADOR_REMOVIDO: 'JOGADOR_REMOVIDO',
  TIME_EDITADO: 'TIME_EDITADO',

  // Segurança
  ADMIN_ADICIONADO: 'ADMIN_ADICIONADO',
  ADMIN_REMOVIDO: 'ADMIN_REMOVIDO',
  EXPORTACAO_REALIZADA: 'EXPORTACAO_REALIZADA',
}

/**
 * Descrições dos atos de auditoria
 */
const ACTION_LABELS = {
  LOGIN: '🔓 Login realizado',
  LOGOUT: '🔒 Logout realizado',
  LOGIN_FAILED: '❌ Falha de login',
  SUMULA_CRIADA: '📝 Nova súmula criada',
  SUMULA_EDITADA: '✏️ Súmula editada',
  SUMULA_DELETADA: '🗑️ Súmula deletada',
  GOL_ADICIONADO: '⚽ Gol adicionado',
  GOL_REMOVIDO: '🗑️ Gol removido',
  CARTAO_ADICIONADO: '🟨 Cartão adicionado',
  CARTAO_REMOVIDO: '🗑️ Cartão removido',
  VOTACAO_ABERTA: '🗳️ Votação aberta',
  VOTACAO_FECHADA: '🔒 Votação fechada',
  VOTO_REGISTRADO: '✅ Voto registrado',
  VOTOS_APAGADOS: '🗑️ Votos apagados',
  FOTO_ADICIONADA: '📸 Foto adicionada',
  FOTO_REMOVIDA: '🗑️ Foto removida',
  JOGADOR_ADICIONADO: '➕ Jogador adicionado',
  JOGADOR_EDITADO: '✏️ Jogador editado',
  JOGADOR_REMOVIDO: '🗑️ Jogador removido',
  TIME_EDITADO: '✏️ Time editado',
  ADMIN_ADICIONADO: '👑 Admin adicionado',
  ADMIN_REMOVIDO: '🗑️ Admin removido',
  EXPORTACAO_REALIZADA: '💾 Exportação realizada',
}

/**
 * Registra um evento de auditoria
 * @param {string} action - Tipo de ação
 * @param {object} user - Usuário que realizou a ação
 * @param {object} details - Detalhes adicionais
 * @param {object} beforeData - Dados antes da mudança (para comparação)
 * @param {object} afterData - Dados depois da mudança (para comparação)
 */
export const logAudit = async (
  action,
  user,
  details = {},
  beforeData = null,
  afterData = null
) => {
  try {
    const timestamp = new Date().toISOString()
    const auditRef = push(ref(db, 'auditlog'))

    const auditEntry = {
      action,
      actionLabel: ACTION_LABELS[action] || action,
      timestamp,
      user: {
        uid: user?.uid || 'unknown',
        email: user?.email || 'unknown',
        role: user?.role || 'unknown',
      },
      details,
      beforeData,
      afterData,
      changes: getChanges(beforeData, afterData),
    }

    await set(auditRef, auditEntry)
    return auditEntry
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error)
  }
}

/**
 * Detecta mudanças entre dois objetos
 * @param {object} before - Estado anterior
 * @param {object} after - Estado novo
 * @returns {object}
 */
const getChanges = (before, after) => {
  if (!before || !after) return null

  const changes = {}
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ])

  allKeys.forEach(key => {
    const beforeValue = before?.[key]
    const afterValue = after?.[key]

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes[key] = {
        before: beforeValue,
        after: afterValue,
      }
    }
  })

  return Object.keys(changes).length > 0 ? changes : null
}

/**
 * Auditoria de Login
 */
export const auditLogin = async (user, success = true) => {
  const action = success ? AUDIT_ACTIONS.LOGIN : AUDIT_ACTIONS.LOGIN_FAILED
  return logAudit(action, user, {
    email: user?.email || 'unknown',
    method: user?.isLocalPin ? 'PIN' : 'Firebase',
  })
}

/**
 * Auditoria de Logout
 */
export const auditLogout = async (user) => {
  return logAudit(AUDIT_ACTIONS.LOGOUT, user, {
    email: user?.email || 'unknown',
  })
}

/**
 * Auditoria de Súmula
 */
export const auditSumula = async (user, action, rodada, jogo, before, after) => {
  return logAudit(action, user, {
    rodada,
    jogo,
    tipo: 'SUMULA',
  }, before, after)
}

/**
 * Auditoria de Gol
 */
export const auditGol = async (user, action, rodada, jogo, jogador, assistente) => {
  return logAudit(action, user, {
    rodada,
    jogo,
    jogador,
    assistente,
    tipo: 'GOL',
  })
}

/**
 * Auditoria de Cartão
 */
export const auditCartao = async (user, action, rodada, jogo, jogador, tipo) => {
  return logAudit(action, user, {
    rodada,
    jogo,
    jogador,
    tipoCartao: tipo,
    tipo: 'CARTAO',
  })
}

/**
 * Auditoria de Votação
 */
export const auditVotacao = async (user, action, rodada, jogo) => {
  return logAudit(action, user, {
    rodada,
    jogo,
    tipo: 'VOTACAO',
  })
}

/**
 * Auditoria de Foto
 */
export const auditFoto = async (user, action, rodada, url) => {
  return logAudit(action, user, {
    rodada,
    url,
    tipo: 'FOTO',
  })
}

/**
 * Auditoria de Jogador
 */
export const auditJogador = async (user, action, jogador, before, after) => {
  return logAudit(action, user, {
    jogador,
    tipo: 'JOGADOR',
  }, before, after)
}

/**
 * Auditoria de Exportação
 */
export const auditExportacao = async (user, tipo, detalhes) => {
  return logAudit(AUDIT_ACTIONS.EXPORTACAO_REALIZADA, user, {
    tipoExportacao: tipo,
    detalhes,
    tipo: 'EXPORTACAO',
  })
}

/**
 * Formata entrada de auditoria para exibição
 */
export const formatAuditEntry = (entry) => {
  const date = new Date(entry.timestamp)
  const timeStr = date.toLocaleTimeString('pt-BR')
  const dateStr = date.toLocaleDateString('pt-BR')

  return {
    ...entry,
    formattedTime: timeStr,
    formattedDate: dateStr,
    formattedDateTime: `${dateStr} ${timeStr}`,
  }
}

/**
 * Formata mudanças em texto legível
 */
export const formatChanges = (changes) => {
  if (!changes) return 'Sem mudanças'

  return Object.entries(changes)
    .map(([key, { before, after }]) => {
      return `${key}: "${before}" → "${after}"`
    })
    .join('; ')
}
