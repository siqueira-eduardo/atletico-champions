import React, { useState } from 'react'
import { useAuth } from '../auth/authContext'
import { ROLE_LABELS, getPermissionsList } from '../auth/roleManager'
import { auditLogin, auditLogout } from '../audit/auditLogger'

/**
 * Modal de Login Melhorado
 * Suporta Email/Senha e PIN local
 */
export const LoginModal = ({ isOpen, onClose }) => {
  const { authUser, loginWithEmail, loginWithPin, logout, authError, userRole, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [mode, setMode] = useState('email') // 'email' ou 'pin'
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLoginEmail = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)

    try {
      const success = await loginWithEmail(email, password)
      if (success) {
        await auditLogin(
          { email, role: userRole },
          true
        )
        setEmail('')
        setPassword('')
        onClose?.()
      }
    } catch (error) {
      console.error('Erro no login:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLoginPin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)

    try {
      const success = loginWithPin(pin)
      if (success) {
        await auditLogin(
          { email: 'admin-local', role: 'admin', method: 'PIN' },
          true
        )
        setPin('')
        onClose?.()
      }
    } catch (error) {
      console.error('Erro no login PIN:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auditLogout({
        email: authUser?.email,
        role: userRole,
      })
      await logout()
      onClose?.()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (!isOpen) return null

  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      padding: 16,
    },
    modal: {
      background: '#111827',
      border: '1px solid #1e2d5a',
      borderRadius: 16,
      width: '100%',
      maxWidth: 420,
      maxHeight: '90vh',
      overflowY: 'auto',
      padding: 24,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: 800,
      color: '#fff',
      margin: 0,
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: '#6b7db3',
      fontSize: 24,
      cursor: 'pointer',
    },
    userInfo: {
      background: '#0d1228',
      border: '1px solid #4caf5055',
      borderRadius: 10,
      padding: 16,
      marginBottom: 20,
    },
    userEmail: {
      fontSize: 13,
      color: '#6b7db3',
      marginBottom: 4,
    },
    userRole: {
      fontSize: 18,
      fontWeight: 800,
      color: '#4caf50',
      marginBottom: 12,
    },
    permissionsList: {
      fontSize: 12,
      color: '#8899cc',
      lineHeight: 1.6,
    },
    form: {
      display: 'grid',
      gap: 12,
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      background: '#1a1f3a',
      border: '1px solid #1e2d5a',
      borderRadius: 8,
      color: '#fff',
      fontSize: 13,
      fontFamily: 'inherit',
    },
    button: {
      width: '100%',
      padding: '12px',
      background: '#FFD700',
      border: 'none',
      borderRadius: 8,
      fontWeight: 800,
      fontSize: 13,
      cursor: 'pointer',
      color: '#0a0e1a',
      transition: 'all 0.2s',
    },
    buttonSecondary: {
      width: '100%',
      padding: '10px',
      background: 'none',
      border: '1px solid #1e2d5a',
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      color: '#6b7db3',
      transition: 'all 0.2s',
    },
    buttonDanger: {
      width: '100%',
      padding: '10px',
      background: '#f4433622',
      border: '1px solid #f4433655',
      borderRadius: 8,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      color: '#f44336',
      transition: 'all 0.2s',
    },
    tabs: {
      display: 'flex',
      gap: 8,
      marginBottom: 20,
    },
    tab: {
      flex: 1,
      padding: '10px',
      background: '#1a1f3a',
      border: '1px solid #1e2d5a',
      borderRadius: 8,
      color: '#6b7db3',
      fontWeight: 600,
      fontSize: 12,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    tabActive: {
      background: '#FFD700',
      color: '#0a0e1a',
      borderColor: '#FFD700',
    },
    error: {
      fontSize: 12,
      color: '#f44336',
      background: '#f4433611',
      border: '1px solid #f4433633',
      padding: '10px 12px',
      borderRadius: 6,
      marginBottom: 12,
    },
    info: {
      fontSize: 11,
      color: '#6CABDD',
      background: '#6CABDD11',
      border: '1px solid #6CABDD33',
      padding: '10px 12px',
      borderRadius: 6,
      marginBottom: 12,
    },
  }

  // Se já está autenticado
  if (authUser) {
    const permissions = getPermissionsList(userRole)

    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>👤 Seu Perfil</h2>
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          <div style={styles.userInfo}>
            <div style={styles.userEmail}>
              📧 {authUser.email}
            </div>
            <div style={styles.userRole}>
              {ROLE_LABELS[userRole]}
            </div>
            <div style={styles.permissionsList}>
              <strong>Permissões:</strong>
              <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                {permissions.length > 0 ? (
                  permissions.map((perm, i) => (
                    <li key={i}>{perm}</li>
                  ))
                ) : (
                  <li>Acesso de visualização apenas</li>
                )}
              </ul>
            </div>
          </div>

          <button
            style={{...styles.buttonDanger, marginBottom: 8}}
            onClick={handleLogout}
          >
            🔒 Fazer Logout
          </button>
          <button
            style={styles.buttonSecondary}
            onClick={onClose}
          >
            ✕ Fechar
          </button>
        </div>
      </div>
    )
  }

  // Se está carregando
  if (loading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <div style={{ color: '#FFD700', fontWeight: 700 }}>
              Carregando...
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Formulário de login
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>🔐 Fazer Login</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {authError && (
          <div style={styles.error}>
            ❌ {authError}
          </div>
        )}

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(mode === 'email' ? styles.tabActive : {}),
            }}
            onClick={() => setMode('email')}
          >
            📧 Email
          </button>
          <button
            style={{
              ...styles.tab,
              ...(mode === 'pin' ? styles.tabActive : {}),
            }}
            onClick={() => setMode('pin')}
          >
            🔑 PIN
          </button>
        </div>

        {mode === 'email' ? (
          <>
            <div style={styles.info}>
              💡 Login com email e senha do Firebase
            </div>
            <form style={styles.form} onSubmit={handleLoginEmail}>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
                disabled={isLoggingIn}
              />
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                disabled={isLoggingIn}
                onKeyPress={e => e.key === 'Enter' && handleLoginEmail(e)}
              />
              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: isLoggingIn ? 0.6 : 1,
                }}
                disabled={isLoggingIn || !email || !password}
              >
                {isLoggingIn ? '⏳ Entrando...' : '✓ Entrar'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={styles.info}>
              🔑 PIN de teste: 3417 (apenas desenvolvimento)
            </div>
            <form style={styles.form} onSubmit={handleLoginPin}>
              <input
                type="password"
                placeholder="Digite o PIN"
                value={pin}
                onChange={e => setPin(e.target.value)}
                style={styles.input}
                disabled={isLoggingIn}
                onKeyPress={e => e.key === 'Enter' && handleLoginPin(e)}
              />
              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: isLoggingIn ? 0.6 : 1,
                }}
                disabled={isLoggingIn || !pin}
              >
                {isLoggingIn ? '⏳ Entrando...' : '✓ Entrar'}
              </button>
            </form>
          </>
        )}

        <button
          style={{...styles.buttonSecondary, marginTop: 12}}
          onClick={onClose}
        >
          ✕ Cancelar
        </button>
      </div>
    </div>
  )
}
