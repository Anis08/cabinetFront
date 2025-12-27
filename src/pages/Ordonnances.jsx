import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Search, Filter, Calendar, User } from 'lucide-react'
import OrdonnanceEditor from '../components/Ordonnances/OrdonnanceEditor'
import OrdonnancesList from '../components/Ordonnances/OrdonnancesList'
import { baseURL } from '../config'
import { useAuth } from '../store/AuthProvider'

const Ordonnances = () => {
  const { logout, refresh } = useAuth()
  const [ordonnances, setOrdonnances] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientSelector, setShowPatientSelector] = useState(false)
  const [patients, setPatients] = useState([])

  // Mock data for now (will be replaced with API call)
  const mockOrdonnances = [
    {
      _id: '1',
      numero: 'ORD-2024-001',
      patientName: 'Marie Dubois',
      date: '2024-11-10',
      medicaments: [
        { nom: 'Doliprane', dosage: '1000mg', frequence: '3 fois par jour', duree: '5 jours' },
        { nom: 'Amoxicilline', dosage: '500mg', frequence: '2 fois par jour', duree: '7 jours' }
      ],
      observations: 'Repos recommandé pendant 48h'
    },
    {
      _id: '2',
      numero: 'ORD-2024-002',
      patientName: 'Jean Martin',
      date: '2024-11-09',
      medicaments: [
        { nom: 'Metformine', dosage: '850mg', frequence: '2 fois par jour', duree: '30 jours' }
      ],
      observations: 'Contrôle glycémie hebdomadaire'
    }
  ]

  useEffect(() => {
    // fetchOrdonnances()
    // For now, use mock data
    setOrdonnances(mockOrdonnances)
    fetchPatients()
    setLoading(false)
  }, [])

  const fetchPatients = async () => {
    try {
      let response = await fetch(`${baseURL}/medecin/list-patients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          // Token expired or unauthorized, try to refresh
          console.warn('Token expired/unauthorized, attempting refresh...')
          const refreshResponse = await refresh()
          
          if (!refreshResponse) {
            console.warn('Token refresh failed, logging out')
            logout()
            return
          }

          // Retry with new token
          console.log('Token refreshed, retrying request...')
          response = await fetch(`${baseURL}/medecin/list-patients`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          })
        }
      }

      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
        console.log(`Loaded ${data.patients?.length || 0} patients`)
      } else {
        // Silently fail if still unauthorized after refresh attempt
        if (response.status === 401 || response.status === 403) {
          console.warn('Authentication issue - no patients available')
          setPatients([])
        } else {
          console.warn('Error fetching patients:', response.status, response.statusText)
        }
      }
    } catch (error) {
      // Only log unexpected errors
      if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
        console.warn('Unexpected error fetching patients:', error.message)
      }
      setPatients([])
    }
  }

  const handleOpenEditor = () => {
    if (patients.length > 0) {
      setShowPatientSelector(true)
    } else {
      alert('Aucun patient disponible. Veuillez d\'abord créer un patient.')
    }
  }

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)
    setShowPatientSelector(false)
    setIsEditorOpen(true)
  }

  const handleSaveOrdonnance = async (ordonnance) => {
    try {
      
      // For now, add to local state
      const newOrd = {
        ...ordonnance,
        _id: Date.now().toString(),
        numero: `ORD-2024-${String(ordonnances.length + 1).padStart(3, '0')}`
      }
      
      setOrdonnances([newOrd, ...ordonnances])
      setIsEditorOpen(false)
      alert('Ordonnance créée avec succès!')
    } catch (error) {
      console.error('Error saving ordonnance:', error)
      alert('Erreur lors de la création de l\'ordonnance')
    }
  }

  const handleViewOrdonnance = (ordonnance) => {
    // Open in modal or new page
    console.log('View ordonnance:', ordonnance)
  }

  const handleDownloadOrdonnance = (ordonnance) => {
    // Generate PDF
    console.log('Download ordonnance:', ordonnance)
    alert('Fonctionnalité PDF en développement')
  }

  const filteredOrdonnances = ordonnances.filter(ord =>
    ord.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ord.numero?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: ordonnances.length,
    thisMonth: ordonnances.filter(o => {
      const date = new Date(o.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length,
    today: ordonnances.filter(o => {
      const date = new Date(o.date)
      const now = new Date()
      return date.toDateString() === now.toDateString()
    }).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Chargement des ordonnances...</p>
        </div>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Ordonnances Médicales
            </h1>
            <p className="text-gray-600 mt-1">Gestion des prescriptions médicales</p>
          </div>

          <button
            onClick={handleOpenEditor}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Ordonnance
          </button>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Ce mois</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.thisMonth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Aujourd'hui</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.today}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par patient ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </motion.div>

      {/* Ordonnances List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des ordonnances ({filteredOrdonnances.length})
          </h3>
        </div>

        <OrdonnancesList
          ordonnances={filteredOrdonnances}
          onView={handleViewOrdonnance}
          onDownload={handleDownloadOrdonnance}
        />
      </motion.div>

      {/* Patient Selector Modal */}
      {showPatientSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Sélectionner un patient
              </h3>
              <button
                onClick={() => setShowPatientSelector(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {patients.map((patient) => (
                  <button
                    key={patient._id || patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <p className="font-semibold text-gray-800">{patient.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {patient.dateOfBirth && `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans`}
                      {patient.gender && ` • ${patient.gender}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Ordonnance Editor Modal */}
      {selectedPatient && (
        <OrdonnanceEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setSelectedPatient(null)
          }}
          patient={selectedPatient}
          onSave={handleSaveOrdonnance}
        />
      )}
    </div>
  )
}

export default Ordonnances
