import React, { useState, useEffect } from 'react'
import { Search, AlertCircle, Send } from 'lucide-react'

const MedicationSelector = ({ onSelect, medicamentsDB }) => {
  const [searchMode, setSearchMode] = useState('database') // 'database' or 'manual'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMed, setSelectedMed] = useState(null)
  const [availableDosages, setAvailableDosages] = useState([])
  const [filteredMeds, setFilteredMeds] = useState([])
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

  // Search medications in database
  useEffect(() => {
    if (searchTerm.length >= 2 && searchMode === 'database') {
      const filtered = medicamentsDB.filter(med =>
        med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.moleculeMere.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMeds(filtered)
    } else {
      setFilteredMeds([])
    }
  }, [searchTerm, medicamentsDB, searchMode])

  // Get available dosages for selected medication
  const handleSelectMedication = (medName) => {
    const medVariations = medicamentsDB.filter(med => med.nom === medName)
    setAvailableDosages(medVariations)
    setSelectedMed(medName)
  }

  // Select medication with dosage
  const handleSelectDosage = (med) => {
    onSelect({
      nom: med.nom,
      dosage: med.dosage,
      forme: med.forme,
      frequence: med.frequence || '3 fois par jour',
      duree: '',
      momentPrise: 'Après les repas',
      instructions: '',
      fromDatabase: true
    })
    // Reset
    setSearchTerm('')
    setSelectedMed(null)
    setAvailableDosages([])
    setFilteredMeds([])
  }

  // Submit medication request
  const handleSubmitRequest = () => {
    if (!requestData.nom || !requestData.dosage || !requestData.forme) {
      alert('Veuillez remplir au moins le nom, le dosage et la forme')
      return
    }

    // Get existing requests
    const existingRequests = JSON.parse(localStorage.getItem('medicationRequests') || '[]')
    
    // Create new request
    const newRequest = {
      ...requestData,
      id: Date.now(),
      doctorName: localStorage.getItem('name')?.replace(/"/g, '') || 'Médecin',
      dateCreation: new Date().toISOString(),
      status: 'pending' // pending, approved, rejected
    }

    // Save request
    existingRequests.push(newRequest)
    localStorage.setItem('medicationRequests', JSON.stringify(existingRequests))

    alert('Demande d\'ajout de médicament envoyée avec succès!')
    setShowRequestModal(false)
    
    // Reset form
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

  // Manual entry - use current input as medication
  const handleManualEntry = () => {
    if (!searchTerm) {
      alert('Veuillez entrer un nom de médicament')
      return
    }

    onSelect({
      nom: searchTerm,
      dosage: '',
      forme: 'Comprimé',
      frequence: '3 fois par jour',
      duree: '',
      momentPrise: 'Après les repas',
      instructions: '',
      fromDatabase: false
    })

    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      {/* Search Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSearchMode('database')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            searchMode === 'database'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rechercher dans la base
        </button>
        <button
          onClick={() => setSearchMode('manual')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            searchMode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Saisie manuelle (Autre)
        </button>
      </div>

      {/* Database Search Mode */}
      {searchMode === 'database' && (
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un médicament par nom ou molécule..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Search Results */}
          {filteredMeds.length > 0 && !selectedMed && (
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {filteredMeds.map((med, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectMedication(med.nom)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-gray-900">{med.nom}</div>
                  <div className="text-sm text-gray-600">{med.moleculeMere}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {med.forme} - {med.fabricant}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Available Dosages */}
          {selectedMed && availableDosages.length > 0 && (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-semibold text-gray-800 mb-3">
                Choisir le dosage pour {selectedMed}
              </h4>
              <div className="space-y-2">
                {availableDosages.map((med, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectDosage(med)}
                    className="w-full text-left px-4 py-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{med.dosage}</div>
                        <div className="text-sm text-gray-600">{med.forme}</div>
                      </div>
                      <div className="text-xs text-gray-500">{med.fabricant}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setSelectedMed(null)
                  setAvailableDosages([])
                }}
                className="mt-3 text-sm text-gray-600 hover:text-gray-800"
              >
                ← Retour à la recherche
              </button>
            </div>
          )}

          {/* Not Found Message */}
          {searchTerm.length >= 2 && filteredMeds.length === 0 && !selectedMed && (
            <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    Médicament non trouvé dans la base
                  </h4>
                  <p className="text-sm text-orange-800 mb-3">
                    "{searchTerm}" n'est pas disponible dans la base de données.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleManualEntry}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      Utiliser quand même
                    </button>
                    <button
                      onClick={() => {
                        setRequestData({ ...requestData, nom: searchTerm })
                        setShowRequestModal(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Send className="w-4 h-4" />
                      Demander l'ajout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Mode */}
      {searchMode === 'manual' && (
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3">Saisie manuelle du médicament</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du médicament *
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom du médicament"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleManualEntry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Utiliser ce médicament
            </button>
            <button
              onClick={() => {
                if (searchTerm) {
                  setRequestData({ ...requestData, nom: searchTerm })
                  setShowRequestModal(true)
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
      )}

      {/* Request Modal */}
      {showRequestModal && (
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
                  Remplissez un maximum d'informations pour faciliter le traitement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du médicament *
                  </label>
                  <input
                    type="text"
                    value={requestData.nom}
                    onChange={(e) => setRequestData({ ...requestData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={requestData.dosage}
                    onChange={(e) => setRequestData({ ...requestData, dosage: e.target.value })}
                    placeholder="Ex: 500mg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forme *
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fabricant
                  </label>
                  <input
                    type="text"
                    value={requestData.fabricant}
                    onChange={(e) => setRequestData({ ...requestData, fabricant: e.target.value })}
                    placeholder="Ex: Sanofi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Molécule mère
                  </label>
                  <input
                    type="text"
                    value={requestData.moleculeMere}
                    onChange={(e) => setRequestData({ ...requestData, moleculeMere: e.target.value })}
                    placeholder="Ex: Paracétamol"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison de la demande (optionnel)
                  </label>
                  <textarea
                    value={requestData.raison}
                    onChange={(e) => setRequestData({ ...requestData, raison: e.target.value })}
                    placeholder="Pourquoi ce médicament doit être ajouté à la base..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitRequest}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicationSelector
