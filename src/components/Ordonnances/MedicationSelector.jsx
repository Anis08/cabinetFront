import React, { useState, useEffect, useRef } from 'react'
import { Search, AlertCircle, Send, ChevronRight, Loader } from 'lucide-react'
import { baseURL } from '../../config'

const MedicationSelector = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [medicaments, setMedicaments] = useState([])
  const [filteredMeds, setFilteredMeds] = useState([])
  const [expandedMed, setExpandedMed] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
  
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)

  const formes = ['Comprimé', 'Gélule', 'Sirop', 'Suppositoire', 'Injectable', 'Crème', 'Pommade', 'Aérosol', 'Suspension buvable', 'Poudre pour suspension', 'Comprimé effervescent']
  const types = ['Antalgique', 'Antibiotique', 'Anti-inflammatoire', 'Antiagrégant', 'Anti-acide', 'Antihistaminique', 'Bronchodilatateur', 'Corticoïde', 'Antidiabétique', 'Antihypertenseur', 'Hypolipémiant', 'Hormone thyroïdienne', 'Anti-diarrhéique', 'Antispasmodique', 'Veinotonique']

  // Fetch all medications from API on component mount
  useEffect(() => {
    const fetchMedicaments = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        
        const response = await fetch(`${baseURL}/medecin/medicaments/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des médicaments')
        }

        const data = await response.json()
        setMedicaments(data.medicaments || [])
        setError(null)
      } catch (err) {
        console.error('Erreur chargement médicaments:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMedicaments()
  }, [])

  // Search medications in database
  useEffect(() => {
    if (searchTerm.length >= 2 && medicaments.length > 0) {
      const filtered = medicaments.filter(med =>
        med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.moleculeMereRel.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      setFilteredMeds(filtered)
      setShowDropdown(true)
    } else {
      setFilteredMeds([])
      setShowDropdown(false)
      setExpandedMed(null)
    }
  }, [searchTerm, medicaments])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
        setExpandedMed(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Select medication with dosage
  const handleSelectDosage = (medicament, dosage) => {
    onSelect({
      id: medicament.id,
      nom: medicament.nom,
      dosage: dosage.valeur,
      forme: 'Comprimé', // Default, can be customized later
      moleculeMere: medicament.moleculeMereRel.nom,
      type: medicament.type,
      frequence: '3 fois par jour',
      duree: '',
      momentPrise: 'Après les repas',
      instructions: '',
      fromDatabase: true
    })
    // Reset
    setSearchTerm('')
    setFilteredMeds([])
    setShowDropdown(false)
    setExpandedMed(null)
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
    setShowDropdown(false)
  }

  return (
    <div className="space-y-4">
      {/* Search Input with Dropdown */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchTerm.length >= 2) setShowDropdown(true)
            }}
            placeholder="Rechercher un médicament par nom ou molécule..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Chargement des médicaments...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-red-200 rounded-lg shadow-xl p-4">
            <div className="flex items-start gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-semibold">Erreur de chargement</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dropdown Results */}
        {showDropdown && searchTerm.length >= 2 && !loading && !error && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto"
          >
            {filteredMeds.length > 0 ? (
              <div>
                {filteredMeds.map((medicament) => {
                  const isExpanded = expandedMed === medicament.id
                  
                  return (
                    <div key={medicament.id} className="border-b border-gray-100 last:border-b-0">
                      {/* Medication Header */}
                      <button
                        onClick={() => setExpandedMed(isExpanded ? null : medicament.id)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                            {medicament.nom}
                          </div>
                          <div className="text-sm text-gray-600">
                            {medicament.moleculeMereRel.nom} • {medicament.type}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {medicament.dosages.length} dosage{medicament.dosages.length > 1 ? 's' : ''} disponible{medicament.dosages.length > 1 ? 's' : ''}
                          </div>
                        </div>
                        <ChevronRight 
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {/* Dosage Options - Expanded */}
                      {isExpanded && (
                        <div className="bg-blue-50 border-t border-blue-100">
                          {medicament.dosages.map((dosage) => (
                            <button
                              key={dosage.id}
                              onClick={() => handleSelectDosage(medicament, dosage)}
                              className="w-full text-left px-6 py-3 hover:bg-blue-100 border-b border-blue-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-blue-900">
                                    {dosage.valeur}
                                  </div>
                                  <div className="text-sm text-blue-700">
                                    {medicament.type}
                                  </div>
                                </div>
                                <div className="text-xs text-blue-600 font-medium">
                                  {medicament.moleculeMereRel.nom}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Not Found Options */
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">
                      Médicament non trouvé
                    </h4>
                    <p className="text-sm text-orange-800">
                      "{searchTerm}" n'est pas dans la base de données.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleManualEntry}
                    className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Utiliser quand même
                  </button>
                  <button
                    onClick={() => {
                      setRequestData({ ...requestData, nom: searchTerm })
                      setShowRequestModal(true)
                      setShowDropdown(false)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Demander l'ajout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {!loading && !error && (
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Tapez au moins 2 caractères pour rechercher parmi {medicaments.length} médicament{medicaments.length > 1 ? 's' : ''}
        </p>
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
