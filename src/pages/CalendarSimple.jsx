import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Clock, Users, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { baseURL } from '../config'
import { useAuth } from '../store/AuthProvider'
import { useData } from '../store/DataProvider'

const CalendarSimple = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);
  const { logout, refresh } = useAuth();
  const { patients, setPatients, setAverageAge, setNewPatientsThisMonth, setPatientsViewedThisWeek, appo } = useData();
  const [newRendezVousFormData, setNewRendezVousFormData] = useState({
    dateDeRendezVous: '',
    patientId: ''
  });
  const [patientSearch, setPatientSearch] = useState('');

  // Données mockées des rendez-vous
  const mockAppointments = [
    {
      id: 1,
      date: '2025-08-23',
      time: '09:00',
      patient: 'Marie Dubois',
      motif: 'Contrôle tension',
      statut: 'attente',
      duree: 30
    },
    {
      id: 2,
      date: '2025-08-23',
      time: '10:30',
      patient: 'Jean Martin',
      motif: 'Suivi diabète',
      statut: 'en_consultation',
      duree: 45
    },
    {
      id: 3,
      date: '2025-08-24',
      time: '14:00',
      patient: 'Sophie Bernard',
      motif: 'Consultation générale',
      statut: 'attente',
      duree: 30
    },
    {
      id: 4,
      date: '2025-08-25',
      time: '16:00',
      patient: 'Pierre Moreau',
      motif: 'Résultats analyses',
      statut: 'attente',
      duree: 20
    }
  ]



  useEffect(() => {
    const getPatients = async () => {
      if (patients) return;
      try {
        let response = await fetch(`${baseURL}/medecin/list-patients`, {
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


            response = await fetch(`${baseURL}/medecin/list-patients`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              credentials: 'include',
            });

          }

          if (response.status === 404) {

            alert('Aucun patient trouvé.');
            return;
          }



          if (response.status === 500) {

            alert('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.');
            return;
          }
        }

        const data = await response.json();

        setPatients(data.patients);
        setAverageAge(data.averageAge);
        setNewPatientsThisMonth(data.newPatientsThisMonth);
        setPatientsViewedThisWeek(data.patientsViewedThisWeek);
      }
      catch (error) {
        return { error: 'Une erreur est survenue lors de la création du patient.' }
      }
    }

    getPatients();
  }, [])

  // Filtered patients for search
  const filteredPatients = patients ? patients.filter(p =>
    p.fullName.toLowerCase().includes(patientSearch.toLowerCase())
  ) : [];

  // Statistiques des rendez-vous
  const today = new Date().toISOString().split('T')[0]
  const stats = {
    total: mockAppointments.length,
    aujourdhui: mockAppointments.filter(apt => apt.date === today).length,
    semaine: mockAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      const weekStart = new Date()
      const weekEnd = new Date()
      weekEnd.setDate(weekStart.getDate() + 7)
      return aptDate >= weekStart && aptDate <= weekEnd
    }).length,
    avecRappel: mockAppointments.filter(apt => apt.statut === 'attente').length
  }

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'attente': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'en_consultation': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'termine': return 'bg-green-100 text-green-800 border-green-200'
      case 'annule': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Navigation du calendrier
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }

    return days
  }

  const days = getDaysInMonth()

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRendezVousFormData((prev) => ({ ...prev, [name]: value }));
  };

  const NewRendezVous = async () => {
    setIsOpen(false);
    setNewRendezVousFormData({
      dateDeRendezVous: '',
      patientId: ''
    })
    const { dateDeRendezVous, patientId } = newRendezVousFormData;
    if (!dateDeRendezVous || !patientId) {
      return { error: 'Tous les champs sont obligatoires.' }
    }

    try {
      let response = await fetch(`${baseURL}/medecin/add-appointment`, {
        method: 'POST',
        body: JSON.stringify({
          dateDeRendezVous, patientId
        }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
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


          response = await fetch(`${baseURL}/medecin/add-appointment`, {
            method: 'POST',
            body: JSON.stringify({
              dateDeRendezVous, patientId
            }),
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json",
            },
            credentials: 'include',
          });

        }

        if (response.status === 400) {

          alert('Requete invalide');
          return;
        }

        if (response.status === 409) {

          alert('Un rendez-vous identique existe déjà pour ce patient à cette date.');
          return;
        }



        if (response.status === 500) {

          alert('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.');
          return;
        }
      }

      //const data = await response.json();


    }
    catch (error) {
      return { error: 'Une erreur est survenue lors de la création du rendez-vous.' }
    }

  }

  return (
    <>

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
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                Calendrier des rendez-vous
              </h1>
              <p className="text-gray-600 mt-1">Planification et suivi des consultations</p>
            </div>

            <button onClick={() => setIsOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rendez-vous
            </button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total RDV</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Aujourd'hui</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.aujourdhui}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Cette semaine</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.semaine}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avec rappel</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.avecRappel}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* WhatsApp Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">
                📱 Rappels WhatsApp automatiques
              </h4>
              <p className="text-sm text-green-800 mt-1">
                Les patients recevront automatiquement un rappel WhatsApp 24h avant leur rendez-vous.
                Simulation complète avec templates personnalisés et statistiques d'envoi.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mini calendrier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={previousMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                <div key={day} className="p-2 text-gray-500 font-medium">{day}</div>
              ))}

              {days.map((day, index) => {
                const dateStr = day.date.toISOString().split('T')[0]
                const hasAppointment = mockAppointments.some(apt => apt.date === dateStr)

                return (
                  <div
                    key={index}
                    className={`p-2 cursor-pointer hover:bg-blue-50 rounded ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${hasAppointment ? 'bg-blue-100 font-semibold text-blue-800' : ''}`}
                  >
                    {day.date.getDate()}
                    {hasAppointment && <div className="w-1 h-1 bg-blue-600 rounded-full mx-auto mt-1"></div>}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Liste des rendez-vous */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prochains rendez-vous
            </h3>

            <div className="space-y-3">
              {mockAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {appointment.time}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.motif} • {appointment.duree}min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.statut)}`}>
                      {appointment.statut}
                    </div>
                    <button className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                      <Bell className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Statut fonctionnalité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-purple-900">
                Calendrier - Version Simplifiée
              </h4>
              <p className="text-sm text-purple-800 mt-1">
                ✅ Interface calendrier • 📱 Rappels WhatsApp • 📊 Statistiques temps réel
              </p>
              <p className="text-xs text-purple-700 mt-2">
                La version complète inclut : planification intelligente, détection de conflits,
                gestion des médecins, intégration complète avec la file d'attente et bien plus !
              </p>
            </div>
          </div>
        </motion.div>
      </div>


      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              ref={dialogRef}
              tabIndex={-1}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 top-0 bg-white dark:bg-slate-800 pb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Enter Information
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  NewRendezVous();
                }}
                className="space-y-3"
              >
                {/* Date input */}
                <input
                  name="dateDeRendezVous"
                  type="date"
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  value={newRendezVousFormData.dateDeRendezVous}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3"
                />

                {/* Patient search and list */}
                <input
                  type="text"
                  placeholder="Rechercher un patient"
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3"
                />
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                  {filteredPatients.length === 0 && (
                    <div className="p-2 text-gray-400 text-sm">Aucun patient trouvé</div>
                  )}
                  {filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      onClick={() =>
                        setNewRendezVousFormData(prev => ({
                          ...prev,
                          patientId: patient.id
                        }))
                      }
                      className={`cursor-pointer px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 ${String(newRendezVousFormData.patientId) === String(patient.id)
                          ? 'bg-blue-100 dark:bg-blue-900 font-semibold text-blue-800 dark:text-blue-200'
                          : ''
                        }`}
                    >
                      {patient.fullName}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white dark:bg-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    disabled={!newRendezVousFormData.dateDeRendezVous || !newRendezVousFormData.patientId}
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </>
  )
}

export default CalendarSimple