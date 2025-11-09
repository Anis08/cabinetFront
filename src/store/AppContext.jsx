import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'sonner'

// Types d'actions
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_PATIENTS: 'SET_PATIENTS',
  ADD_PATIENT: 'ADD_PATIENT',
  UPDATE_PATIENT: 'UPDATE_PATIENT',
  SET_VISITS: 'SET_VISITS',
  ADD_VISIT: 'ADD_VISIT',
  UPDATE_VISIT: 'UPDATE_VISIT',
  SET_QUEUE: 'SET_QUEUE',
  UPDATE_KPIS: 'UPDATE_KPIS',
  SET_CURRENT_SECTION: 'SET_CURRENT_SECTION'
}

// État initial
const initialState = {
  loading: false,
  error: null,
  currentUser: {
    id: 'user-1',
    name: 'Dr. Martin Dubois',
    email: 'martin.dubois@cabinet.fr',
    role: 'medecin'
  },
  currentSection: 'dashboard',
  patients: [],
  visits: [],
  queue: [],
  kpis: {
    patientsToday: 0,
    waiting: 0,
    inConsultation: 0,
    avgWaitTime: '0min'
  }
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case ActionTypes.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload }
    
    case ActionTypes.SET_CURRENT_SECTION:
      return { ...state, currentSection: action.payload }
    
    case ActionTypes.SET_PATIENTS:
      return { ...state, patients: action.payload }
    
    case ActionTypes.ADD_PATIENT:
      return { 
        ...state, 
        patients: [...state.patients, action.payload] 
      }
    
    case ActionTypes.UPDATE_PATIENT:
      return {
        ...state,
        patients: state.patients.map(patient =>
          patient.id === action.payload.id ? action.payload : patient
        )
      }
    
    case ActionTypes.SET_VISITS:
      return { ...state, visits: action.payload }
    
    case ActionTypes.ADD_VISIT:
      return { 
        ...state, 
        visits: [...state.visits, action.payload] 
      }
    
    case ActionTypes.UPDATE_VISIT:
      return {
        ...state,
        visits: state.visits.map(visit =>
          visit.id === action.payload.id ? action.payload : visit
        )
      }
    
    case ActionTypes.SET_QUEUE:
      return { ...state, queue: action.payload }
    
    case ActionTypes.UPDATE_KPIS:
      return { ...state, kpis: action.payload }
    
    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Hook pour utiliser le context
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Provider
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error })
      if (error) {
        toast.error(error)
      }
    },
    
    setCurrentSection: (section) => {
      dispatch({ type: ActionTypes.SET_CURRENT_SECTION, payload: section })
    },
    
    setPatients: (patients) => dispatch({ type: ActionTypes.SET_PATIENTS, payload: patients }),
    
    addPatient: (patient) => {
      dispatch({ type: ActionTypes.ADD_PATIENT, payload: patient })
      toast.success(`Patient ${patient.prenom} ${patient.nom} ajouté`)
    },
    
    updatePatient: (patient) => {
      dispatch({ type: ActionTypes.UPDATE_PATIENT, payload: patient })
      toast.success('Patient mis à jour')
    },
    
    setVisits: (visits) => dispatch({ type: ActionTypes.SET_VISITS, payload: visits }),
    
    addVisit: (visit) => {
      dispatch({ type: ActionTypes.ADD_VISIT, payload: visit })
      const patient = state.patients.find(p => p.id === visit.patient_id)
      const patientName = patient ? `${patient.prenom} ${patient.nom}` : 'Patient'
      toast.success(`${patientName} ajouté à la file d'attente`)
    },
    
    updateVisit: (visit) => {
      dispatch({ type: ActionTypes.UPDATE_VISIT, payload: visit })
    },
    
    setQueue: (queue) => dispatch({ type: ActionTypes.SET_QUEUE, payload: queue }),
    
    updateKPIs: (kpis) => dispatch({ type: ActionTypes.UPDATE_KPIS, payload: kpis }),

    // Actions métier
    buildQueue: () => {
      const queue = state.visits
        .filter(visit => ['attente', 'appele'].includes(visit.statut))
        .sort((a, b) => {
          const urgenceOrder = { 'critique': 0, 'prioritaire': 1, 'standard': 2 }
          const urgenceA = urgenceOrder[a.niveau_urgence] ?? 2
          const urgenceB = urgenceOrder[b.niveau_urgence] ?? 2
          
          if (urgenceA !== urgenceB) {
            return urgenceA - urgenceB
          }
          
          return new Date(a.heure_arrivee).getTime() - new Date(b.heure_arrivee).getTime()
        })
        .map(visit => {
          const patient = state.patients.find(p => p.id === visit.patient_id)
          return { ...visit, patient }
        })

      dispatch({ type: ActionTypes.SET_QUEUE, payload: queue })
    },

    calculateKPIs: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayVisits = state.visits.filter(visit => {
        const visitDate = new Date(visit.created_at)
        visitDate.setHours(0, 0, 0, 0)
        return visitDate.getTime() === today.getTime()
      })

      const waiting = state.visits.filter(visit => visit.statut === 'attente').length
      const inConsultation = state.visits.filter(visit => visit.statut === 'en_consultation').length
      
      // Calcul du temps d'attente moyen
      const waitingVisits = state.visits.filter(visit => 
        visit.heure_debut_consult && visit.heure_arrivee
      )
      
      let avgWaitTime = '0min'
      if (waitingVisits.length > 0) {
        const totalWaitTime = waitingVisits.reduce((sum, visit) => {
          const startTime = new Date(visit.heure_debut_consult).getTime()
          const arrivalTime = new Date(visit.heure_arrivee).getTime()
          return sum + (startTime - arrivalTime)
        }, 0)
        const avgWaitMinutes = Math.round(totalWaitTime / waitingVisits.length / (1000 * 60))
        avgWaitTime = `${avgWaitMinutes}min`
      }

      const kpis = {
        patientsToday: todayVisits.length,
        waiting,
        inConsultation,
        avgWaitTime
      }

      dispatch({ type: ActionTypes.UPDATE_KPIS, payload: kpis })
    },

    callPatient: async (visitId) => {
      const visit = state.visits.find(v => v.id === visitId)
      if (!visit) return

      const updatedVisit = {
        ...visit,
        statut: 'appele',
        heure_appel: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      dispatch({ type: ActionTypes.UPDATE_VISIT, payload: updatedVisit })
      
      const patient = state.patients.find(p => p.id === visit.patient_id)
      const patientName = patient ? `${patient.prenom} ${patient.nom}` : 'Patient'
      toast.success(`${patientName} appelé`)
    },

    startConsultation: async (visitId) => {
      const visit = state.visits.find(v => v.id === visitId)
      if (!visit) return

      const updatedVisit = {
        ...visit,
        statut: 'en_consultation',
        heure_debut_consult: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      dispatch({ type: ActionTypes.UPDATE_VISIT, payload: updatedVisit })
      
      const patient = state.patients.find(p => p.id === visit.patient_id)
      const patientName = patient ? `${patient.prenom} ${patient.nom}` : 'Patient'
      toast.success(`Consultation démarrée pour ${patientName}`)
    },

    finishConsultation: async (visitId) => {
      const visit = state.visits.find(v => v.id === visitId)
      if (!visit) return

      const updatedVisit = {
        ...visit,
        statut: 'termine',
        heure_fin_consult: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      dispatch({ type: ActionTypes.UPDATE_VISIT, payload: updatedVisit })
      
      const patient = state.patients.find(p => p.id === visit.patient_id)
      const patientName = patient ? `${patient.prenom} ${patient.nom}` : 'Patient'
      toast.success(`Consultation terminée pour ${patientName}`)
    }
  }

  // Effect pour recalculer la queue et les KPIs quand les données changent
  useEffect(() => {
    actions.buildQueue()
    actions.calculateKPIs()
  }, [state.visits, state.patients])

  const value = {
    ...state,
    ...actions
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}