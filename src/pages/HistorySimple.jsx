import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, Search, Filter, Clock, CheckCircle } from 'lucide-react'
import { baseURL } from "../config"
import { useAuth } from '../store/AuthProvider'
import { useData } from '../store/DataProvider'

const HistorySimple = () => {

   const { completedAppointments, setCompletedAppointments, setAveragePaid,  setCaDay, setCaWeek } = useData();
  const { logout, refresh } = useAuth();


  const mockHistory = [
    {
      id: 1,
      date: '2025-08-22',
      time: '14:30',
      patient: 'Marie Dubois',
      motif: 'Contrôle tension',
      duree: 25,
      statut: 'termine'
    },
    {
      id: 2,
      date: '2025-08-22',
      time: '10:15',
      patient: 'Jean Martin',
      motif: 'Suivi diabète',
      duree: 35,
      statut: 'termine'
    },
    {
      id: 3,
      date: '2025-08-21',
      time: '16:45',
      patient: 'Sophie Bernard',
      motif: 'Consultation générale',
      duree: 30,
      statut: 'termine'
    }
  ]


  useEffect(() => {
      const getCompletedAppointments = async () => {
        if (completedAppointments) return;
        try {
          let response = await fetch(`${baseURL}/medecin/completed-appointments`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          });
  
          if (!response.ok) {
            if (response.status == 403) {
              logout();
              return
            }
            if (response.status == 401) {
              const refreshResponse = await refresh();
              if (!refreshResponse) {
                logout();
                return
              }
  
  
              response = await fetch(`${baseURL}/medecin/completed-appointments`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                credentials: 'include',
              });
  
            }
  
            if (response.status === 404) {
  
              alert('Aucun rendez-vous trouvé.');
              return;
            }
  
  
  
            if (response.status === 500) {
  
              alert('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.');
              return;
            }
          }
  
          const data = await response.json();
  
          setCompletedAppointments(data.completedApointments);
          setAveragePaid(data.avgPaid);
          setCaDay(data.todayRevenue);
          setCaWeek(data.weekRevenue);
        }
        catch (error) {
          return { error: 'Une erreur est survenue lors de la création du patient.' }
        }
      }
  
      getCompletedAppointments();
    }, [])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <History className="h-6 w-6 mr-2 text-blue-600" />
              Historique des consultations
            </h1>
            <p className="text-gray-600 mt-1">Historique complet des consultations passées</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Consultations récentes ({completedAppointments?.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {completedAppointments && completedAppointments.map((consultation, index) => (
            <motion.div
              key={consultation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {consultation.patient.fullName}
                    </h4>
                    <p className="text-sm text-gray-600">{consultation?.patient.maladieChronique}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{new Date(consultation?.date).toLocaleDateString('fr-FR')}</span>
                  <span>{new Date(consultation?.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <span>{Math.floor(Math.abs(new Date(consultation?.startTime) - new Date(consultation?.endTime)) / (1000 * 60)) }min</span>
                  <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Terminé
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <History className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Historique - Version Simplifiée
            </h4>
            <p className="text-sm text-blue-800 mt-1">
              ✅ Liste des consultations • 📊 Statistiques • 🔍 Recherche et filtres
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HistorySimple