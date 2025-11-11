import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, Plus, Search, Filter, Edit, Trash2, X, Save } from 'lucide-react'

// Base de données initiale de médicaments
const initialMedicaments = [
  { id: 1, nom: 'Doliprane', dosage: '1000mg', forme: 'Comprimé', fabricant: 'Sanofi', moleculeMere: 'Paracétamol', type: 'Antalgique', dateAjout: '2024-01-15' },
  { id: 2, nom: 'Efferalgan', dosage: '500mg', forme: 'Comprimé effervescent', fabricant: 'UPSA', moleculeMere: 'Paracétamol', type: 'Antalgique', dateAjout: '2024-01-15' },
  { id: 3, nom: 'Amoxicilline', dosage: '500mg', forme: 'Gélule', fabricant: 'Mylan', moleculeMere: 'Amoxicilline', type: 'Antibiotique', dateAjout: '2024-01-16' },
  { id: 4, nom: 'Augmentin', dosage: '1g', forme: 'Comprimé', fabricant: 'GSK', moleculeMere: 'Amoxicilline/Acide clavulanique', type: 'Antibiotique', dateAjout: '2024-01-16' },
  { id: 5, nom: 'Azithromycine', dosage: '250mg', forme: 'Comprimé', fabricant: 'Pfizer', moleculeMere: 'Azithromycine', type: 'Antibiotique', dateAjout: '2024-01-17' },
  { id: 6, nom: 'Ibuprofen', dosage: '400mg', forme: 'Comprimé', fabricant: 'Advil', moleculeMere: 'Ibuprofène', type: 'Anti-inflammatoire', dateAjout: '2024-01-18' },
  { id: 7, nom: 'Voltarène', dosage: '50mg', forme: 'Comprimé', fabricant: 'Novartis', moleculeMere: 'Diclofénac', type: 'Anti-inflammatoire', dateAjout: '2024-01-18' },
  { id: 8, nom: 'Aspirine', dosage: '100mg', forme: 'Comprimé', fabricant: 'Bayer', moleculeMere: 'Acide acétylsalicylique', type: 'Antiagrégant', dateAjout: '2024-01-19' },
  { id: 9, nom: 'Clamoxyl', dosage: '1g', forme: 'Comprimé', fabricant: 'GSK', moleculeMere: 'Amoxicilline', type: 'Antibiotique', dateAjout: '2024-01-20' },
  { id: 10, nom: 'Flagyl', dosage: '500mg', forme: 'Comprimé', fabricant: 'Sanofi', moleculeMere: 'Métronidazole', type: 'Antibiotique', dateAjout: '2024-01-21' },
  { id: 11, nom: 'Ciprofloxacine', dosage: '500mg', forme: 'Comprimé', fabricant: 'Bayer', moleculeMere: 'Ciprofloxacine', type: 'Antibiotique', dateAjout: '2024-01-22' },
  { id: 12, nom: 'Oméprazole', dosage: '20mg', forme: 'Gélule', fabricant: 'AstraZeneca', moleculeMere: 'Oméprazole', type: 'Anti-acide', dateAjout: '2024-01-23' },
  { id: 13, nom: 'Gaviscon', dosage: '500mg', forme: 'Suspension buvable', fabricant: 'Reckitt', moleculeMere: 'Alginate de sodium', type: 'Anti-acide', dateAjout: '2024-01-24' },
  { id: 14, nom: 'Loratadine', dosage: '10mg', forme: 'Comprimé', fabricant: 'Schering-Plough', moleculeMere: 'Loratadine', type: 'Antihistaminique', dateAjout: '2024-01-25' },
  { id: 15, nom: 'Cétirizine', dosage: '10mg', forme: 'Comprimé', fabricant: 'UCB', moleculeMere: 'Cétirizine', type: 'Antihistaminique', dateAjout: '2024-01-26' },
  { id: 16, nom: 'Ventoline', dosage: '100µg', forme: 'Aérosol', fabricant: 'GSK', moleculeMere: 'Salbutamol', type: 'Bronchodilatateur', dateAjout: '2024-01-27' },
  { id: 17, nom: 'Prednisolone', dosage: '20mg', forme: 'Comprimé', fabricant: 'Mylan', moleculeMere: 'Prednisolone', type: 'Corticoïde', dateAjout: '2024-01-28' },
  { id: 18, nom: 'Metformine', dosage: '850mg', forme: 'Comprimé', fabricant: 'Merck', moleculeMere: 'Metformine', type: 'Antidiabétique', dateAjout: '2024-01-29' },
  { id: 19, nom: 'Amlodipine', dosage: '5mg', forme: 'Comprimé', fabricant: 'Pfizer', moleculeMere: 'Amlodipine', type: 'Antihypertenseur', dateAjout: '2024-01-30' },
  { id: 20, nom: 'Atorvastatine', dosage: '20mg', forme: 'Comprimé', fabricant: 'Pfizer', moleculeMere: 'Atorvastatine', type: 'Hypolipémiant', dateAjout: '2024-01-31' },
  { id: 21, nom: 'Levothyroxine', dosage: '100µg', forme: 'Comprimé', fabricant: 'Merck', moleculeMere: 'Lévothyroxine', type: 'Hormone thyroïdienne', dateAjout: '2024-02-01' },
  { id: 22, nom: 'Paracétamol Sirop', dosage: '120mg/5ml', forme: 'Sirop', fabricant: 'Sanofi', moleculeMere: 'Paracétamol', type: 'Antalgique', dateAjout: '2024-02-02' },
  { id: 23, nom: 'Smecta', dosage: '3g', forme: 'Poudre pour suspension', fabricant: 'Ipsen', moleculeMere: 'Diosmectite', type: 'Anti-diarrhéique', dateAjout: '2024-02-03' },
  { id: 24, nom: 'Spasfon', dosage: '80mg', forme: 'Comprimé', fabricant: 'Teva', moleculeMere: 'Phloroglucinol', type: 'Antispasmodique', dateAjout: '2024-02-04' },
  { id: 25, nom: 'Daflon', dosage: '500mg', forme: 'Comprimé', fabricant: 'Servier', moleculeMere: 'Diosmine', type: 'Veinotonique', dateAjout: '2024-02-05' }
]

const Medicaments = () => {
  const [medicaments, setMedicaments] = useState([])
  const [filteredMedicaments, setFilteredMedicaments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  
  const [filters, setFilters] = useState({
    type: '',
    dosage: '',
    moleculeMere: '',
    dateDebut: '',
    dateFin: ''
  })

  const [formData, setFormData] = useState({
    nom: '',
    dosage: '',
    forme: 'Comprimé',
    fabricant: '',
    moleculeMere: '',
    type: '',
    frequence: '3 fois par jour'
  })

  const formes = ['Comprimé', 'Gélule', 'Sirop', 'Suppositoire', 'Injectable', 'Crème', 'Pommade', 'Aérosol', 'Suspension buvable', 'Poudre pour suspension', 'Comprimé effervescent']
  const types = ['Antalgique', 'Antibiotique', 'Anti-inflammatoire', 'Antiagrégant', 'Anti-acide', 'Antihistaminique', 'Bronchodilatateur', 'Corticoïde', 'Antidiabétique', 'Antihypertenseur', 'Hypolipémiant', 'Hormone thyroïdienne', 'Anti-diarrhéique', 'Antispasmodique', 'Veinotonique']

  // Initialize medications from localStorage or use initial data
  useEffect(() => {
    const savedMeds = localStorage.getItem('medicaments')
    if (savedMeds) {
      const parsed = JSON.parse(savedMeds)
      setMedicaments(parsed)
      setFilteredMedicaments(parsed)
    } else {
      setMedicaments(initialMedicaments)
      setFilteredMedicaments(initialMedicaments)
      localStorage.setItem('medicaments', JSON.stringify(initialMedicaments))
    }
  }, [])

  // Filter and search
  useEffect(() => {
    let result = medicaments

    // Search
    if (searchTerm) {
      result = result.filter(med => 
        med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.moleculeMere.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.fabricant.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filters
    if (filters.type) {
      result = result.filter(med => med.type === filters.type)
    }
    if (filters.dosage) {
      result = result.filter(med => med.dosage.toLowerCase().includes(filters.dosage.toLowerCase()))
    }
    if (filters.moleculeMere) {
      result = result.filter(med => med.moleculeMere.toLowerCase().includes(filters.moleculeMere.toLowerCase()))
    }
    if (filters.dateDebut) {
      result = result.filter(med => new Date(med.dateAjout) >= new Date(filters.dateDebut))
    }
    if (filters.dateFin) {
      result = result.filter(med => new Date(med.dateAjout) <= new Date(filters.dateFin))
    }

    setFilteredMedicaments(result)
  }, [searchTerm, filters, medicaments])

  const handleSaveMedicament = () => {
    if (!formData.nom || !formData.dosage || !formData.fabricant || !formData.moleculeMere || !formData.type) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    let updatedMeds
    if (editingMed) {
      // Update existing
      updatedMeds = medicaments.map(med => 
        med.id === editingMed.id 
          ? { ...formData, id: editingMed.id, dateAjout: editingMed.dateAjout }
          : med
      )
    } else {
      // Add new
      const newMed = {
        ...formData,
        id: Date.now(),
        dateAjout: new Date().toISOString().split('T')[0]
      }
      updatedMeds = [newMed, ...medicaments]
    }

    setMedicaments(updatedMeds)
    localStorage.setItem('medicaments', JSON.stringify(updatedMeds))
    handleCloseModal()
    alert(editingMed ? 'Médicament modifié avec succès!' : 'Médicament ajouté avec succès!')
  }

  const handleEdit = (med) => {
    setEditingMed(med)
    setFormData({
      nom: med.nom,
      dosage: med.dosage,
      forme: med.forme,
      fabricant: med.fabricant,
      moleculeMere: med.moleculeMere,
      type: med.type,
      frequence: med.frequence || '3 fois par jour'
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médicament?')) {
      const updatedMeds = medicaments.filter(med => med.id !== id)
      setMedicaments(updatedMeds)
      localStorage.setItem('medicaments', JSON.stringify(updatedMeds))
      alert('Médicament supprimé avec succès!')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMed(null)
    setFormData({
      nom: '',
      dosage: '',
      forme: 'Comprimé',
      fabricant: '',
      moleculeMere: '',
      type: '',
      frequence: '3 fois par jour'
    })
  }

  const handleResetFilters = () => {
    setFilters({
      type: '',
      dosage: '',
      moleculeMere: '',
      dateDebut: '',
      dateFin: ''
    })
    setSearchTerm('')
  }

  const stats = {
    total: medicaments.length,
    types: [...new Set(medicaments.map(m => m.type))].length,
    fabricants: [...new Set(medicaments.map(m => m.fabricant))].length
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
              <Pill className="h-6 w-6 text-green-600" />
              Base de Données Médicaments
            </h1>
            <p className="text-gray-600 mt-1">Gestion complète de votre pharmacopée</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un médicament
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Pill className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Médicaments</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Types</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.types}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Pill className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Fabricants</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.fabricants}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, molécule mère ou fabricant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Tous les types</option>
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={filters.dosage}
                      onChange={(e) => setFilters({...filters, dosage: e.target.value})}
                      placeholder="Ex: 500mg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Molécule mère</label>
                    <input
                      type="text"
                      value={filters.moleculeMere}
                      onChange={(e) => setFilters({...filters, moleculeMere: e.target.value})}
                      placeholder="Ex: Paracétamol"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                    <input
                      type="date"
                      value={filters.dateDebut}
                      onChange={(e) => setFilters({...filters, dateDebut: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                    <input
                      type="date"
                      value={filters.dateFin}
                      onChange={(e) => setFilters({...filters, dateFin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Medications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Liste des médicaments ({filteredMedicaments.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Molécule mère</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date ajout</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicaments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Aucun médicament trouvé
                  </td>
                </tr>
              ) : (
                filteredMedicaments.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{med.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{med.dosage}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{med.forme}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{med.moleculeMere}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {med.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{med.fabricant}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(med.dateAjout).toLocaleDateString('fr-FR')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(med)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingMed ? 'Modifier le médicament' : 'Ajouter un médicament'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du médicament *
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      placeholder="Ex: Doliprane"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      placeholder="Ex: 1000mg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forme *
                    </label>
                    <select
                      value={formData.forme}
                      onChange={(e) => setFormData({...formData, forme: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {formes.map(forme => (
                        <option key={forme} value={forme}>{forme}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fabricant *
                    </label>
                    <input
                      type="text"
                      value={formData.fabricant}
                      onChange={(e) => setFormData({...formData, fabricant: e.target.value})}
                      placeholder="Ex: Sanofi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Molécule mère *
                    </label>
                    <input
                      type="text"
                      value={formData.moleculeMere}
                      onChange={(e) => setFormData({...formData, moleculeMere: e.target.value})}
                      placeholder="Ex: Paracétamol"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Sélectionner un type</option>
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fréquence recommandée
                    </label>
                    <input
                      type="text"
                      value={formData.frequence}
                      onChange={(e) => setFormData({...formData, frequence: e.target.value})}
                      placeholder="Ex: 3 fois par jour"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveMedicament}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingMed ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Medicaments
