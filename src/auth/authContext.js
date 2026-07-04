import React, { createContext, useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { ref, onValue } from 'firebase/database'
import { auth, db } from '../firebase'
import { determineUserRole, ROLES } from './roleManager'

/**
 * AuthContext - Gerencia autenticação, roles e dados do usuário
 */
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null)
  const [userRole, setUserRole] = useState(ROLES.VISITANTE)
  const [userTeam, setUserTeam] = useState(null)
  const [admins, setAdmins] = useState([])
  const [times, setTimes] = useState({})
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [authMode, setAuthMode] = useState(null) // 'firebase', 'pin', ou null

  // Carregar lista de admins
  useEffect(() => {
    const adminsRef = ref(db, 'admins')
    const unsubscribe = onValue(adminsRef, snapshot => {
      const data = snapshot.val()
      setAdmins(data ? Object.values(data) : [])
    }, error => {
      console.warn('Erro ao carregar admins:', error)
    })
    return unsubscribe
  }, [])

  // Carregar dados dos times
  useEffect(() => {
    const timesRef = ref(db, 'times')
    const unsubscribe = onValue(timesRef, snapshot => {
      const data = snapshot.val()
      setTimes(data || {})
    }, error => {
      console.warn('Erro ao carregar times:', error)
    })
    return unsubscribe
  }, [])

  // Monitorar mudanças de autenticação Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setAuthUser(user)
        const role = determineUserRole(user.email, admins, times)
        setUserRole(role)
        setAuthMode('firebase')
        
        // Detectar time do usuário (se for capitão)
        const userTeamData = Object.values(times).find(
          t => t?.capitaoEmail === user.email
        )
        setUserTeam(userTeamData || null)
        
        setAuthError('')
      } else if (authMode === 'firebase') {
        // Saiu do Firebase, volta para visitante
        setAuthUser(null)
        setUserRole(ROLES.VISITANTE)
        setUserTeam(null)
        setAuthMode(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [admins, times, authMode])

  /**
   * Login com Email/Senha
   */
  const loginWithEmail = useCallback(async (email, password) => {
    setAuthError('')
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      return true
    } catch (error) {
      const errorMessages = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.',
        'auth/user-disabled': 'Usuário desativado',
      }
      const message = errorMessages[error.code] || 'Erro ao fazer login'
      setAuthError(message)
      console.error('Erro de login:', error)
      return false
    }
  }, [])

  /**
   * Login com PIN (local)
   */
  const loginWithPin = useCallback((pin) => {
    const SENHA_ADMIN_PIN = '3417'
    
    if (pin !== SENHA_ADMIN_PIN) {
      setAuthError('PIN incorreto')
      return false
    }

    setAuthUser({
      uid: 'local-pin-user',
      email: 'admin-local',
      isLocalPin: true,
    })
    setUserRole(ROLES.ADMIN)
    setAuthMode('pin')
    setAuthError('')
    return true
  }, [])

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setAuthError('')
    try {
      if (authMode === 'firebase') {
        await signOut(auth)
      }
      setAuthUser(null)
      setUserRole(ROLES.VISITANTE)
      setUserTeam(null)
      setAuthMode(null)
      return true
    } catch (error) {
      setAuthError('Erro ao fazer logout')
      console.error('Erro de logout:', error)
      return false
    }
  }, [authMode])

  /**
   * Verificar permissão
   */
  const hasPermission = useCallback((permission) => {
    const { hasPermission: checkPermission } = require('./roleManager')
    return checkPermission(userRole, permission)
  }, [userRole])

  /**
   * Obter informações do usuário
   */
  const getUserInfo = useCallback(() => {
    return {
      uid: authUser?.uid || null,
      email: authUser?.email || null,
      role: userRole,
      team: userTeam,
      isAuthenticated: !!authUser,
      isAdmin: userRole === ROLES.ADMIN,
      isCaptain: userRole === ROLES.CAPITAO,
      isPlayer: userRole === ROLES.JOGADOR,
      isVisitor: userRole === ROLES.VISITANTE,
      isLocalPin: authUser?.isLocalPin || false,
    }
  }, [authUser, userRole, userTeam])

  const value = {
    // Estado
    authUser,
    userRole,
    userTeam,
    loading,
    authError,
    authMode,

    // Métodos
    loginWithEmail,
    loginWithPin,
    logout,
    hasPermission,
    getUserInfo,

    // Dados
    admins,
    times,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
