import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  History,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  FileText
} from 'lucide-react'
import { baseURL } from "../config"
import { useAuth } from '../store/AuthProvider'
import { useData } from '../store/DataProvider'

const HistorySimple = () => {
  const { completedAppointments, setCompletedAppointments, setAveragePaid, setCaDay, setCaWeek } = useData()
  const { logout, refresh } = useAuth()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  // Fonction de transformation des données backend vers frontend
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
      statut: appointment.state === 'Completed' ? 'termine' : 
              appointment.state === 'Cancelled' ? 'annule' : 'en cours',
      clinicalSummary: appointment.note || null,
      vitalSigns: Object.keys(vitalSigns).length > 0 ? vitalSigns : null,
      biologicalTests: appointment.biologicalTests || null,
      documents: appointment.documents || []
    }
  }

  // Charger les données
  useEffect(() => {
    loadHistoryData()
  }, [currentDate])

  const loadHistoryData = async () => {
    setLoading(true)
    try {
      let response = await fetch(`${baseURL}/medecin/completed-appointments`, {
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

          response = await fetch(`${baseURL}/medecin/completed-appointments`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          })
        }

        if (!response.ok) {
          console.log('API error, using fallback')
          setCompletedAppointments([])
          setLoading(false)
          return
        }
      }

      const data = await response.json()
      
      let transformedData = []
      if (data.completedApointments && Array.isArray(data.completedApointments)) {
        transformedData = data.completedApointments.map(apt => transformBackendData(apt))
      }
      
      setCompletedAppointments(transformedData)
      if (data.avgPaid || data.averagePaid) setAveragePaid(data.avgPaid || data.averagePaid)
      if (data.todayRevenue) setCaDay(data.todayRevenue)
      if (data.weekRevenue) setCaWeek(data.weekRevenue)
    } catch (error) {
      console.error('Error loading history:', error)
      setCompletedAppointments([])
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les consultations par date
  const getConsultationsForDate = (date) => {
    if (!completedAppointments) return []
    
    const dateStr = date.toISOString().split('T')[0]
    return completedAppointments.filter(apt => {
      const aptDateStr = typeof apt.date === 'string' 
        ? apt.date.split('T')[0] 
        : new Date(apt.date).toISOString().split('T')[0]
      return aptDateStr === dateStr
    })
  }

  const todayConsultations = getConsultationsForDate(currentDate)

  // Navigation de dates
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
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
              Liste complète des consultations passées
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation de dates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Jour précédent"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {currentDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {todayConsultations.length} consultation{todayConsultations.length > 1 ? 's' : ''} ce jour
                </p>
              </div>
            </div>

            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Jour suivant"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Aujourd'hui</span>
          </button>
        </div>
      </motion.div>

      {/* Liste des consultations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-600" />
            Consultations du jour ({todayConsultations.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Chargement des consultations...</p>
          </div>
        ) : todayConsultations.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune consultation ce jour
            </h3>
            <p className="text-gray-600">
              Sélectionnez une autre date pour voir les consultations
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {todayConsultations.map((consultation, index) => {
              const duration = Math.floor(
                (new Date(consultation.endTime) - new Date(consultation.startTime)) / 60000
              )

              return (
                <motion.div
                  key={consultation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
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
        )}
      </motion.div>

      {/* Message informatif */}
      {todayConsultations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <History className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Historique Simplifié
              </h4>
              <p className="text-sm text-blue-800 mt-1">
                {todayConsultations.length} consultation{todayConsultations.length > 1 ? 's' : ''} enregistrée{todayConsultations.length > 1 ? 's' : ''} pour cette date. 
                Utilisez les flèches pour naviguer entre les dates.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default HistorySimple
