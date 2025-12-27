import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  Phone, 
  Play, 
  SkipForward, 
  X,
  Clock,
  User,
  AlertTriangle
} from 'lucide-react'

import { useApp } from '@/store/AppContext'
import Button, { IconButton } from '@/components/UI/Button'
import { UrgenceBadge, StatutBadge } from '@/components/UI/Badge'
import { useTimeElapsed } from '@/hooks/useTimeElapsed'

const QueueItem = ({ item, index, onCall, onStart, onFinish, onSkip, onRemove }) => {
  const timeElapsed = useTimeElapsed(item.heure_arrivee)
  
  const getUrgenceIcon = (niveau) => {
    if (niveau === 'critique') return AlertTriangle
    return null
  }

  const UrgenceIcon = getUrgenceIcon(item.niveau_urgence)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="px-6 py-4 bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        
        {/* Position et info patient */}
        <div className="flex items-center space-x-4">
          
          {/* Numéro de position */}
          <motion.div
            className="flex-shrink-0 w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <span className="text-lg font-bold text-medical-600">
              {index + 1}
            </span>
          </motion.div>

          {/* Info patient */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium text-gray-900">
                {item.patient?.prenom} {item.patient?.nom}
              </h3>
              
              <div className="flex items-center space-x-2">
                <UrgenceBadge niveau={item.niveau_urgence} animate />
                <StatutBadge statut={item.statut} size="sm" />
                {UrgenceIcon && (
                  <UrgenceIcon className="w-4 h-4 text-red-500 animate-pulse" />
                )}
              </div>
            </div>
            
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{item.patient?.age} ans</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Arrivé il y a {timeElapsed}</span>
              </div>
              
              {item.motif && (
                <span className="text-gray-400">• {item.motif}</span>
              )}
              
              {item.statut === 'appele' && (
                <motion.span
                  className="flex items-center space-x-1 text-blue-600 font-medium"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Phone className="w-4 h-4" />
                  <span>Appelé</span>
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {item.statut === 'attente' && (
            <Button
              onClick={() => onCall(item.id)}
              variant="primary"
              size="sm"
              icon={Phone}
            >
              Appeler
            </Button>
          )}
          
          {item.statut === 'appele' && (
            <Button
              onClick={() => onStart(item.id)}
              variant="success"
              size="sm"
              icon={Play}
            >
              Démarrer
            </Button>
          )}
          
          {item.statut === 'en_consultation' && (
            <Button
              onClick={() => onFinish && onFinish(item.id)}
              variant="success"
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Terminer
            </Button>
          )}
          
          <IconButton
            onClick={() => onSkip(item.id)}
            variant="secondary"
            size="sm"
            icon={SkipForward}
            title="Passer ce patient"
          />
          
          <IconButton
            onClick={() => onRemove(item.id)}
            variant="danger"
            size="sm"
            icon={X}
            title="Retirer de la file"
          />
        </div>
      </div>
    </motion.div>
  )
}

const QueueList = ({ 
  workflowActions = null // Actions du workflow optionnelles
}) => {
  const { 
    queue, 
    callPatient, 
    startConsultation,
    buildQueue,
    removeFromWaitingQueue 
  } = useApp()

  const handleCall = async (visitId) => {
    const visit = queue.find(item => item.id === visitId)
    if (workflowActions) {
      workflowActions.callPatient(visit)
    } else {
      await callPatient(visitId)
      buildQueue()
    }
  }

  const handleStart = async (visitId) => {
    const visit = queue.find(item => item.id === visitId)
    if (workflowActions) {
      workflowActions.startConsultation(visit)
    } else {
      await startConsultation(visitId)
      buildQueue()
    }
  }

  const handleSkip = async (visitId) => {
    const visit = queue.find(item => item.id === visitId)
    if (workflowActions) {
      workflowActions.skipPatient(visit)
    } else {
      // Logique par défaut
      console.log('Skip patient:', visitId)
    }
  }

  const handleFinish = async (visitId) => {
    const visit = queue.find(item => item.id === visitId)
    const patient = visit?.patient
    if (workflowActions && visit && patient) {
      workflowActions.openFinishWizard(visit, patient)
    } else {
      console.log('Finish consultation:', visitId)
    }
  }

  const handleRemove = async (visitId) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce patient de la file d\'attente ?')) return
    
    const visit = queue.find(item => item.id === visitId)
    if (workflowActions) {
      workflowActions.removeFromQueue(visit)
    } else {
      // Call API to remove from waiting queue
      await removeFromWaitingQueue(visitId)
    }
  }

  if (queue.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            File d'attente
          </h2>
        </div>
        
        <div className="p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Clock className="mx-auto h-16 w-16 text-gray-300" />
          </motion.div>
          
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aucun patient en attente
          </h3>
          <p className="mt-2 text-gray-500">
            La file d'attente est vide. Les patients ajoutés apparaîtront ici.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            File d'attente ({queue.length})
          </h2>
          
          <div className="text-sm text-gray-500">
            Triée par priorité et heure d'arrivée
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {queue.map((item, index) => (
            <QueueItem
              key={item.id}
              item={item}
              index={index}
              onCall={handleCall}
              onStart={handleStart}
              onFinish={handleFinish}
              onSkip={handleSkip}
              onRemove={handleRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default QueueList