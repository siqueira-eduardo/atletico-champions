import React from 'react'
import { useAuth } from '../auth/authContext'
import { hasPermission, hasAnyPermission } from '../auth/roleManager'

/**
 * RoleGuard - Componente para controlar acesso baseado em role
 * 
 * Uso:
 * <RoleGuard permission="editarResultados">
 *   <button>Editar Resultado</button>
 * </RoleGuard>
 */
export const RoleGuard = ({
  children,
  permission,
  permissions = [],
  fallback = null,
  requireAll = false,
}) => {
  const { userRole } = useAuth()

  // Se passou uma permissão única
  if (permission) {
    const hasAccess = hasPermission(userRole, permission)
    return hasAccess ? children : fallback
  }

  // Se passou múltiplas permissões
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every(p => hasPermission(userRole, p))
      : hasAnyPermission(userRole, permissions)
    return hasAccess ? children : fallback
  }

  // Se passou roles específicas
  return children
}

/**
 * Wrapper para ocultar elementos sem permissão
 */
export const HideIfForbidden = ({ children, permission, permissions = [] }) => {
  const { userRole } = useAuth()

  if (permission) {
    return hasPermission(userRole, permission) ? children : null
  }

  if (permissions.length > 0) {
    return hasAnyPermission(userRole, permissions) ? children : null
  }

  return children
}

/**
 * Wrapper que mostra mensagem de acesso negado
 */
export const ProtectedSection = ({
  children,
  permission,
  permissions = [],
  title = 'Seção Protegida',
  message = 'Você não tem permissão para acessar esta seção',
}) => {
  const { userRole } = useAuth()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(userRole, permission)
  } else if (permissions.length > 0) {
    hasAccess = hasAnyPermission(userRole, permissions)
  }

  if (!hasAccess) {
    return (
      <div style={{
        background: '#f4433611',
        border: '1px solid #f4433633',
        borderRadius: 10,
        padding: 20,
        textAlign: 'center',
        color: '#f44336',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: '#f4433699' }}>
          {message}
        </div>
      </div>
    )
  }

  return children
}

/**
 * Hook para verificar permissão em lógica
 */
export const useHasPermission = (permission) => {
  const { userRole } = useAuth()
  return hasPermission(userRole, permission)
}

/**
 * Hook para verificar múltiplas permissões
 */
export const useHasAnyPermission = (permissions = []) => {
  const { userRole } = useAuth()
  return hasAnyPermission(userRole, permissions)
}

/**
 * Componente que mostra botão desativado com tooltip
 */
export const PermissionButton = ({
  children,
  permission,
  permissions = [],
  disabled = false,
  tooltipText = 'Você não tem permissão para realizar esta ação',
  ...props
}) => {
  const { userRole } = useAuth()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(userRole, permission)
  } else if (permissions.length > 0) {
    hasAccess = hasAnyPermission(userRole, permissions)
  } else {
    hasAccess = true
  }

  const isDisabled = disabled || !hasAccess

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        {...props}
        disabled={isDisabled}
        style={{
          ...props.style,
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {children}
      </button>
      {isDisabled && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#333',
          color: '#fff',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: 12,
          whiteSpace: 'nowrap',
          marginBottom: 8,
          zIndex: 1000,
          pointerEvents: 'none',
          opacity: 0.9,
        }}>
          {tooltipText}
        </div>
      )}
    </div>
  )
}
