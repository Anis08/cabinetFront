import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Plus, Phone, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { baseURL } from "../config"
import { useAuth } from '../store/AuthProvider'
import { useData } from '../store/DataProvider'

const QueueSimple = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { todayAppointments, setTodayAppointments, completedAppointments, setCompletedAppointments, setAveragePaid, setCaDay, setCaWeek,
    patients, setPatients, setAverageAge, setNewPatientsThisMonth, setPatientsViewedThisWeek } = useData();
  const { logout, refresh } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [finishEnabled, setFinishEnabled] = useState(true);
  const [addToWaitingFormData, setAddToWaitingFormData] = useState({
    patientId: '',
  });
  const [selectedChoice, setSelectedChoice] = useState('queue');


  const listChoice = [
    { text: 'File d\'attente', value: 'queue' },
    { text: 'Patients absents', value: 'absent' }
  ]

  // State for finish consultation modal
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [finishForm, setFinishForm] = useState({
    paye: '',
    note: '',
    poids: '',
    prochainRdv: '',
    pcm: '',
    imc: '',
    pulse: '',
    paSystolique: '',
    paDiastolique: '',
  });
  const [hasProchainRdv, setHasProchainRdv] = useState(false);

  // Mise à jour de l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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
      }
      catch (error) {
        return { error: 'Une erreur est survenue lors de la création du patient.' }
      }
    }

    getCompletedAppointments();
  }, [])

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

  // Données mockées de la file d'attente
  const mockQueue = [
    {
      id: 1,
      patient: { nom: 'Dubois', prenom: 'Marie' },
      heure_arrivee: '2025-08-23T09:15:00',
      niveau_urgence: 'critique',
      statut: 'en_attente',
      motif: 'Douleur thoracique'
    },
    {
      id: 2,
      patient: { nom: 'Martin', prenom: 'Jean' },
      heure_arrivee: '2025-08-23T09:30:00',
      niveau_urgence: 'prioritaire',
      statut: 'appele',
      motif: 'Contrôle diabète'
    },
    {
      id: 3,
      patient: { nom: 'Bernard', prenom: 'Sophie' },
      heure_arrivee: '2025-08-23T09:45:00',
      niveau_urgence: 'standard',
      statut: 'en_consultation',
      motif: 'Consultation de routine'
    },
    {
      id: 4,
      patient: { nom: 'Moreau', prenom: 'Pierre' },
      heure_arrivee: '2025-08-23T10:00:00',
      niveau_urgence: 'standard',
      statut: 'en_attente',
      motif: 'Renouvellement ordonnance'
    }
  ]

  const getUrgencyColor = (niveau) => {
    switch (niveau) {
      case 'critique': return 'bg-red-100 text-red-800 border-red-200'
      case 'prioritaire': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'standard': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'appele': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'en_consultation': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'termine': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'en_attente': return <Clock className="h-4 w-4" />
      case 'appele': return <Phone className="h-4 w-4" />
      case 'en_consultation': return <Play className="h-4 w-4" />
      case 'termine': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const calculateWaitTime = (heureArrivee) => {
    const arrivee = new Date(heureArrivee)
    const diff = currentTime - arrivee
    const minutes = Math.floor(diff / (1000 * 60))
    return minutes > 0 ? `${minutes}min` : '0min'
  }

  // Statistiques
  const stats = {
    total: mockQueue.length,
    enAttente: mockQueue.filter(p => p.statut === 'en_attente').length,
    enConsultation: mockQueue.filter(p => p.statut === 'en_consultation').length,
    critique: mockQueue.filter(p => p.niveau_urgence === 'critique').length
  }





  useEffect(() => {
    const getTodayAppointments = async () => {
      if (todayAppointments) return;
      try {
        let response = await fetch(`${baseURL}/medecin/today-appointments`, {
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


            response = await fetch(`${baseURL}/medecin/today-appointments`, {
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

        setTodayAppointments(data.todayAppointments);
      }
      catch (error) {
        return { error: 'Une erreur est survenue lors de la création du patient.' }
      }
    }

    getTodayAppointments();
  }, [])

  {/*Liste des patient absent*/ }
  const filteredPatients = patients ? patients.filter(ap =>
    ap.fullName.toLowerCase().includes(patientSearch.toLowerCase())
  ) : [];



  const NewRendezVous = async (rendezVousId) => {

    if (!rendezVousId) {
      return { error: 'Tous les champs sont obligatoires.' }
    }

    try {
      let response = await fetch(`${baseURL}/medecin/add-to-waiting`, {
        method: 'POST',
        body: JSON.stringify({
          rendezVousId
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


          response = await fetch(`${baseURL}/medecin/add-to-waiting`, {
            method: 'POST',
            body: JSON.stringify({
              rendezVousId
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

      const data = await response.json();

      setTodayAppointments(

        todayAppointments.map(ap => {
          if (ap.id === rendezVousId) {
            return { ...ap, state: 'Waiting', arrivalTime: new Date().toISOString() };
          }
          return ap;
        })

      );


    }
    catch (error) {
      return { error: 'Une erreur est survenue lors de la création du rendez-vous.' }
    }

  }


  const NewRendezVousToday = async () => {
    const patientId = addToWaitingFormData.patientId
    if (!patientId) {
      return { error: 'Tous les champs sont obligatoires.' }
    }
    setIsOpen(false)

    try {
      let response = await fetch(`${baseURL}/medecin/add-to-waiting-today`, {
        method: 'POST',
        body: JSON.stringify({
          patientId
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


          response = await fetch(`${baseURL}/medecin/add-to-waiting-today`, {
            method: 'POST',
            body: JSON.stringify({
              patientId
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

      const data = await response.json();

      setTodayAppointments(
        [...todayAppointments, data.rendezVous]
      );


    }
    catch (error) {
      return { error: 'Une erreur est survenue lors de la création du rendez-vous.' }
    }

  }




  const addToInProgress = async (rendezVousId) => {

    if (todayAppointments.find(ap => ap.state === 'InProgress')) {
      alert('Un patient est déjà en consultation. Veuillez terminer la consultation en cours avant d\'en commencer une nouvelle.');
      return;
    }

    if (!rendezVousId) {
      return { error: 'Tous les champs sont obligatoires.' }
    }

    try {
      let response = await fetch(`${baseURL}/medecin/add-to-actif`, {
        method: 'POST',
        body: JSON.stringify({
          rendezVousId
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


          response = await fetch(`${baseURL}/medecin/add-to-actif`, {
            method: 'POST',
            body: JSON.stringify({
              rendezVousId
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

      const data = await response.json();

      setTodayAppointments(

        todayAppointments.map(ap => {
          if (ap.id === rendezVousId) {
            return { ...ap, state: 'InProgress', startTime: new Date().toISOString() };
          }
          return ap;
        })

      );


    }
    catch (error) {
      return { error: 'Une erreur est survenue lors de la création du rendez-vous.' }
    }

  }


  const handleReturnToQueue = async (rendezVousId) => {

    const confirmed = window.confirm("Êtes-vous sûr de vouloir annuler et retourner le patient à la file d'attente ?");
    if (!confirmed) return;
    
    if (!rendezVousId) {
      return { error: 'Tous les champs sont obligatoires.' }
    }

    try {
      let response = await fetch(`${baseURL}/medecin/return-queue`, {
        method: 'POST',
        body: JSON.stringify({
          rendezVousId
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


          response = await fetch(`${baseURL}/medecin/return-queue`, {
            method: 'POST',
            body: JSON.stringify({
              rendezVousId
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

      const data = await response.json();

      setTodayAppointments(

        todayAppointments.map(ap => {
          if (ap.id === rendezVousId) {
            return { ...ap, state: 'Waiting', startTime: null };
          }
          return ap;
        })

      );


    }
    catch (error) {
      return { error: 'Une erreur est survenue lors de la création du rendez-vous.' }
    }

  }

  // Function to finish consultation (update backend)
  const finishConsultation = async (rendezVousId) => {
    setFinishEnabled(false)
    setIsFinishOpen(false);

    if (!finishForm.paye || isNaN(Number(finishForm.paye))) {
      alert('Le paiement est obligatoire et doit être un nombre.');
      return;
    }
    try {
      // TODO: Replace with your backend endpoint
      let response = await fetch(`${baseURL}/medecin/finish-consultation`, {
        method: 'POST',
        body: JSON.stringify({
          rendezVousId,
          paye: Number(finishForm.paye),
          note: finishForm.note,
          poids: finishForm.poids,
          prochainRdv: hasProchainRdv ? finishForm.prochainRdv : null,
          // nouveaux champs optionnels
          pcm: finishForm.pcm !== '' ? parseFloat(finishForm.pcm) : null,
          imc: finishForm.imc !== '' ? parseFloat(finishForm.imc) : null,
          pulse: finishForm.pulse !== '' ? parseInt(finishForm.pulse, 10) : null,
          paSystolique: finishForm.paSystolique !== '' ? parseInt(finishForm.paSystolique, 10) : null,
          paDiastolique: finishForm.paDiastolique !== '' ? parseInt(finishForm.paDiastolique, 10) : null,
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
          response = await fetch(`${baseURL}/medecin/finish-consultation`, {
            method: 'POST',
            body: JSON.stringify({
              rendezVousId,
              paye: Number(finishForm.paye),
              note: finishForm.note,
              poids: finishForm.poids,
              prochainRdv: hasProchainRdv ? finishForm.prochainRdv : null,
              // nouveaux champs optionnels
              pcm: finishForm.pcm !== '' ? parseFloat(finishForm.pcm) : null,
              imc: finishForm.imc !== '' ? parseFloat(finishForm.imc) : null,
              pulse: finishForm.pulse !== '' ? parseInt(finishForm.pulse, 10) : null,
              paSystolique: finishForm.paSystolique !== '' ? parseInt(finishForm.paSystolique, 10) : null,
              paDiastolique: finishForm.paDiastolique !== '' ? parseInt(finishForm.paDiastolique, 10) : null,
            }),
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json",
            },
            credentials: 'include',
          });
        }

        if (response.status === 400 || response.status === 404) {
          const data = await response.json();
          alert(data.message || 'Requête invalide.');
          return;
        }

        if (response.status === 500) {
          alert('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.');
          return;
        }
      }

      const data = await response.json();

      setTodayAppointments(
        todayAppointments.map(ap => {
          if (ap.id === rendezVousId) {
            return {
              ...ap, state: 'Completed',
              endTime: new Date().toISOString(),
              paid: parseInt(finishForm.paye),
              note: finishForm.note || null,
              poids: finishForm.poids ? parseFloat(finishForm.poids) : null,
              // enregistrer localement les nouveaux champs
              pcm: finishForm.pcm !== '' ? parseFloat(finishForm.pcm) : null,
              imc: finishForm.imc !== '' ? parseFloat(finishForm.imc) : null,
              pulse: finishForm.pulse !== '' ? parseInt(finishForm.pulse, 10) : null,
              paSystolique: finishForm.paSystolique !== '' ? parseInt(finishForm.paSystolique, 10) : null,
              paDiastolique: finishForm.paDiastolique !== '' ? parseInt(finishForm.paDiastolique, 10) : null,
            };
          }
          return ap;
        })
      );

      setCompletedAppointments([
        data.completed,
        ...completedAppointments,
      ]);

      setFinishForm({
        paye: '',
        note: '',
        poids: '',
        prochainRdv: '',
        pcm: '',
        imc: '',
        pulse: '',
        paSystolique: '',
        paDiastolique: '',
      });
      setHasProchainRdv(false);
    } catch (error) {
      alert('Erreur lors de la finalisation de la consultation.');
      console.log(error);
    }
    finally {
      setFinishEnabled(true)
    }
  };

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
                <Clock className="h-6 w-6 mr-2 text-blue-600" />
                File d'attente
              </h1>
              <p className="text-gray-600 mt-1">
                {currentTime.toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <button onClick={() => setIsOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter à la file
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
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total file</p>
                <p className="text-2xl font-semibold text-gray-900">{todayAppointments?.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-semibold text-gray-900">{todayAppointments?.filter(ap => ap.state === 'Waiting').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">En consultation</p>
                <p className="text-2xl font-semibold text-gray-900">{todayAppointments?.find(ap => ap.state === 'InProgress') ? 1 : 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Critiques</p>
                <p className="text-2xl font-semibold text-gray-900">tetbedel</p>
              </div>
            </div>
          </div>
        </motion.div>




        {/* Patient actif */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center space-x-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Patients actif
            </h3>
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          </div>

          <div className="divide-y divide-gray-200">
            {todayAppointments?.find(ap => ap.state === 'InProgress') ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-6 py-4 hover:bg-gray-50"
              >

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">


                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {todayAppointments.find(ap => ap.state === 'InProgress').patient.fullName[0]}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {todayAppointments.find(ap => ap.state === 'InProgress').patient.fullName}
                      </h4>
                      <p className="text-sm text-gray-600">{todayAppointments.find(ap => ap.state === 'InProgress').patient.maladieChronique}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Temps d'attente */}
                    <div className="text-center">
                      {/*<div className="text-sm font-semibold text-gray-900">
                        {calculateWaitTime(item.arrivalTime)}
                      </div>
                      <div className="text-xs text-gray-500">d'attente</div>*/}
                    </div>


                    {/* Statut */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor('en_consultation')}`}>
                      {getStatusIcon('en_consultation')}
                      <span>en consultation</span>
                    </div>

                    {/* Annuler (retourner à la ligne d’attente) */}
                    <button
                      className="ml-2 px-3 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition-colors text-xs font-semibold"
                      onClick={() => handleReturnToQueue(todayAppointments.find(ap => ap.state === 'InProgress').id)}
                    >
                      Annuler
                    </button>


                    {/* Terminer consultation button */}
                    <button
                      className="ml-4 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-semibold"
                      disabled={!finishEnabled}
                      onClick={() => setIsFinishOpen(true)}
                    >
                      Terminer consultation
                    </button>
                  </div>
                </div>
              </motion.div>
            ) :
              (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-6 py-4 hover:bg-gray-50"
                >

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">




                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Aucun patient en consultation
                        </h4>
                      </div>
                    </div>


                    {/* Temps d'attente */}
                    <div className="text-center">
                      {/*<div className="text-sm font-semibold text-gray-900">
                        {calculateWaitTime(item.arrivalTime)}
                      </div>
                      <div className="text-xs text-gray-500">d'attente</div>*/}
                    </div>







                  </div>
                </motion.div>
              )}
          </div>
        </motion.div>


        {/* Choix de la vue */}
        <div className='flex justify-start space-x-4 px-2'>
          {listChoice.map((choice) => (
            <button onClick={() => setSelectedChoice(choice.value)}
              className={` px-5 py-3 rounded-lg font-semibold text-sm shadow-sm border border-gray-200
                   ${selectedChoice === choice.value ? 'bg-blue-600 border-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 bg-white'}`}>
              {choice.text}
            </button>
          ))}
        </div>


        {selectedChoice === 'queue' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Patients en file ({todayAppointments?.filter(ap => ap.state === 'Waiting').length})
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {todayAppointments && todayAppointments.filter(ap => ap.state === 'Waiting').sort((a, b) => new Date(a.arrivalTime) - new Date(b.arrivalTime)).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="px-6 py-4 hover:bg-gray-50"
                >

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold text-gray-500">
                        #{index + 1}
                      </div>

                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {item.patient.fullName[0]}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {item.patient.fullName}
                        </h4>
                        <p className="text-sm text-gray-600">{item.patient.maladieChronique}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Temps d'attente */}
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {calculateWaitTime(item.arrivalTime)}
                        </div>
                        <div className="text-xs text-gray-500">d'attente</div>
                      </div>


                      {/* Statut */}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor('en_attente')}`}>
                        {getStatusIcon('en_attente')}
                        <span>en attente</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button onClick={() => addToInProgress(item.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>)

          :

          (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Patients absent ({todayAppointments?.filter(ap => ap.state === 'Scheduled').length})
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {todayAppointments && todayAppointments.filter(ap => ap.state === 'Scheduled').map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">


                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {item.patient.fullName[0]}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {item.patient.fullName}
                          </h4>
                          <p className="text-sm text-gray-600">{item.patient.maladieChronique}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">




                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Phone className="h-4 w-4" />
                          </button>
                          <button onClick={() => NewRendezVous(item.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Play className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>)
        }


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
                  NewRendezVousToday();
                }}
                className="space-y-3"
              >


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
                  {filteredPatients.map(ap => (
                    <div
                      key={ap.id}
                      onClick={() =>
                        setAddToWaitingFormData(prev => ({
                          ...prev,
                          patientId: ap.id
                        }))
                      }
                      className={`cursor-pointer px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-700 ${String(addToWaitingFormData.patientId) === String(ap.id)
                        ? 'bg-blue-100 dark:bg-blue-900 font-semibold text-blue-800 dark:text-blue-200'
                        : ''
                        }`}
                    >
                      {ap.fullName}
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
                    disabled={!addToWaitingFormData.patientId}
                  >
                    Add
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finish Consultation Modal */}
      <AnimatePresence>
        {isFinishOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsFinishOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 top-0 bg-white dark:bg-slate-800 pb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Terminer la consultation
                </h3>
                <button
                  onClick={() => setIsFinishOpen(false)}
                  className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const actif = todayAppointments.find(ap => ap.state === 'InProgress');
                  if (actif) finishConsultation(actif.id);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="paye">
                    Payé <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="paye"
                      min="0"
                      step="1"
                      required
                      className="w-full border border-slate-300 rounded-lg py-2 px-3 pr-12"
                      value={finishForm.paye}
                      onChange={e => {
                        // Only allow integers
                        const val = e.target.value.replace(/\D/g, '');
                        setFinishForm(f => ({ ...f, paye: val }));
                      }}
                      placeholder="Montant"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 select-none pointer-events-none">
                      DA
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Note</label>
                  <textarea
                    className="w-full border border-slate-300 rounded-lg py-2 px-3"
                    value={finishForm.note}
                    onChange={e => setFinishForm(f => ({ ...f, note: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 rounded-lg py-2 px-3"
                    value={finishForm.poids}
                    onChange={e => setFinishForm(f => ({ ...f, poids: e.target.value }))
                    }
                  />
                </div>

                {/* Nouveaux champs optionnels */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">PCM</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-slate-300 rounded-lg py-2 px-3"
                      value={finishForm.pcm}
                      onChange={e => setFinishForm(f => ({ ...f, pcm: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IMC</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border border-slate-300 rounded-lg py-2 px-3"
                      value={finishForm.imc}
                      onChange={e => setFinishForm(f => ({ ...f, imc: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">rythme cardiaque (bpm)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="w-full border border-slate-300 rounded-lg py-2 px-3"
                      value={finishForm.pulse}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFinishForm(f => ({ ...f, pulse: val }));
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">PA (sys / dia)</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="w-1/2 border border-slate-300 rounded-lg py-2 px-3"
                        value={finishForm.paSystolique}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFinishForm(f => ({ ...f, paSystolique: val }));
                        }}
                        placeholder="Sys"
                      />
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="w-1/2 border border-slate-300 rounded-lg py-2 px-3"
                        value={finishForm.paDiastolique}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFinishForm(f => ({ ...f, paDiastolique: val }));
                        }}
                        placeholder="Dia"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasProchainRdv"
                    checked={hasProchainRdv}
                    onChange={e => {
                      setHasProchainRdv(e.target.checked);
                      if (!e.target.checked) {
                        setFinishForm(f => ({ ...f, prochainRdv: '' }));
                      }
                    }}
                  />
                  <label htmlFor="hasProchainRdv" className="text-sm font-medium">
                    Ajouter un prochain rendez-vous
                  </label>
                </div>
                {hasProchainRdv && (
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="prochainRdv">Prochain rendez-vous</label>
                    <input
                      type="date"
                      id="prochainRdv"
                      min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full border border-slate-300 rounded-lg py-2 px-3"
                      value={finishForm.prochainRdv}
                      onChange={e => setFinishForm(f => ({ ...f, prochainRdv: e.target.value }))}
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFinishOpen(false)}
                    className="px-4 py-2 rounded-md border border-slate-200 bg-transparent hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                  >
                    Terminer
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

export default QueueSimple