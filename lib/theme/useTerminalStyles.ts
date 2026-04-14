'use client'

import { useTheme } from './useTheme'

type TerminalStatus = 'idle' | 'running' | 'completed' | 'failed'

interface TerminalStylesConfig {
  status?: TerminalStatus
}

/**
 * Hook centralizado para obtener estilos del terminal
 * Utiliza CSS variables definidas en globals.css para temas dinámicos
 */
export function useTerminalStyles(config?: TerminalStylesConfig) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const status = config?.status || 'idle'

  /**
   * Obtiene el color del estado basado en CSS variables
   */
  const getStatusColor = (): string => {
    switch (status) {
      case 'running':
        return 'var(--terminal-status-running)'
      case 'completed':
        return 'var(--terminal-status-completed)'
      case 'failed':
        return 'var(--terminal-status-failed)'
      default:
        return 'var(--terminal-text-secondary)'
    }
  }

  /**
   * Obtiene la clase de animación basada en el estado
   */
  const getStatusAnimation = (): string => {
    return status === 'running' ? 'terminal-pulse' : ''
  }

  /**
   * Obtiene el texto del estado en español
   */
  const getStatusText = (): string => {
    switch (status) {
      case 'running':
        return 'EJECUTÁNDOSE'
      case 'completed':
        return 'COMPLETADO'
      case 'failed':
        return 'FALLIDO'
      default:
        return 'SISTEMA_LISTO'
    }
  }

  /**
   * Estilos base para componentes (usando CSS variables)
   */
  const baseStyles = {
    backgroundColor: 'var(--terminal-bg-primary)',
    borderColor: 'var(--terminal-border)',
  }

  const secondaryStyles = {
    backgroundColor: 'var(--terminal-bg-secondary)',
    borderColor: 'var(--terminal-border)',
  }

  const textPrimary = {
    color: 'var(--terminal-text-primary)',
  }

  const textSecondary = {
    color: 'var(--terminal-text-secondary)',
  }

  return {
    isDark,
    status,
    getStatusColor,
    getStatusAnimation,
    getStatusText,
    baseStyles,
    secondaryStyles,
    textPrimary,
    textSecondary,
  }
}

/**
 * Hook para estilos específicos de botones del terminal
 */
export function useTerminalButtonStyles() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const runButtonStyles = {
    default: {
      backgroundColor: 'var(--terminal-status-running)',
      color: '#ffffff',
      border: 'none',
    },
    hover: {
      backgroundColor: isDark ? 'var(--terminal-status-running)' : '#0a5db5',
    },
    disabled: {
      backgroundColor: 'var(--terminal-bg-secondary)',
      color: 'var(--terminal-text-secondary)',
      cursor: 'not-allowed' as const,
      opacity: 0.6,
    },
  }

  const clearButtonStyles = {
    default: {
      backgroundColor: 'var(--terminal-bg-primary)',
      color: 'var(--terminal-text-primary)',
      borderColor: 'var(--terminal-border)',
      borderWidth: '1px',
    },
    hover: {
      backgroundColor: 'var(--terminal-bg-secondary)',
    },
    disabled: {
      backgroundColor: 'var(--terminal-bg-secondary)',
      color: 'var(--terminal-text-secondary)',
      cursor: 'not-allowed' as const,
      opacity: 0.6,
      borderColor: 'var(--terminal-border)',
    },
  }

  return {
    runButtonStyles,
    clearButtonStyles,
  }
}
