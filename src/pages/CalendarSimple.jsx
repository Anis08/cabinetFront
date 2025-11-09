import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, Clock, Users, Bell, ChevronLeft, ChevronRight, X, User } from 'lucide-react'
import { baseURL } from '../config'
import { useAuth } from '../store/AuthProvider'
import { useData } from '../store/DataProvider'

const CalendarSimple = () => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const dialogRef = useRef(null);
  const { logout, refresh } = useAuth();
  const { patients, setPatients, setAverageAge, setNewPatientsThisMonth, setPatientsViewedThisWeek } = useData();
  const [newRendezVousFormData, setNewRendezVousFormData] = useState({
    dateDeRendezVous: '',
    patientId: ''
  });
  const [patientSearch, setPatientSearch] = useState('');

  // Charger les rendez-vous depuis l'API
  useEffect(() => {
    loadAppointments();
    getPatients();
  }, []);

  const loadAppointments = async () => {
    try {
      let response = await fetch(`${baseURL}/medecin/appointments`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        if (response.status === 401) {
          const refreshResponse = await refresh();
          if (!refreshResponse) {
            logout();
            return;
          }
          response = await fetch(`${baseURL}/medecin/appointments`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    }
  };

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
      console.error('Erreur lors du chargement des patients:', error);
    }
  };

  // Filtered patients for search
  const filteredPatients = patients ? patients.filter(p =>
    p.fullName.toLowerCase().includes(patientSearch.toLowerCase())
  ) : [];

  // Déterminer le statut d'un rendez-vous (à venir, passé, aujourd'hui)
  const getAppointmentStatus = (appointmentDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0, 0, 0, 0);
    
    if (apptDate < today) return 'past'; // Passé
    if (apptDate.getTime() === today.getTime()) return 'today'; // Aujourd'hui
    return 'future'; // À venir
  };

  // Obtenir les rendez-vous pour une date spécifique
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date).toISOString().split('T')[0];
        return aptDate === dateStr;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Tri par ordre d'ajout
  };

  // Statistiques des rendez-vous
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    total: appointments.length,
    aujourdhui: appointments.filter(apt => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === today;
    }).length,
    semaine: appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const weekStart = new Date();
      const weekEnd = new Date();
      weekEnd.setDate(weekStart.getDate() + 7);
      return aptDate >= weekStart && aptDate <= weekEnd;
    }).length,
    aVenir: appointments.filter(apt => getAppointmentStatus(apt.date) === 'future').length
  };

  // Navigation du calendrier
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  };

  // Générer les jours du mois
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    return days;
  };

  const days = getDaysInMonth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRendezVousFormData((prev) => ({ ...prev, [name]: value }));
  };

  const NewRendezVous = async () => {
    const { dateDeRendezVous, patientId } = newRendezVousFormData;
    if (!dateDeRendezVous || !patientId) {
      alert('Tous les champs sont obligatoires.');
      return;
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
          return;
        }
        if (response.status == 401) {
          const refreshResponse = await refresh();
          if (!refreshResponse) {
            logout();
            return;
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

      if (response.ok) {
        await loadAppointments();
        setIsOpen(false);
        setNewRendezVousFormData({
          dateDeRendezVous: '',
          patientId: ''
        });
        setPatientSearch('');
        alert('Rendez-vous créé avec succès !');
      }
    }
    catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      alert('Une erreur est survenue lors de la création du rendez-vous.');
    }
  };

  // Gérer le clic sur une date
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Obtenir la couleur de la cellule selon le statut
  const getDayColor = (date, isCurrentMonth) => {
    if (!isCurrentMonth) return 'text-gray-400';
    
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const dayAppointments = getAppointmentsForDate(date);
    
    if (dayAppointments.length === 0) return 'text-gray-900';
    
    // Vérifier le statut
    const status = getAppointmentStatus(dateStr);
    
    if (status === 'past') return 'bg-red-100 text-red-800 font-semibold'; // Passé = Rouge
    if (status === 'today') return 'bg-blue-500 text-white font-bold'; // Aujourd'hui = Bleu
    return 'bg-green-100 text-green-800 font-semibold'; // À venir = Vert
  };

  // Obtenir les rendez-vous sélectionnés
  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

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
                <p className="text-sm font-medium text-gray-500">À venir</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.aVenir}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Légende des couleurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
              <span className="text-sm text-gray-700">🟩 Rendez-vous à venir</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-400"></div>
              <span className="text-sm text-gray-700">🟥 Rendez-vous passés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500 border-2 border-blue-700"></div>
              <span className="text-sm text-gray-700">🟦 Aujourd'hui</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200 border-2 border-blue-600"></div>
              <span className="text-sm text-gray-700">📌 Date sélectionnée</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendrier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                <div key={day} className="p-2 text-gray-500 font-semibold">{day}</div>
              ))}

              {days.map((day, index) => {
                const dayAppointments = getAppointmentsForDate(day.date);
                const isSelected = selectedDate && 
                  selectedDate.toISOString().split('T')[0] === day.date.toISOString().split('T')[0];
                const dayColor = getDayColor(day.date, day.isCurrentMonth);

                return (
                  <div
                    key={index}
                    onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                    className={`
                      min-h-[80px] p-2 cursor-pointer rounded-lg border-2 transition-all
                      ${day.isCurrentMonth ? 'hover:border-blue-400 hover:shadow-md' : 'border-transparent'}
                      ${isSelected ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-gray-200'}
                      ${dayColor}
                    `}
                  >
                    <div className="font-semibold mb-1">{day.date.getDate()}</div>
                    {dayAppointments.length > 0 && (
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((apt, idx) => {
                          const patient = patients?.find(p => p.id === apt.patientId);
                          return (
                            <div 
                              key={apt.id} 
                              className="text-[10px] bg-white/80 rounded px-1 py-0.5 truncate"
                              title={patient?.fullName || 'Patient'}
                            >
                              {idx + 1}. {patient?.fullName?.split(' ')[0] || 'Patient'}
                            </div>
                          );
                        })}
                        {dayAppointments.length > 2 && (
                          <div className="text-[10px] text-gray-600 font-bold">
                            +{dayAppointments.length - 2} autre(s)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Détails des rendez-vous du jour sélectionné */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              {selectedDate 
                ? `Rendez-vous du ${selectedDate.toLocaleDateString('fr-FR')}`
                : 'Sélectionnez une date'}
            </h3>

            {selectedDate ? (
              selectedDateAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAppointments.map((appointment, idx) => {
                    const patient = patients?.find(p => p.id === appointment.patientId);
                    const status = getAppointmentStatus(appointment.date);
                    
                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 * idx }}
                        className={`p-4 rounded-lg border-2 ${
                          status === 'past' ? 'bg-red-50 border-red-200' :
                          status === 'today' ? 'bg-blue-50 border-blue-300' :
                          'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-700">#{idx + 1}</span>
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            status === 'past' ? 'bg-red-100 text-red-700' :
                            status === 'today' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {status === 'past' ? 'Passé' : status === 'today' ? 'Aujourd\'hui' : 'À venir'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">
                            {patient?.fullName || 'Patient inconnu'}
                          </p>
                          <p className="text-sm text-gray-600">
                            📅 {new Date(appointment.date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Médecin: Dr. {JSON.parse(localStorage.getItem('name')) || 'N/A'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun rendez-vous ce jour</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Cliquez sur une date pour voir les détails</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de création de rendez-vous */}
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
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nouveau rendez-vous
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  NewRendezVous();
                }}
                className="space-y-4"
              >
                {/* Date input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date du rendez-vous *
                  </label>
                  <input
                    name="dateDeRendezVous"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newRendezVousFormData.dateDeRendezVous}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Patient search and list */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>
                  <input
                    type="text"
                    placeholder="Rechercher un patient..."
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredPatients.length === 0 && (
                      <div className="p-3 text-gray-400 text-sm text-center">
                        {patientSearch ? 'Aucun patient trouvé' : 'Commencez à taper pour rechercher'}
                      </div>
                    )}
                    {filteredPatients.map(patient => (
                      <div
                        key={patient.id}
                        onClick={() => {
                          setNewRendezVousFormData(prev => ({
                            ...prev,
                            patientId: patient.id
                          }));
                          setPatientSearch(patient.fullName);
                        }}
                        className={`cursor-pointer px-3 py-2 hover:bg-blue-50 transition-colors ${
                          String(newRendezVousFormData.patientId) === String(patient.id)
                            ? 'bg-blue-100 font-semibold text-blue-800'
                            : ''
                        }`}
                      >
                        {patient.fullName}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newRendezVousFormData.dateDeRendezVous || !newRendezVousFormData.patientId}
                  >
                    Créer le rendez-vous
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
