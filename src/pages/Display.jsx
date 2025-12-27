import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  Heart,
  Clock,
  Users,
  Activity,
  Phone,
  AlertTriangle
} from 'lucide-react'

import { useApp } from '@/store/AppContext'
import { useTimeElapsed } from '@/hooks/useTimeElapsed'

// Composant pour l'horloge
const LiveClock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-right">
      <div className="text-4xl font-bold text-white">
        {format(time, 'HH:mm:ss')}
      </div>
      <div className="text-lg text-cyan-200">
        {format(time, 'EEEE dd MMMM yyyy', { locale: fr })}
      </div>
    </div>
  )
}

// Composant pour le patient en cours
const CurrentPatient = ({ currentVisit, patient }) => {
  const consultationTime = useTimeElapsed(currentVisit?.heure_debut_consult)

  if (!currentVisit || !patient) {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-600 bg-opacity-30 rounded-full flex items-center justify-center">
          <Users className="text-6xl text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-300">
          Aucune consultation en cours
        </h3>
        <p className="text-gray-400 mt-2">
          Le médecin n'est pas en consultation
        </p>
      </div>
    )
  }

  const initials = `${patient.prenom?.charAt(0) || ''}${patient.nom?.charAt(0) || ''}`

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.div
        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center"
        animate={{ 
          boxShadow: [
            '0 0 20px rgba(16, 185, 129, 0.5)',
            '0 0 40px rgba(16, 185, 129, 0.8)',
            '0 0 20px rgba(16, 185, 129, 0.5)'
          ]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <span className="text-3xl font-bold text-white">
          {initials}
        </span>
      </motion.div>
      
      <h3 className="text-4xl font-bold text-white mb-2">
        {patient.prenom} {patient.nom}
      </h3>
      
      <p className="text-xl text-cyan-100 mb-4">En consultation</p>
      
      <div className="flex justify-center items-center space-x-6 text-lg text-cyan-200">
        <div className="flex items-center">
          <Clock className="mr-2" />
          <span>Depuis {consultationTime}</span>
        </div>
      </div>
    </motion.div>
  )
}

// Composant pour un patient suivant
const NextPatientCard = ({ visit, patient, index, isNext = false }) => {
  const waitTime = useTimeElapsed(visit.heure_arrivee)
  
  const urgenceColor = {
    'critique': 'text-red-300',
    'prioritaire': 'text-orange-300',
    'standard': 'text-gray-300'
  }

  const urgenceIcon = {
    'critique': AlertTriangle,
    'prioritaire': AlertTriangle,
    'standard': null
  }

  const UrgenceIcon = urgenceIcon[visit.niveau_urgence]
  const initials = `${patient?.prenom?.charAt(0) || '?'}${patient?.nom?.charAt(0) || '?'}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`glass-effect rounded-xl p-6 text-center ${
        isNext ? 'ring-2 ring-cyan-300 animate-pulse-glow' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-2xl font-bold text-white">
          {index + 1}
        </span>
        <div className="flex items-center space-x-2">
          {UrgenceIcon && (
            <UrgenceIcon className={`w-4 h-4 ${urgenceColor[visit.niveau_urgence]}`} />
          )}
          {visit.statut === 'appele' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Phone className="w-4 h-4 text-blue-300" />
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
        <span className="text-xl font-bold text-white">
          {initials}
        </span>
      </div>
      
      <h4 className="text-xl font-semibold text-white mb-2">
        {patient ? `${patient.prenom} ${patient.nom}` : 'Patient'}
      </h4>
      
      <div className="text-sm text-cyan-200 space-y-1">
        <div className="flex items-center justify-center">
          <Clock className="mr-2 w-4 h-4" />
          <span>Attente: {waitTime}</span>
        </div>
        
        {visit.statut === 'appele' && (
          <div className="flex items-center justify-center text-blue-300">
            <Phone className="mr-2 w-4 h-4" />
            <span>Appelé</span>
          </div>
        )}
        
        {isNext && (
          <div className="mt-3 px-3 py-1 bg-cyan-500 bg-opacity-30 rounded-full">
            <span className="text-cyan-100 font-medium">Suivant</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const Display = () => {
  const { visits, patients, queue, kpis, loadInitialData } = useApp()
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Actualisation automatique toutes les 15 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadInitialData()
      setLastUpdate(new Date())
    }, 15000)

    return () => clearInterval(interval)
  }, [loadInitialData])

  // Patient en consultation
  const currentVisit = visits.find(visit => visit.statut === 'en_consultation')
  const currentPatient = currentVisit 
    ? patients.find(p => p.id === currentVisit.patient_id)
    : null

  // Prochains patients (max 6)
  const nextPatients = queue.slice(0, 6)

  // Gestion du mode plein écran
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F11') {
        e.preventDefault()
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen text-white overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 animate-gradient-shift">
      
      {/* Header */}
      <motion.header
        className="bg-black bg-opacity-30 backdrop-blur-sm p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <Heart className="text-4xl text-cyan-300" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-white">Cabinet Médical</h1>
              <p className="text-cyan-200 text-lg">File d'attente en temps réel</p>
            </div>
          </div>
          
          <LiveClock />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        
        {/* Patient en cours */}
        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-cyan-100 mb-6 text-center">
            <Activity className="inline mr-3" />
            En consultation
          </h2>
          
          <div className="glass-effect rounded-2xl p-8 text-center animate-pulse-glow">
            <CurrentPatient 
              currentVisit={currentVisit} 
              patient={currentPatient} 
            />
          </div>
        </motion.section>

        {/* Prochains patients */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-cyan-100 mb-6 text-center">
            <Clock className="inline mr-3" />
            Prochains patients
          </h2>
          
          {nextPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-2xl text-gray-300">Aucun patient en attente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nextPatients.map((item, index) => (
                <NextPatientCard
                  key={item.id}
                  visit={item}
                  patient={item.patient}
                  index={index}
                  isNext={index === 0}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* Message d'information */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="glass-effect rounded-xl p-6 inline-block">
            <p className="text-cyan-200 text-lg">
              <Activity className="inline mr-2" />
              Merci de patienter, vous serez appelé(e) par votre nom
            </p>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.section
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-effect rounded-xl p-6 text-center">
              <Users className="text-2xl text-cyan-300 mb-2 mx-auto" />
              <div className="text-3xl font-bold text-white">
                {queue.length}
              </div>
              <div className="text-cyan-200">En attente</div>
            </div>
            
            <div className="glass-effect rounded-xl p-6 text-center">
              <Clock className="text-2xl text-yellow-300 mb-2 mx-auto" />
              <div className="text-3xl font-bold text-white">
                {kpis.avgWaitTime}
              </div>
              <div className="text-cyan-200">Temps d'attente moyen</div>
            </div>
            
            <div className="glass-effect rounded-xl p-6 text-center">
              <Activity className="text-2xl text-green-300 mb-2 mx-auto" />
              <div className="text-3xl font-bold text-white">
                {kpis.patientsToday}
              </div>
              <div className="text-cyan-200">Patients aujourd'hui</div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        className="fixed bottom-0 left-0 right-0 glass-effect p-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-cyan-200 text-sm">
            Dernière mise à jour : {format(lastUpdate, 'HH:mm:ss')}
            <span className="ml-4">• Appuyez sur F11 pour le mode plein écran</span>
          </p>
        </div>
      </motion.footer>
    </div>
  )
}

export default Display