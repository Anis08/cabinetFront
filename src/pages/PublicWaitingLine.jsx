import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, User, Activity, Waves, Heart, ChevronRight, Sparkles } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-8"
          >
            <div className="w-full h-full rounded-full border-8 border-transparent border-t-cyan-400 border-r-purple-400"></div>
          </motion.div>
          <p className="text-white text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Chargement...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-6000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative z-10 p-8">
        {/* Header with modern clock */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Time display */}
          <div className="inline-block backdrop-blur-xl bg-white/10 rounded-3xl px-12 py-6 mb-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-8 w-8 text-cyan-400" />
              </motion.div>
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                File d'Attente
              </h1>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Sparkles className="h-8 w-8 text-pink-400" />
              </motion.div>
            </div>
            <motion.div 
              className="text-6xl font-bold text-white font-mono tracking-wider"
              key={currentTime.getSeconds()}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatTime(currentTime)}
            </motion.div>
            <p className="text-xl text-white/80 mt-2">{formatDate(currentTime)}</p>
          </div>
        </motion.div>

        {/* Current Patient - Ultra Modern Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto mb-12"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30"></div>
            
            {/* Main card */}
            <div className="relative backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"></div>
              
              <div className="relative p-12">
                {/* Badge */}
                <div className="flex justify-center mb-8">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(34, 211, 238, 0.5)",
                        "0 0 40px rgba(168, 85, 247, 0.5)",
                        "0 0 20px rgba(34, 211, 238, 0.5)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                  >
                    <Heart className="h-6 w-6 text-white animate-pulse" />
                    <span className="text-white text-2xl font-bold tracking-wide">EN CONSULTATION</span>
                    <Heart className="h-6 w-6 text-white animate-pulse" />
                  </motion.div>
                </div>
                
                <AnimatePresence mode="wait">
                  {currentPatient ? (
                    <motion.div
                      key={currentPatient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      {/* Avatar with animated ring */}
                      <div className="flex justify-center mb-8">
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-4"
                          >
                            <div className="w-full h-full rounded-full border-4 border-transparent border-t-cyan-400 border-r-purple-400 border-b-pink-400"></div>
                          </motion.div>
                          <div className="relative h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 p-1">
                            <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                              <User className="h-24 w-24 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Name with gradient */}
                      <motion.h2 
                        className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                        animate={{ 
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        style={{ backgroundSize: "200% 200%" }}
                      >
                        {currentPatient.name || currentPatient.fullName || 'Patient'}
                      </motion.h2>
                      
                      {currentPatient.appointmentTime && (
                        <div className="inline-flex items-center space-x-3 px-6 py-3 backdrop-blur-xl bg-white/10 rounded-full border border-white/20">
                          <Clock className="h-6 w-6 text-cyan-400" />
                          <span className="text-2xl text-white font-semibold">
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
                      className="py-12 text-center"
                    >
                      <Users className="h-40 w-40 text-white/20 mx-auto mb-6" />
                      <p className="text-5xl text-white/60 font-medium">
                        Aucune consultation en cours
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Waiting Patients - Modern Cards */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Section header */}
            <div className="flex items-center justify-center mb-8 space-x-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="flex items-center space-x-4 backdrop-blur-xl bg-white/10 rounded-full px-8 py-4 border border-white/20">
                <Users className="h-8 w-8 text-purple-400" />
                <h3 className="text-4xl font-bold text-white">
                  Patients en Attente
                </h3>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full text-2xl font-bold"
                >
                  {waitingPatients.length}
                </motion.span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            </div>

            {waitingPatients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="backdrop-blur-2xl bg-white/5 rounded-3xl p-16 text-center border border-white/10"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Users className="h-32 w-32 text-white/20 mx-auto mb-6" />
                </motion.div>
                <p className="text-4xl text-white/60 font-medium">Aucun patient en attente</p>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                <AnimatePresence>
                  {waitingPatients.slice(0, 3).map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, x: -50, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 50, scale: 0.9 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ scale: 1.02 }}
                      className="group relative"
                    >
                      {/* Glow on hover */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity"></div>
                      
                      {/* Card */}
                      <div className="relative backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 p-8 flex items-center justify-between overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5"></div>
                        
                        <div className="relative flex items-center space-x-6 flex-1">
                          {/* Position badge */}
                          <motion.div
                            animate={{ 
                              boxShadow: [
                                `0 0 20px ${index === 0 ? 'rgba(251, 191, 36, 0.5)' : index === 1 ? 'rgba(251, 146, 60, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
                                `0 0 40px ${index === 0 ? 'rgba(251, 191, 36, 0.7)' : index === 1 ? 'rgba(251, 146, 60, 0.7)' : 'rgba(59, 130, 246, 0.7)'}`,
                                `0 0 20px ${index === 0 ? 'rgba(251, 191, 36, 0.5)' : index === 1 ? 'rgba(251, 146, 60, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`h-24 w-24 rounded-2xl flex items-center justify-center text-white text-4xl font-bold ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
                              index === 1 ? 'bg-gradient-to-br from-orange-400 to-red-500' : 
                              'bg-gradient-to-br from-blue-400 to-purple-500'
                            }`}
                          >
                            {index + 1}
                          </motion.div>
                          
                          {/* Patient info */}
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Avatar */}
                            <div className="relative">
                              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 p-0.5">
                                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                                  <User className="h-10 w-10 text-white" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Name and time */}
                            <div>
                              <h4 className="text-4xl font-bold text-white mb-1">
                                {patient.name || patient.fullName || 'Patient'}
                              </h4>
                              {patient.appointmentTime && (
                                <div className="flex items-center space-x-2 text-white/70">
                                  <Clock className="h-5 w-5" />
                                  <span className="text-xl">
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
                        
                        {/* Next indicator */}
                        {index === 0 && (
                          <motion.div
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="flex items-center space-x-3"
                          >
                            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                              Suivant
                            </span>
                            <ChevronRight className="h-8 w-8 text-yellow-400" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer with wave animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-3 backdrop-blur-xl bg-white/5 rounded-full px-8 py-4 border border-white/10">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Waves className="h-6 w-6 text-cyan-400" />
            </motion.div>
            <span className="text-xl text-white/60">Mise à jour en temps réel</span>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-3 w-3 rounded-full bg-green-400"
            ></motion.div>
          </div>
        </motion.div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  )
}

export default PublicWaitingLine
