import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Save, Printer, FileText, Settings as SettingsIcon, Download } from 'lucide-react'
import PrescriptionTemplateSettings from './PrescriptionTemplateSettings'
import PrescriptionPreview from './PrescriptionPreview'
import MedicationSelector from './MedicationSelector'
import { exportPrescriptionToPDF, printPrescription } from '../../utils/pdfExport'

const OrdonnanceEditor = ({ isOpen, onClose, patient, onSave }) => {
  const [medicaments, setMedicaments] = useState([])
  const [observations, setObservations] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [medicamentsDB, setMedicamentsDB] = useState([])
  const [template, setTemplate] = useState({
    logo: '',
    doctorName: localStorage.getItem('name')?.replace(/"/g, '') || '',
    specialty: 'Médecin Généraliste',
    address: '',
    phone: '',
    email: '',
    clinicName: '',
    patientLayout: 'header',
    showPatientName: true,
    showPatientAge: true,
    showPatientGender: true,
    showPatientDateOfBirth: true,
    headerColor: '#1e40af',
    accentColor: '#3b82f6'
  })
  const [currentMed, setCurrentMed] = useState({
    nom: '',
    dosage: '',
    forme: 'Comprimé',
    frequence: '',
    duree: '',
    momentPrise: 'Après les repas',
    instructions: ''
  })

  // Load saved template and medications DB on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem('prescriptionTemplate')
    if (savedTemplate) {
      try {
        setTemplate(JSON.parse(savedTemplate))
      } catch (e) {
        console.error('Error loading template:', e)
      }
    }

    // Load medications database
    const savedMeds = localStorage.getItem('medicaments')
    if (savedMeds) {
      try {
        setMedicamentsDB(JSON.parse(savedMeds))
      } catch (e) {
        console.error('Error loading medications:', e)
      }
    }
  }, [])

  // Handle medication selection from cascade selector
  const handleMedicationSelect = (selectedMed) => {
    setCurrentMed({
      nom: selectedMed.nom,
      dosage: selectedMed.dosage,
      forme: selectedMed.forme,
      frequence: selectedMed.frequence || '3 fois par jour',
      duree: selectedMed.duree || '',
      momentPrise: selectedMed.momentPrise || 'Après les repas',
      instructions: selectedMed.instructions || ''
    })
  }

  const formes = ['Comprimé', 'Gélule', 'Sirop', 'Suppositoire', 'Injectable', 'Crème', 'Pommade']
  const momentsPrise = ['Avant les repas', 'Après les repas', 'Pendant les repas', 'À jeun', 'Au coucher', 'Matin et soir']
  const frequences = [
    '1 fois par jour',
    '2 fois par jour',
    '3 fois par jour',
    '4 fois par jour',
    'Toutes les 4 heures',
    'Toutes les 6 heures',
    'Toutes les 8 heures',
    'Toutes les 12 heures',
    'Matin',
    'Soir',
    'Matin et soir',
    'Midi',
    'Si besoin'
  ]
  const durees = [
    '1 jour',
    '2 jours',
    '3 jours',
    '5 jours',
    '7 jours',
    '10 jours',
    '14 jours',
    '21 jours',
    '1 mois',
    '2 mois',
    '3 mois',
    '6 mois',
    'Traitement continu'
  ]

  const handleAddMedicament = () => {
    if (!currentMed.nom || !currentMed.dosage || !currentMed.frequence || !currentMed.duree) {
      alert('Veuillez remplir tous les champs obligatoires du médicament')
      return
    }

    setMedicaments([...medicaments, { ...currentMed, id: Date.now() }])
    setCurrentMed({
      nom: '',
      dosage: '',
      forme: 'Comprimé',
      frequence: '',
      duree: '',
      momentPrise: 'Après les repas',
      instructions: ''
    })
  }

  const handleRemoveMedicament = (id) => {
    setMedicaments(medicaments.filter(m => m.id !== id))
  }

  const handleSave = () => {
    if (medicaments.length === 0) {
      alert('Veuillez ajouter au moins un médicament')
      return
    }

    const ordonnance = {
      patientId: patient._id || patient.id,
      patientName: patient.fullName,
      date: new Date().toISOString(),
      medicaments,
      observations,
      template // Save template configuration with prescription
    }

    onSave(ordonnance)
  }

  const handleSaveTemplate = (newTemplate) => {
    setTemplate(newTemplate)
    setShowSettings(false)
  }

  const handlePrint = () => {
    printPrescription()
  }

  const handleExportPDF = async () => {
    const prescriptionData = {
      patientId: patient._id || patient.id,
      patientName: patient.fullName,
      date: new Date().toISOString(),
      medicaments,
      observations,
      template
    }

    const result = await exportPrescriptionToPDF(prescriptionData)
    
    if (result.success) {
      alert(`PDF exporté avec succès: ${result.filename}`)
    } else {
      alert(`Erreur lors de l'export PDF: ${result.error}`)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Nouvelle Ordonnance
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showSettings 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Paramètres d'ordonnance"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Paramètres</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content - Split View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Form or Settings */}
            <div className="w-1/2 overflow-y-auto p-6 border-r border-gray-200">
              {showSettings ? (
                <PrescriptionTemplateSettings 
                  template={template}
                  onSave={handleSaveTemplate}
                  onClose={() => setShowSettings(false)}
                />
              ) : (
                <div>
              {/* Patient Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-2">Patient</h3>
                <p className="text-gray-700">{patient?.fullName}</p>
                <p className="text-sm text-gray-600">
                  {patient?.dateOfBirth && `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans`}
                  {patient?.gender && ` • ${patient.gender}`}
                </p>
              </div>

              {/* Medication Selector with Autocomplete */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  💊 Rechercher un médicament
                </h3>

                <MedicationSelector 
                  onSelect={handleMedicationSelect}
                  medicamentsDB={medicamentsDB}
                />
              </div>

              {/* Medicament Details Form */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Compléter les détails de prescription
                </h3>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du médicament *
                    </label>
                    <input
                      type="text"
                      value={currentMed.nom}
                      onChange={(e) => setCurrentMed({...currentMed, nom: e.target.value})}
                      placeholder="Ex: Doliprane"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={currentMed.dosage}
                        onChange={(e) => setCurrentMed({...currentMed, dosage: e.target.value})}
                        placeholder="Ex: 1000mg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Forme
                      </label>
                      <select
                        value={currentMed.forme}
                        onChange={(e) => setCurrentMed({...currentMed, forme: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {formes.map(forme => (
                          <option key={forme} value={forme}>{forme}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fréquence *
                      </label>
                      <select
                        value={currentMed.frequence}
                        onChange={(e) => setCurrentMed({...currentMed, frequence: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner une fréquence</option>
                        {frequences.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée du traitement *
                      </label>
                      <select
                        value={currentMed.duree}
                        onChange={(e) => setCurrentMed({...currentMed, duree: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Sélectionner une durée</option>
                        {durees.map(duree => (
                          <option key={duree} value={duree}>{duree}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moment de prise
                    </label>
                    <select
                      value={currentMed.momentPrise}
                      onChange={(e) => setCurrentMed({...currentMed, momentPrise: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {momentsPrise.map(moment => (
                        <option key={moment} value={moment}>{moment}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions spéciales
                    </label>
                    <textarea
                      value={currentMed.instructions}
                      onChange={(e) => setCurrentMed({...currentMed, instructions: e.target.value})}
                      placeholder="Ex: Ne pas écraser le comprimé"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleAddMedicament}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter ce médicament
                  </button>
                </div>
              </div>

              {/* Observations */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Observations</h3>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Observations, recommandations, consignes..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
                </div>
              )}
            </div>

            {/* Right: Preview */}
            <div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
              <PrescriptionPreview 
                template={template}
                patient={patient}
                medicaments={medicaments}
                observations={observations}
                onRemoveMed={showSettings ? null : handleRemoveMedicament}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                disabled={medicaments.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exporter en PDF"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handlePrint}
                disabled={medicaments.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Imprimer"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
              <button
                onClick={handleSave}
                disabled={medicaments.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default OrdonnanceEditor
