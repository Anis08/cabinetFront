import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  History,
  Calendar,
  Clock,
  User,
  FileText
} from 'lucide-react'
import { baseURL } from "../config"
import { useAuth } from '../store/AuthProvider'

const HistorySimple = () => {
  const { logout, refresh } = useAuth()
  
  const [allAppointments, setAllAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Fonction de transformation des données backend vers frontend
  const transformBackendData = (appointment) => {
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
      statut: appointment.state === 'Completed' ? 'termine' : 
              appointment.state === 'Cancelled' ? 'annule' : 'en cours',
      clinicalSummary: appointment.note || null
    }
  }

  // Charger les données
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
        // Fallback to old structure if new endpoint not ready
        transformedData = data.completedApointments.map(apt => transformBackendData(apt))
      }
      
      setAllAppointments(transformedData)
    } catch (error) {
      console.error('Error loading history:', error)
      setAllAppointments([])
    } finally {
      setLoading(false)
    }
  }

  // Grouper les consultations par date
  const groupConsultationsByDate = () => {
    const grouped = {}
    
    allAppointments.forEach(apt => {
      const dateStr = typeof apt.date === 'string' 
        ? apt.date.split('T')[0] 
        : new Date(apt.date).toISOString().split('T')[0]
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(apt)
    })

    // Convertir en tableau et trier par date décroissante (plus récent d'abord)
    return Object.entries(grouped)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([date, consultations]) => ({
        date,
        consultations: consultations.sort((a, b) => 
          new Date(a.startTime) - new Date(b.startTime)
        )
      }))
  }

  const groupedConsultations = groupConsultationsByDate()

  // Formater la date en français
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <History className="h-6 w-6 mr-2 text-blue-600" />
              Historique des Consultations
            </h1>
            <p className="text-gray-600 mt-1">
              {allAppointments.length} consultation{allAppointments.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
      </motion.div>

      {/* Liste des consultations groupées par date */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de l'historique...</p>
        </div>
      ) : allAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune consultation enregistrée
          </h3>
          <p className="text-gray-600">
            Les consultations terminées apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedConsultations.map((group, groupIndex) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * groupIndex }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* En-tête de date */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {formatDate(group.date)}
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

              {/* Liste des consultations du jour */}
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
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        {/* Informations patient */}
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900">
                              {consultation.patient.fullName}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(consultation.startTime).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span>⏱️ {duration > 0 ? `${duration} min` : '—'}</span>
                              <span>📋 {consultation.motif}</span>
                              {consultation.patient.maladieChronique && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                  {consultation.patient.maladieChronique}
                                </span>
                              )}
                            </div>
                            
                            {/* Résumé clinique si disponible */}
                            {consultation.clinicalSummary && (
                              <div className="mt-2 flex items-start space-x-2 text-sm">
                                <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 italic">
                                  {consultation.clinicalSummary}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Badge statut */}
                        <div className="ml-4">
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
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message informatif */}
      {allAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <History className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Historique Complet
              </h4>
              <p className="text-sm text-blue-800 mt-1">
                {allAppointments.length} consultation{allAppointments.length > 1 ? 's' : ''} enregistrée{allAppointments.length > 1 ? 's' : ''}, 
                groupées par date. Les plus récentes apparaissent en premier.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default HistorySimple
