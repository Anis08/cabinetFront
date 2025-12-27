import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, User, Activity, Heart, Sparkles } from 'lucide-react'
import io from 'socket.io-client'
import { baseURL } from '../config'

const PublicWaitingLine = () => {
  const [currentPatient, setCurrentPatient] = useState(null)
  const [waitingPatients, setWaitingPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Ads state
  const [topAds, setTopAds] = useState([])
  const [bottomAds, setBottomAds] = useState([])
  const [currentTopAdIndex, setCurrentTopAdIndex] = useState(0)
  const [currentBottomAdIndex, setCurrentBottomAdIndex] = useState(0)

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

  // Fetch active ads
  const fetchActiveAds = async () => {
    try {
      const response = await fetch(`${baseURL}/public/ads/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const ads = data.ads || []
        
        // Filter by date range
        const now = new Date()
        const activeAds = ads.filter(ad => {
          const from = new Date(ad.dateFrom)
          const to = new Date(ad.dateTo)
          return ad.active && now >= from && now <= to
        })
        
        // Separate by position
        setTopAds(activeAds.filter(ad => ad.position === 'top'))
        setBottomAds(activeAds.filter(ad => ad.position === 'bottom'))
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    }
  }

  // Setup WebSocket connection
  useEffect(() => {
    fetchWaitingLine()
    fetchActiveAds()

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

    // Listen for ads updates
    socket.on('ads-update', () => {
      console.log('Ads updated, reloading...')
      fetchActiveAds()
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

  // Rotate top ads
  useEffect(() => {
    // Disabled: always show the first ad only
  }, [topAds])

  // Rotate bottom ads
  useEffect(() => {
    // Disabled: always show the first ad only
  }, [bottomAds])

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
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Ad display component
  const AdDisplay = ({ ads, position }) => {
    if (ads.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-16 w-16 text-white/30 mx-auto mb-3" />
            <p className="text-2xl font-semibold text-white/50">Espace Publicitaire</p>
            <p className="text-sm text-white/30 mt-2">{position === 'top' ? 'Haut' : 'Bas'}</p>
          </div>
        </div>
      )
    }

    // Always show the first ad only (make it permanent)
    const currentAd = ads[0];
    const url = `http://localhost:4000/medecin/ads/image/${currentAd.fileUrl}`;

    return (
      <div className="h-full w-full">
        {currentAd.type === 'image' ? (
          <img
            src={url}
            alt={currentAd.title}
            className="w-full h-full object-cover rounded-2xl"
            draggable={false}
          />
        ) : (
          <video
            src={currentAd.fileUrl}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover rounded-2xl"
          />
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-8"
          >
            <div className="w-full h-full rounded-full border-8 border-transparent border-t-cyan-400 border-r-purple-400"></div>
          </motion.div>
          <p className="text-white text-3xl font-semibold">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main container - Split layout */}
      <div className="relative z-10 h-full flex gap-4 p-6">
        {/* LEFT SIDE - Time + Current Patient + Queue */}
        <div className="w-2/5 h-full flex flex-col gap-4">
          {/* Header with time */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-white font-mono">{formatTime(currentTime)}</div>
                <div className="text-sm text-white/70">{formatDate(currentTime)}</div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="h-10 w-10 text-cyan-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* CURRENT PATIENT - Between time and queue */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30"></div>
              
              {/* Main card */}
              <div className="relative backdrop-blur-2xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
                {/* Badge */}
                <div className="p-4 pb-3">
                  <div className="flex justify-center">
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          "0 0 15px rgba(34, 211, 238, 0.5)",
                          "0 0 30px rgba(168, 85, 247, 0.5)",
                          "0 0 15px rgba(34, 211, 238, 0.5)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="inline-flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    >
                      <Heart className="h-4 w-4 text-white animate-pulse" />
                      <span className="text-white text-lg font-bold tracking-wide">EN CONSULTATION</span>
                      <Heart className="h-4 w-4 text-white animate-pulse" />
                    </motion.div>
                  </div>
                </div>
                
                {/* Patient content */}
                <div className="p-4 pt-2">
                  <AnimatePresence mode="wait">
                    {currentPatient ? (
                      <motion.div
                        key={currentPatient.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="text-center"
                      >
                        {/* Avatar with animated ring */}
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              className="absolute -inset-2"
                            >
                              <div className="w-full h-full rounded-full border-3 border-transparent border-t-cyan-400 border-r-purple-400 border-b-pink-400"></div>
                            </motion.div>
                            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 p-1">
                              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                                <User className="h-12 w-12 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Name */}
                        <motion.h2 
                          className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                        >
                          {currentPatient.name || currentPatient.fullName || 'Patient'}
                        </motion.h2>
                        
                        {/* Time */}
                        {currentPatient.appointmentTime && (
                          <div className="inline-flex items-center space-x-2 px-4 py-2 backdrop-blur-xl bg-white/10 rounded-full border border-white/20">
                            <Clock className="h-4 w-4 text-cyan-400" />
                            <span className="text-lg text-white font-semibold">
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
                        className="text-center py-6"
                      >
                        <Users className="h-20 w-20 text-white/20 mx-auto mb-3" />
                        <p className="text-2xl text-white/60 font-medium">
                          Aucune consultation
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Waiting list header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-4 border border-white/20 flex-shrink-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-7 w-7 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">File d'Attente</h2>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              >
                <span className="text-2xl font-bold text-white">{waitingPatients.length}</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Waiting patients list - Scrollable area */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <AnimatePresence>
              {waitingPatients.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 text-center border border-white/10 h-full flex flex-col items-center justify-center"
                >
                  <Users className="h-20 w-20 text-white/20 mb-4" />
                  <p className="text-xl text-white/60">Aucun patient en attente</p>
                </motion.div>
              ) : (
                waitingPatients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
                    
                    {/* Card */}
                    <div className="relative backdrop-blur-xl bg-white/10 rounded-xl p-3 border border-white/20 flex items-center space-x-3">
                      {/* Position badge */}
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            `0 0 15px ${index === 0 ? 'rgba(251, 191, 36, 0.5)' : index === 1 ? 'rgba(251, 146, 60, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`,
                            `0 0 30px ${index === 0 ? 'rgba(251, 191, 36, 0.7)' : index === 1 ? 'rgba(251, 146, 60, 0.7)' : 'rgba(59, 130, 246, 0.7)'}`,
                            `0 0 15px ${index === 0 ? 'rgba(251, 191, 36, 0.5)' : index === 1 ? 'rgba(251, 146, 60, 0.5)' : 'rgba(59, 130, 246, 0.5)'}`
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`h-14 w-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
                          index === 1 ? 'bg-gradient-to-br from-orange-400 to-red-500' : 
                          'bg-gradient-to-br from-blue-400 to-purple-500'
                        }`}
                      >
                        {index + 1}
                      </motion.div>

                      {/* Patient info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white truncate">
                          {patient.name || patient.fullName || 'Patient'}
                        </h3>
                        {patient.appointmentTime && (
                          <div className="flex items-center space-x-2 text-white/70 mt-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">
                              {new Date(patient.appointmentTime).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Next indicator */}
                      {index === 0 && (
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-yellow-400 text-xs font-bold"
                        >
                          SUIVANT →
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT SIDE - Full Height Ad Spaces */}
        <div className="w-3/5 h-full flex flex-col gap-4">
          {/* TOP BANNER AD SPACE - 50% height */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 backdrop-blur-xl bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-2xl border border-white/20 overflow-hidden"
          >
            <AdDisplay ads={topAds} position="top" />
          </motion.div>

        </div>
      </div>

      {/* Custom animations and scrollbar styles */}
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
        
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  )
}

export default PublicWaitingLine
