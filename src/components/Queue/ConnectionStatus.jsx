import React from 'react'
import { motion } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Activity, 
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const ConnectionStatus = ({ 
  isConnected, 
  connectionType, 
  lastUpdate, 
  onForceRefresh, 
  connectionQuality = 'good',
  isRefreshing = false 
}) => {
  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500 bg-red-50 border-red-200'
    
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500 bg-green-50 border-green-200'
      case 'good': return 'text-blue-500 bg-blue-50 border-blue-200'
      case 'poor': return 'text-orange-500 bg-orange-50 border-orange-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }
    
    if (!isConnected) {
      return <WifiOff className="h-4 w-4" />
    }
    
    switch (connectionQuality) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />
      case 'good': return <Wifi className="h-4 w-4" />
      case 'poor': return <AlertCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    if (isRefreshing) return 'Actualisation...'
    if (!isConnected) return 'Déconnecté'
    
    const typeLabels = {
      websocket: 'WebSocket',
      sse: 'Server-Sent Events', 
      polling: 'Polling'
    }
    
    return `Connecté (${typeLabels[connectionType] || connectionType})`
  }

  const getConnectionDescription = () => {
    if (!isConnected) {
      return 'La connexion temps réel n\'est pas disponible'
    }
    
    const descriptions = {
      websocket: 'Connexion temps réel optimale',
      sse: 'Connexion temps réel standard',
      polling: 'Actualisation périodique'
    }
    
    return descriptions[connectionType] || 'Connexion active'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}
    >
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span>{getStatusText()}</span>
        
        {lastUpdate && (
          <div className="flex items-center space-x-1 text-xs opacity-75">
            <Clock className="h-3 w-3" />
            <span>
              {format(lastUpdate, 'HH:mm:ss', { locale: fr })}
            </span>
          </div>
        )}
        
        <button
          onClick={onForceRefresh}
          disabled={isRefreshing}
          className="ml-2 p-1 rounded hover:bg-white hover:bg-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Actualiser manuellement"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Tooltip avec détails */}
      <div className="hidden group-hover:block absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-64">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Statut:</span>
            <span className="font-medium">{getStatusText()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium">{connectionType}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Qualité:</span>
            <span className="font-medium">{connectionQuality}</span>
          </div>
          
          {lastUpdate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Dernière MAJ:</span>
              <span className="font-medium">
                {format(lastUpdate, 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
              </span>
            </div>
          )}
          
          <div className="pt-2 border-t border-gray-100">
            <p className="text-gray-600">{getConnectionDescription()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Composant de notification pour les changements de statut
export const ConnectionNotification = ({ 
  isVisible, 
  type, 
  message, 
  onDismiss 
}) => {
  if (!isVisible) return null

  const getNotificationStyle = () => {
    switch (type) {
      case 'connected':
        return 'bg-green-500 text-white'
      case 'disconnected':
        return 'bg-red-500 text-white'
      case 'reconnecting':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${getNotificationStyle()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-white hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default ConnectionStatus