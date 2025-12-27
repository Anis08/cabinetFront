import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History,
  Search,
  Calendar,
  Filter,
  Clock,
  User,
  FileText,
  Heart,
  Activity,
  Droplet,
  Download,
  X,
  ChevronDown,
  TrendingUp,
  Video,
  Stethoscope,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { baseURL } from "../config"
import { useAuth } from '../store/AuthProvider'
import { useNavigate } from 'react-router-dom'

const HistorySimple = () => {
  const { logout, refresh } = useAuth()
  const navigate = useNavigate()
  
  // State management
  const [allAppointments, setAllAppointments] = useState([])
  const [displayedAppointments, setDisplayedAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const observer = useRef()
  const ITEMS_PER_PAGE = 10

  // Transform backend data
  const transformBackendData = (appointment) => {
    const vitalSigns = {}
    if (appointment.paSystolique) vitalSigns.bloodPressureSystolic = appointment.paSystolique
    if (appointment.paDiastolique) vitalSigns.bloodPressureDiastolic = appointment.paDiastolique
    if (appointment.pulse) vitalSigns.heartRate = appointment.pulse
    if (appointment.poids) vitalSigns.weight = appointment.poids
    if (appointment.imc) vitalSigns.bmi = appointment.imc
    if (appointment.pcm) vitalSigns.pcm = appointment.pcm

    return {
      id: appointment.id,
      date: appointment.date,
      startTime: appointment.startTime || appointment.date,
      endTime: appointment.endTime || appointment.date,
      patient: appointment.patient || {
        id: appointment.patientId,
        fullName: 'Patient inconnu',
        maladieChronique: null
      },
      motif: 'Consultation',
      type: appointment.teleconsultation ? 'Teleconsultation' : 'Consultation',
      statut: appointment.state === 'Completed' ? 'termine' : 
              appointment.state === 'Cancelled' ? 'annule' : 'en cours',
      clinicalSummary: appointment.note || null,
      vitalSigns: Object.keys(vitalSigns).length > 0 ? vitalSigns : null,
      biologicalTests: appointment.biologicalTests || [],
      documents: appointment.documents || []
    }
  }

  // Load data from API
  useEffect(() => {
    loadHistoryData()
  }, [])

  const loadHistoryData = async () => {
    setLoading(true)
    try {
      let response = await fetch(`${baseURL}/medecin/history`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 403) {
          logout()
          return
        }
        if (response.status === 401) {
          const refreshResponse = await refresh()
          if (!refreshResponse) {
            logout()
            return
          }
          response = await fetch(`${baseURL}/medecin/history`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          })
        }

        if (!response.ok) {
          console.log('API error, using fallback')
          setAllAppointments([])
          setLoading(false)
          return
        }
      }

      const data = await response.json()
      
      let transformedData = []
      if (data.appointments && Array.isArray(data.appointments)) {
        transformedData = data.appointments.map(apt => transformBackendData(apt))
      } else if (data.completedApointments && Array.isArray(data.completedApointments)) {
        transformedData = data.completedApointments.map(apt => transformBackendData(apt))
      }
      
      // Sort by date descending (newest first)
      transformedData.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      setAllAppointments(transformedData)
      loadMoreAppointments(transformedData, 0)
    } catch (error) {
      console.error('Error loading history:', error)
      setAllAppointments([])
    } finally {
      setLoading(false)
    }
  }

  // Filter appointments based on search and date filters
  const getFilteredAppointments = useCallback(() => {
    let filtered = [...allAppointments]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt => 
        apt.patient.fullName.toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(apt => new Date(apt.date) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(apt => new Date(apt.date) <= toDate)
    }

    return filtered
  }, [allAppointments, searchQuery, dateFrom, dateTo])

  // Load more appointments for infinite scroll
  const loadMoreAppointments = (appointments, currentPage) => {
    const filtered = appointments || getFilteredAppointments()
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const newItems = filtered.slice(startIndex, endIndex)

    if (currentPage === 0) {
      setDisplayedAppointments(newItems)
    } else {
      setDisplayedAppointments(prev => [...prev, ...newItems])
    }

    setHasMore(endIndex < filtered.length)
    setLoadingMore(false)
  }

  // Apply filters
  useEffect(() => {
    setPage(0)
    loadMoreAppointments(null, 0)
  }, [searchQuery, dateFrom, dateTo, getFilteredAppointments])

  // Infinite scroll observer
  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true)
        setPage(prevPage => {
          const nextPage = prevPage + 1
          loadMoreAppointments(null, nextPage)
          return nextPage
        })
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, hasMore])

  // Group appointments by date
  const groupAppointmentsByDate = () => {
    const grouped = {}
    
    displayedAppointments.forEach(apt => {
      const dateStr = typeof apt.date === 'string' 
        ? apt.date.split('T')[0] 
        : new Date(apt.date).toISOString().split('T')[0]
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(apt)
    })

    return Object.entries(grouped)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([date, consultations]) => ({
        date,
        consultations: consultations.sort((a, b) => 
          new Date(b.startTime) - new Date(a.startTime)
        )
      }))
  }

  const groupedAppointments = groupAppointmentsByDate()

  // Calculate insights
  const calculateInsights = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const thisWeek = allAppointments.filter(apt => 
      new Date(apt.date) >= weekAgo
    )

    const totalDuration = thisWeek.reduce((sum, apt) => {
      return sum + Math.floor(
        (new Date(apt.endTime) - new Date(apt.startTime)) / 60000
      )
    }, 0)

    const avgDuration = thisWeek.length > 0 
      ? Math.round(totalDuration / thisWeek.length) 
      : 0

    const labRequests = thisWeek.reduce((sum, apt) => 
      sum + (Array.isArray(apt.biologicalTests) ? apt.biologicalTests.length : 0), 0
    )

    return {
      totalConsultations: thisWeek.length,
      avgDuration,
      labRequests,
      totalAllTime: allAppointments.length
    }
  }

  const insights = calculateInsights()

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    today.setHours(0, 0, 0, 0)
    yesterday.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      return "Aujourd'hui"
    } else if (date.getTime() === yesterday.getTime()) {
      return "Hier"
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = searchQuery || dateFrom || dateTo

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <History className="h-6 w-6 mr-2 text-blue-600" />
              Historique Complet
            </h1>
            <p className="text-gray-600 mt-1">
              {insights.totalAllTime} consultation{insights.totalAllTime > 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-white text-blue-600 text-xs rounded-full font-medium">
                {[searchQuery, dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
          💡 Insights de la Semaine
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">{insights.totalConsultations}</p>
            <p className="text-xs text-gray-600">Consultations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{insights.avgDuration} min</p>
            <p className="text-xs text-gray-600">Durée moyenne</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{insights.labRequests}</p>
            <p className="text-xs text-gray-600">Bilans prescrits</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">{insights.totalAllTime}</p>
            <p className="text-xs text-gray-600">Total historique</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="h-4 w-4 inline mr-1" />
                  Rechercher un patient
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nom du patient..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Effacer les filtres</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600"
        >
          {displayedAppointments.length} résultat{displayedAppointments.length > 1 ? 's' : ''} trouvé{displayedAppointments.length > 1 ? 's' : ''}
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de l'historique...</p>
        </div>
      ) : displayedAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {hasActiveFilters ? 'Aucun résultat' : 'Aucune consultation'}
          </h3>
          <p className="text-gray-600">
            {hasActiveFilters 
              ? 'Essayez de modifier vos critères de recherche' 
              : 'Les consultations terminées apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedAppointments.map((group, groupIndex) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * groupIndex }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Date header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        📅 {formatDate(group.date)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {group.consultations.length} consultation{group.consultations.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(group.date).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              {/* Consultations */}
              <div className="divide-y divide-gray-200">
                {group.consultations.map((consultation, index) => {
                  const duration = Math.floor(
                    (new Date(consultation.endTime) - new Date(consultation.startTime)) / 60000
                  )

                  return (
                    <motion.div
                      key={consultation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 * index }}
                      className="px-6 py-5 hover:bg-gray-50 transition-colors"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${
                            consultation.type === 'Teleconsultation' 
                              ? 'bg-purple-100' 
                              : 'bg-blue-100'
                          }`}>
                            {consultation.type === 'Teleconsultation' ? (
                              <Video className="h-5 w-5 text-purple-600" />
                            ) : (
                              <Stethoscope className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => navigate(`/home/patient-profile/${consultation.patient.id}`)}
                              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {consultation.patient.fullName}
                            </button>
                            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(consultation.startTime).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span>⏱️ {duration > 0 ? `${duration} min` : '—'}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                consultation.type === 'Teleconsultation'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {consultation.type === 'Teleconsultation' ? '💻' : '🩺'} {consultation.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          consultation.statut === 'termine' 
                            ? 'bg-green-100 text-green-800' 
                            : consultation.statut === 'annule'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {consultation.statut === 'termine' ? '✅ Terminé' : 
                           consultation.statut === 'annule' ? '❌ Annulé' : 
                           '🕐 En cours'}
                        </div>
                      </div>

                      {/* Chronic disease */}
                      {consultation.patient.maladieChronique && (
                        <div className="mb-3">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            📋 {consultation.patient.maladieChronique}
                          </span>
                        </div>
                      )}

                      {/* Clinical summary */}
                      {consultation.clinicalSummary && (
                        <div className="mb-4 flex items-start space-x-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                          <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 italic">
                            🧾 "{consultation.clinicalSummary}"
                          </p>
                        </div>
                      )}

                      {/* Vitals */}
                      {consultation.vitalSigns && Object.keys(consultation.vitalSigns).length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                            <Heart className="h-3 w-3 mr-1 text-red-500" />
                            ❤️ Constantes Vitales
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {consultation.vitalSigns.weight && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {consultation.vitalSigns.weight} kg
                              </span>
                            )}
                            {consultation.vitalSigns.bloodPressureSystolic && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {consultation.vitalSigns.bloodPressureSystolic}/{consultation.vitalSigns.bloodPressureDiastolic} mmHg
                              </span>
                            )}
                            {consultation.vitalSigns.heartRate && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {consultation.vitalSigns.heartRate} bpm
                              </span>
                            )}
                            {consultation.vitalSigns.bmi && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                IMC {consultation.vitalSigns.bmi}
                              </span>
                            )}
                            {consultation.vitalSigns.pcm && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                PCM {consultation.vitalSigns.pcm} kg
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Biological tests */}
                      {consultation.biologicalTests && consultation.biologicalTests.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                            <Droplet className="h-3 w-3 mr-1 text-purple-500" />
                            💉 Analyses Biologiques
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {consultation.biologicalTests.map((test, idx) => (
                              <span 
                                key={idx}
                                className={`px-2 py-1 text-xs rounded ${
                                  test.status === 'reçue' 
                                    ? 'bg-green-100 text-green-700'
                                    : test.status === 'en attente'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {test.test}
                                {test.result && ` (${test.result})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      {consultation.documents && consultation.documents.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                            <Download className="h-3 w-3 mr-1 text-gray-500" />
                            📎 Documents
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {consultation.documents.map((doc, idx) => (
                              <button
                                key={idx}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded flex items-center space-x-1 transition-colors"
                              >
                                <span>{doc.type}</span>
                                <Download className="h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Chargement...</p>
            </div>
          )}

          {/* Last element for intersection observer */}
          {hasMore && !loadingMore && (
            <div ref={lastElementRef} className="h-4" />
          )}

          {/* End of list message */}
          {!hasMore && displayedAppointments.length > 0 && (
            <div className="text-center py-6 text-sm text-gray-500">
              <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
              Fin de l'historique
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HistorySimple
