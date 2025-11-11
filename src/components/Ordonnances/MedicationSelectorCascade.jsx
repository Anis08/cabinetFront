import React, { useState, useEffect } from 'react'
import { Search, AlertCircle, Send, ChevronRight } from 'lucide-react'

const MedicationSelectorCascade = ({ onSelect, medicamentsDB }) => {
  const [searchMode, setSearchMode] = useState('database') // 'database' or 'manual'
  const [step, setStep] = useState(1) // 1: nom, 2: dosage, 3: forme, 4: molécule
  
  // Sélections en cascade
  const [selectedNom, setSelectedNom] = useState('')
  const [selectedDosage, setSelectedDosage] = useState('')
  const [selectedForme, setSelectedForme] = useState('')
  const [selectedMoleculeMere, setSelectedMoleculeMere] = useState('')
  
  // Options disponibles à chaque étape
  const [availableNames, setAvailableNames] = useState([])
  const [availableDosages, setAvailableDosages] = useState([])
  const [availableFormes, setAvailableFormes] = useState([])
  const [availableMolecules, setAvailableMolecules] = useState([])
  
  // Détails finaux du médicament sélectionné
  const [finalMedication, setFinalMedication] = useState(null)
  
  // Fréquences et durées prédéfinies
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

  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestData, setRequestData] = useState({
    nom: '',
    dosage: '',
    forme: 'Comprimé',
    fabricant: '',
    moleculeMere: '',
    type: '',
    frequence: '3 fois par jour',
    raison: ''
  })

  const formes = ['Comprimé', 'Gélule', 'Sirop', 'Suppositoire', 'Injectable', 'Crème', 'Pommade', 'Aérosol', 'Suspension buvable', 'Poudre pour suspension', 'Comprimé effervescent']
  const types = ['Antalgique', 'Antibiotique', 'Anti-inflammatoire', 'Antiagrégant', 'Anti-acide', 'Antihistaminique', 'Bronchodilatateur', 'Corticoïde', 'Antidiabétique', 'Antihypertenseur', 'Hypolipémiant', 'Hormone thyroïdienne', 'Anti-diarrhéique', 'Antispasmodique', 'Veinotonique']

  // Initialize available medication names
  useEffect(() => {
    if (searchMode === 'database' && medicamentsDB.length > 0) {
      const uniqueNames = [...new Set(medicamentsDB.map(med => med.nom))].sort()
      setAvailableNames(uniqueNames)
    }
  }, [medicamentsDB, searchMode])

  // Step 1: Select name → Load available dosages
  const handleSelectName = (nom) => {
    setSelectedNom(nom)
    setSelectedDosage('')
    setSelectedForme('')
    setSelectedMoleculeMere('')
    
    // Get all medications with this name
    const medsWithName = medicamentsDB.filter(med => med.nom === nom)
    
    // Get unique dosages
    const uniqueDosages = [...new Set(medsWithName.map(med => med.dosage))].sort()
    setAvailableDosages(uniqueDosages)
    
    setStep(2)
  }

  // Step 2: Select dosage → Load available forms
  const handleSelectDosage = (dosage) => {
    setSelectedDosage(dosage)
    setSelectedForme('')
    setSelectedMoleculeMere('')
    
    // Get medications with this name and dosage
    const medsWithDosage = medicamentsDB.filter(
      med => med.nom === selectedNom && med.dosage === dosage
    )
    
    // Get unique forms
    const uniqueFormes = [...new Set(medsWithDosage.map(med => med.forme))].sort()
    setAvailableFormes(uniqueFormes)
    
    setStep(3)
  }

  // Step 3: Select form → Load available molecules
  const handleSelectForme = (forme) => {
    setSelectedForme(forme)
    setSelectedMoleculeMere('')
    
    // Get medications with this name, dosage, and form
    const medsWithForme = medicamentsDB.filter(
      med => med.nom === selectedNom && 
             med.dosage === selectedDosage && 
             med.forme === forme
    )
    
    // Get unique molecules
    const uniqueMolecules = [...new Set(medsWithForme.map(med => med.moleculeMere))].sort()
    setAvailableMolecules(uniqueMolecules)
    
    // If only one molecule, auto-select it
    if (uniqueMolecules.length === 1) {
      handleSelectMolecule(uniqueMolecules[0])
    } else {
      setStep(4)
    }
  }

  // Step 4: Select molecule → Finalize selection
  const handleSelectMolecule = (molecule) => {
    setSelectedMoleculeMere(molecule)
    
    // Find the exact medication
    const exactMed = medicamentsDB.find(
      med => med.nom === selectedNom && 
             med.dosage === selectedDosage && 
             med.forme === selectedForme && 
             med.moleculeMere === molecule
    )
    
    if (exactMed) {
      setFinalMedication(exactMed)
      setStep(5)
    }
  }

  // Final: Add to prescription
  const handleAddToPrescription = (frequence, duree, momentPrise, instructions) => {
    if (!finalMedication) return
    
    onSelect({
      nom: finalMedication.nom,
      dosage: finalMedication.dosage,
      forme: finalMedication.forme,
      moleculeMere: finalMedication.moleculeMere,
      frequence: frequence || '3 fois par jour',
      duree: duree || '7 jours',
      momentPrise: momentPrise || 'Après les repas',
      instructions: instructions || '',
      fromDatabase: true
    })
    
    // Reset
    handleReset()
  }

  const handleReset = () => {
    setStep(1)
    setSelectedNom('')
    setSelectedDosage('')
    setSelectedForme('')
    setSelectedMoleculeMere('')
    setFinalMedication(null)
    setAvailableDosages([])
    setAvailableFormes([])
    setAvailableMolecules([])
  }

  // Manual entry
  const handleManualEntry = (nom) => {
    if (!nom) {
      alert('Veuillez entrer un nom de médicament')
      return
    }

    onSelect({
      nom: nom,
      dosage: '',
      forme: 'Comprimé',
      frequence: '3 fois par jour',
      duree: '7 jours',
      momentPrise: 'Après les repas',
      instructions: '',
      fromDatabase: false
    })
  }

  // Submit medication request
  const handleSubmitRequest = () => {
    if (!requestData.nom || !requestData.dosage || !requestData.forme) {
      alert('Veuillez remplir au moins le nom, le dosage et la forme')
      return
    }

    const existingRequests = JSON.parse(localStorage.getItem('medicationRequests') || '[]')
    
    const newRequest = {
      ...requestData,
      id: Date.now(),
      doctorName: localStorage.getItem('name')?.replace(/"/g, '') || 'Médecin',
      dateCreation: new Date().toISOString(),
      status: 'pending'
    }

    existingRequests.push(newRequest)
    localStorage.setItem('medicationRequests', JSON.stringify(existingRequests))

    alert('Demande d\'ajout de médicament envoyée avec succès!')
    setShowRequestModal(false)
    
    setRequestData({
      nom: '',
      dosage: '',
      forme: 'Comprimé',
      fabricant: '',
      moleculeMere: '',
      type: '',
      frequence: '3 fois par jour',
      raison: ''
    })
  }

  return (
    <div className="space-y-4">
      {/* Search Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setSearchMode('database')
            handleReset()
          }}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            searchMode === 'database'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rechercher dans la base
        </button>
        <button
          onClick={() => {
            setSearchMode('manual')
            handleReset()
          }}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            searchMode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Saisie manuelle (Autre)
        </button>
      </div>

      {/* Database Search Mode - Cascade Selection */}
      {searchMode === 'database' && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className={step >= 1 ? 'font-semibold text-blue-600' : ''}>
              1. Nom
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className={step >= 2 ? 'font-semibold text-blue-600' : ''}>
              2. Dosage
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className={step >= 3 ? 'font-semibold text-blue-600' : ''}>
              3. Forme
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className={step >= 4 ? 'font-semibold text-blue-600' : ''}>
              4. Molécule
            </span>
          </div>

          {/* Step 1: Select Name */}
          {step === 1 && (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-gray-800 mb-3">
                Étape 1: Sélectionner le nom du médicament
              </h4>
              <select
                value={selectedNom}
                onChange={(e) => handleSelectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Choisir un médicament --</option>
                {availableNames.map((nom, index) => (
                  <option key={index} value={nom}>{nom}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                {availableNames.length} médicaments disponibles
              </p>
            </div>
          )}

          {/* Step 2: Select Dosage */}
          {step === 2 && (
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">
                  Étape 2: Sélectionner le dosage
                </h4>
                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Changer le médicament
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Médicament: <span className="font-bold">{selectedNom}</span>
              </p>
              <select
                value={selectedDosage}
                onChange={(e) => handleSelectDosage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Choisir un dosage --</option>
                {availableDosages.map((dosage, index) => (
                  <option key={index} value={dosage}>{dosage}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                {availableDosages.length} dosage(s) disponible(s)
              </p>
            </div>
          )}

          {/* Step 3: Select Form */}
          {step === 3 && (
            <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">
                  Étape 3: Sélectionner la forme
                </h4>
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Changer le dosage
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                <span className="font-bold">{selectedNom}</span> - {selectedDosage}
              </p>
              <select
                value={selectedForme}
                onChange={(e) => handleSelectForme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">-- Choisir une forme --</option>
                {availableFormes.map((forme, index) => (
                  <option key={index} value={forme}>{forme}</option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                {availableFormes.length} forme(s) disponible(s)
              </p>
            </div>
          )}

          {/* Step 4: Select Molecule (if multiple) */}
          {step === 4 && availableMolecules.length > 1 && (
            <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">
                  Étape 4: Sélectionner la molécule mère
                </h4>
                <button
                  onClick={() => setStep(3)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Changer la forme
                </button>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                <span className="font-bold">{selectedNom}</span> - {selectedDosage} - {selectedForme}
              </p>
              <select
                value={selectedMoleculeMere}
                onChange={(e) => handleSelectMolecule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">-- Choisir une molécule mère --</option>
                {availableMolecules.map((molecule, index) => (
                  <option key={index} value={molecule}>{molecule}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 5: Final - Complete prescription details */}
          {step === 5 && finalMedication && (
            <FinalSelectionForm
              medication={finalMedication}
              frequences={frequences}
              durees={durees}
              onAdd={handleAddToPrescription}
              onBack={() => setStep(4)}
            />
          )}

          {/* Not Found Message */}
          {step === 1 && availableNames.length === 0 && (
            <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    Aucun médicament dans la base
                  </h4>
                  <p className="text-sm text-orange-800 mb-3">
                    La base de données est vide. Utilisez le mode manuel ou ajoutez des médicaments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Mode */}
      {searchMode === 'manual' && (
        <ManualEntryForm
          onSubmit={handleManualEntry}
          onRequestAdd={(nom) => {
            setRequestData({ ...requestData, nom })
            setShowRequestModal(true)
          }}
        />
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <RequestModal
          requestData={requestData}
          setRequestData={setRequestData}
          formes={formes}
          types={types}
          onSubmit={handleSubmitRequest}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </div>
  )
}

// Final Selection Form Component
const FinalSelectionForm = ({ medication, frequences, durees, onAdd, onBack }) => {
  const [frequence, setFrequence] = useState(medication.frequence || '3 fois par jour')
  const [duree, setDuree] = useState('7 jours')
  const [momentPrise, setMomentPrise] = useState('Après les repas')
  const [instructions, setInstructions] = useState('')

  const momentsPrise = ['Avant les repas', 'Après les repas', 'Pendant les repas', 'À jeun', 'Au coucher', 'Matin et soir']

  return (
    <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">
          ✅ Médicament sélectionné - Compléter les détails
        </h4>
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Modifier
        </button>
      </div>

      <div className="bg-white border border-green-300 rounded-lg p-3 mb-4">
        <h5 className="font-bold text-gray-900 text-lg">{medication.nom}</h5>
        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
          <div><span className="text-gray-600">Dosage:</span> <span className="font-semibold">{medication.dosage}</span></div>
          <div><span className="text-gray-600">Forme:</span> <span className="font-semibold">{medication.forme}</span></div>
          <div><span className="text-gray-600">Molécule:</span> <span className="font-semibold">{medication.moleculeMere}</span></div>
          <div><span className="text-gray-600">Fabricant:</span> <span className="font-semibold">{medication.fabricant}</span></div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fréquence *
          </label>
          <select
            value={frequence}
            onChange={(e) => setFrequence(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {frequences.map((freq, index) => (
              <option key={index} value={freq}>{freq}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durée du traitement *
          </label>
          <select
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {durees.map((d, index) => (
              <option key={index} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moment de prise
          </label>
          <select
            value={momentPrise}
            onChange={(e) => setMomentPrise(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {momentsPrise.map((moment, index) => (
              <option key={index} value={moment}>{moment}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions spéciales
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Instructions particulières..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          onClick={() => onAdd(frequence, duree, momentPrise, instructions)}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          ✅ Ajouter ce médicament à l'ordonnance
        </button>
      </div>
    </div>
  )
}

// Manual Entry Form Component
const ManualEntryForm = ({ onSubmit, onRequestAdd }) => {
  const [nom, setNom] = useState('')

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold text-gray-800 mb-3">Saisie manuelle du médicament</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du médicament *
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom du médicament"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => onSubmit(nom)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Utiliser ce médicament
        </button>
        <button
          onClick={() => {
            if (nom) {
              onRequestAdd(nom)
            } else {
              alert('Veuillez entrer un nom de médicament')
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          Demander l'ajout à la base
        </button>
      </div>
    </div>
  )
}

// Request Modal Component
const RequestModal = ({ requestData, setRequestData, formes, types, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-800">
            Demande d'ajout de médicament
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Cette demande sera envoyée à l'administrateur pour validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={requestData.nom}
                onChange={(e) => setRequestData({ ...requestData, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
              <input
                type="text"
                value={requestData.dosage}
                onChange={(e) => setRequestData({ ...requestData, dosage: e.target.value })}
                placeholder="Ex: 500mg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forme *</label>
              <select
                value={requestData.forme}
                onChange={(e) => setRequestData({ ...requestData, forme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {formes.map(forme => (
                  <option key={forme} value={forme}>{forme}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fabricant</label>
              <input
                type="text"
                value={requestData.fabricant}
                onChange={(e) => setRequestData({ ...requestData, fabricant: e.target.value })}
                placeholder="Ex: Sanofi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Molécule mère</label>
              <input
                type="text"
                value={requestData.moleculeMere}
                onChange={(e) => setRequestData({ ...requestData, moleculeMere: e.target.value })}
                placeholder="Ex: Paracétamol"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={requestData.type}
                onChange={(e) => setRequestData({ ...requestData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
              <textarea
                value={requestData.raison}
                onChange={(e) => setRequestData({ ...requestData, raison: e.target.value })}
                placeholder="Pourquoi ce médicament..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  )
}

export default MedicationSelectorCascade
