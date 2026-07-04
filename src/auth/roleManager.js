/**
 * Sistema de Gerenciamento de Roles (Papéis)
 * Define permissões e controle de acesso por tipo de usuário
 */

export const ROLES = {
  ADMIN: 'admin',           // Controle total
  CAPITAO: 'capitao',       // Capitão do time
  JOGADOR: 'jogador',       // Jogador registrado
  VISITANTE: 'visitante',   // Apenas visualização
}

export const ROLE_LABELS = {
  admin: '👑 Administrador',
  capitao: '🎖️ Capitão',
  jogador: '⚽ Jogador',
  visitante: '👁️ Visitante',
}

/**
 * Permissões por role
 * Define o que cada papel pode fazer
 */
export const PERMISSIONS = {
  // Admin - Controle total
  admin: {
    // Édição de resultados
    editarResultados: true,
    criarSumula: true,
    editarSumula: true,
    excluirSumula: true,
    
    // Gerenciamento de dados
    adicionarJogador: true,
    editarJogador: true,
    removerJogador: true,
    editarTimes: true,
    
    // Votação
    abrirVotacao: true,
    fecharVotacao: true,
    apagarVotos: true,
    
    // Fotos
    adicionarFoto: true,
    removerFoto: true,
    
    // Auditoria
    verAuditoria: true,
    exportarAuditoria: true,
    exportarBackup: true,
    
    // Segurança
    gerenciarAdmins: true,
    resetarSenhas: true,
  },

  // Capitão - Gerencia seu time
  capitao: {
    editarResultados: false,
    criarSumula: false,
    editarSumula: false,
    excluirSumula: false,
    
    adicionarJogador: false,
    editarJogador: true,    // Apenas seu time
    removerJogador: false,
    editarTimes: false,
    
    abrirVotacao: false,
    fecharVotacao: false,
    apagarVotos: false,
    
    adicionarFoto: true,    // Fotos de seu time
    removerFoto: false,
    
    verAuditoria: false,
    exportarAuditoria: false,
    exportarBackup: false,
    
    gerenciarAdmins: false,
    resetarSenhas: false,
  },

  // Jogador - Apenas votação e visualização
  jogador: {
    editarResultados: false,
    criarSumula: false,
    editarSumula: false,
    excluirSumula: false,
    
    adicionarJogador: false,
    editarJogador: false,
    removerJogador: false,
    editarTimes: false,
    
    abrirVotacao: false,
    fecharVotacao: false,
    apagarVotos: false,
    
    adicionarFoto: false,
    removerFoto: false,
    
    verAuditoria: false,
    exportarAuditoria: false,
    exportarBackup: false,
    
    gerenciarAdmins: false,
    resetarSenhas: false,
  },

  // Visitante - Apenas visualização
  visitante: {
    editarResultados: false,
    criarSumula: false,
    editarSumula: false,
    excluirSumula: false,
    
    adicionarJogador: false,
    editarJogador: false,
    removerJogador: false,
    editarTimes: false,
    
    abrirVotacao: false,
    fecharVotacao: false,
    apagarVotos: false,
    
    adicionarFoto: false,
    removerFoto: false,
    
    verAuditoria: false,
    exportarAuditoria: false,
    exportarBackup: false,
    
    gerenciarAdmins: false,
    resetarSenhas: false,
  },
}

/**
 * Verifica se um usuário tem uma permissão específica
 * @param {string} role - Role do usuário
 * @param {string} permission - Permissão a verificar
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  if (!role || !PERMISSIONS[role]) return false
  return PERMISSIONS[role][permission] === true
}

/**
 * Verifica se um usuário tem qualquer uma das permissões
 * @param {string} role - Role do usuário
 * @param {array} permissions - Array de permissões
 * @returns {boolean}
 */
export const hasAnyPermission = (role, permissions = []) => {
  return permissions.some(perm => hasPermission(role, perm))
}

/**
 * Retorna todas as permissões de um role
 * @param {string} role - Role do usuário
 * @returns {object}
 */
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || PERMISSIONS.visitante
}

/**
 * Determina o role de um usuário baseado no email
 * @param {string} email - Email do usuário
 * @param {array} admins - Lista de emails de admin
 * @param {object} times - Dados dos times
 * @returns {string}
 */
export const determineUserRole = (email, admins = [], times = {}) => {
  if (!email) return ROLES.VISITANTE

  // Verificar se é admin
  if (admins.includes(email)) {
    return ROLES.ADMIN
  }

  // Verificar se é capitão
  const timesArray = Array.isArray(times) ? times : Object.values(times || {})
  const isCaptain = timesArray.some(time =>
    time?.capitaoEmail === email
  )
  
  if (isCaptain) {
    return ROLES.CAPITAO
  }

  // Verificar se é jogador
  const isPlayer = timesArray.some(time =>
    time?.jogadores?.some(j => j.email === email)
  )

  if (isPlayer) {
    return ROLES.JOGADOR
  }

  // Padrão: visitante
  return ROLES.VISITANTE
}

/**
 * Retorna a lista de permissões em português
 * @param {string} role - Role do usuário
 * @returns {array}
 */
export const getPermissionsList = (role) => {
  const permissions = getRolePermissions(role)
  const labels = {
    editarResultados: '✏️ Editar resultados de jogos',
    criarSumula: '📝 Criar nova súmula',
    editarSumula: '✏️ Editar súmula existente',
    excluirSumula: '🗑️ Deletar súmula',
    adicionarJogador: '➕ Adicionar jogador',
    editarJogador: '✏️ Editar dados de jogador',
    removerJogador: '🗑️ Remover jogador',
    editarTimes: '✏️ Editar times',
    abrirVotacao: '🗳️ Abrir votação MVP',
    fecharVotacao: '🔒 Fechar votação',
    apagarVotos: '🗑️ Apagar votos',
    adicionarFoto: '📸 Adicionar fotos',
    removerFoto: '🗑️ Remover fotos',
    verAuditoria: '📋 Ver log de auditoria',
    exportarAuditoria: '📥 Exportar auditoria',
    exportarBackup: '💾 Exportar backup',
    gerenciarAdmins: '👑 Gerenciar admins',
    resetarSenhas: '🔑 Resetar senhas',
  }

  return Object.entries(permissions)
    .filter(([_, hasPermission]) => hasPermission)
    .map(([key, _]) => labels[key] || key)
}
