import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, User, Activity } from 'lucide-react'
import io from 'socket.io-client'
import { baseURL } from '../config'

const PublicWaitingLine = () => {
  const [currentPatient, setCurrentPatient] = useState(null)
  const [waitingPatients, setWaitingPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Get WebSocket URL from baseURL (replace http with ws)
  const getSocketURL = () => {
    if (!baseURL) return 'ws://localhost:3000'
    return baseURL.replace(/^http/, 'ws')
  }

  // Fetch initial data
  const fetchWaitingLine = async () => {
    try {
      const response = await fetch(`${baseURL}/public/waiting-line`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentPatient(data.current || null)
        setWaitingPatients(data.waiting || [])
      }
    } catch (error) {
      console.error('Error fetching waiting line:', error)
    } finally {
      setLoading(false)
    }
  }

  // Setup WebSocket connection
  useEffect(() => {
    fetchWaitingLine()

    // Connect to WebSocket
    const socket = io(getSocketURL(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })

    socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    // Listen for waiting line updates
    socket.on('waiting-line-update', (data) => {
      console.log('Waiting line updated:', data)
      setCurrentPatient(data.current || null)
      setWaitingPatients(data.waiting || [])
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mx-auto mb-6"></div>
          <p className="text-white text-2xl font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-8">
      {/* Header with clock */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center">
          <Activity className="h-12 w-12 mr-4" />
          File d'Attente
        </h1>
        <div className="text-white text-xl">
          <p className="text-3xl font-mono font-bold mb-2">{formatTime(currentTime)}</p>
          <p className="text-lg opacity-90">{formatDate(currentTime)}</p>
        </div>
      </motion.div>

      {/* Current Patient - Large Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-12 border-8 border-green-400">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block px-8 py-3 bg-green-500 text-white text-xl font-bold rounded-full">
                EN CONSULTATION
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              {currentPatient ? (
                <motion.div
                  key={currentPatient.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center mb-8">
                    <div className="h-40 w-40 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                      <User className="h-24 w-24 text-white" />
                    </div>
                  </div>
                  <h2 className="text-7xl font-bold text-gray-900 mb-6">
                    {currentPatient.name || currentPatient.fullName || 'Patient'}
                  </h2>
                  {currentPatient.appointmentTime && (
                    <div className="flex items-center justify-center text-2xl text-gray-600">
                      <Clock className="h-8 w-8 mr-3" />
                      <span>
                        {new Date(currentPatient.appointmentTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="no-patient"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12"
                >
                  <Users className="h-32 w-32 text-gray-300 mx-auto mb-6" />
                  <p className="text-5xl text-gray-400 font-medium">
                    Aucune consultation en cours
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Waiting Patients */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-4xl font-bold text-white mb-8 flex items-center justify-center">
            <Users className="h-10 w-10 mr-3" />
            Patients en Attente
            <span className="ml-4 px-4 py-2 bg-white text-blue-900 rounded-full text-3xl">
              {waitingPatients.length}
            </span>
          </h3>

          {waitingPatients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center"
            >
              <Users className="h-20 w-20 text-white/50 mx-auto mb-4" />
              <p className="text-3xl text-white/80">Aucun patient en attente</p>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {waitingPatients.slice(0, 3).map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-xl p-8 flex items-center justify-between hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        <div className={`h-20 w-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-orange-500' : 
                          'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-10 w-10 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-3xl font-bold text-gray-900">
                            {patient.name || patient.fullName || 'Patient'}
                          </h4>
                          {patient.appointmentTime && (
                            <div className="flex items-center text-xl text-gray-600 mt-2">
                              <Clock className="h-5 w-5 mr-2" />
                              <span>
                                {new Date(patient.appointmentTime).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {index === 0 && (
                      <div className="flex items-center space-x-2 text-yellow-600">
                        <span className="text-2xl font-bold">Suivant</span>
                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          →
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12 text-white/70 text-lg"
      >
        <p>Mise à jour en temps réel</p>
      </motion.div>
    </div>
  )
}

export default PublicWaitingLine
