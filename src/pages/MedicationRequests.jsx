import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Inbox, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, Calendar, User } from 'lucide-react'

const MedicationRequests = () => {
  const [requests, setRequests] = useState([])
  const [activeTab, setActiveTab] = useState('pending') // pending, approved, rejected, history
  const [editingRequest, setEditingRequest] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const formes = ['Comprimé', 'Gélule', 'Sirop', 'Suppositoire', 'Injectable', 'Crème', 'Pommade', 'Aérosol', 'Suspension buvable', 'Poudre pour suspension', 'Comprimé effervescent']
  const types = ['Antalgique', 'Antibiotique', 'Anti-inflammatoire', 'Antiagrégant', 'Anti-acide', 'Antihistaminique', 'Bronchodilatateur', 'Corticoïde', 'Antidiabétique', 'Antihypertenseur', 'Hypolipémiant', 'Hormone thyroïdienne', 'Anti-diarrhéique', 'Antispasmodique', 'Veinotonique']

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = () => {
    const savedRequests = localStorage.getItem('medicationRequests')
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests))
    }
  }

  const handleApprove = (request) => {
    // Add to medications database
    const medicaments = JSON.parse(localStorage.getItem('medicaments') || '[]')
    const newMed = {
      id: Date.now(),
      nom: request.nom,
      dosage: request.dosage,
      forme: request.forme,
      fabricant: request.fabricant || 'Non spécifié',
      moleculeMere: request.moleculeMere || 'Non spécifié',
      type: request.type || 'Autre',
      frequence: request.frequence || '3 fois par jour',
      dateAjout: new Date().toISOString().split('T')[0]
    }
    medicaments.push(newMed)
    localStorage.setItem('medicaments', JSON.stringify(medicaments))

    // Update request status
    const updatedRequests = requests.map(req =>
      req.id === request.id
        ? { ...req, status: 'approved', dateTraitement: new Date().toISOString() }
        : req
    )
    setRequests(updatedRequests)
    localStorage.setItem('medicationRequests', JSON.stringify(updatedRequests))

    alert('Médicament approuvé et ajouté à la base de données!')
  }

  const handleReject = (id) => {
    if (confirm('Êtes-vous sûr de vouloir rejeter cette demande?')) {
      const updatedRequests = requests.map(req =>
        req.id === id
          ? { ...req, status: 'rejected', dateTraitement: new Date().toISOString() }
          : req
      )
      setRequests(updatedRequests)
      localStorage.setItem('medicationRequests', JSON.stringify(updatedRequests))
      alert('Demande rejetée')
    }
  }

  const handleEdit = (request) => {
    setEditingRequest({ ...request })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    const updatedRequests = requests.map(req =>
      req.id === editingRequest.id ? editingRequest : req
    )
    setRequests(updatedRequests)
    localStorage.setItem('medicationRequests', JSON.stringify(updatedRequests))
    setShowEditModal(false)
    setEditingRequest(null)
    alert('Demande modifiée avec succès!')
  }

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette demande définitivement?')) {
      const updatedRequests = requests.filter(req => req.id !== id)
      setRequests(updatedRequests)
      localStorage.setItem('medicationRequests', JSON.stringify(updatedRequests))
      alert('Demande supprimée')
    }
  }

  const handleApproveWithModification = () => {
    // Add modified medication to database
    const medicaments = JSON.parse(localStorage.getItem('medicaments') || '[]')
    const newMed = {
      id: Date.now(),
      nom: editingRequest.nom,
      dosage: editingRequest.dosage,
      forme: editingRequest.forme,
      fabricant: editingRequest.fabricant || 'Non spécifié',
      moleculeMere: editingRequest.moleculeMere || 'Non spécifié',
      type: editingRequest.type || 'Autre',
      frequence: editingRequest.frequence || '3 fois par jour',
      dateAjout: new Date().toISOString().split('T')[0]
    }
    medicaments.push(newMed)
    localStorage.setItem('medicaments', JSON.stringify(medicaments))

    // Update request status
    const updatedRequests = requests.map(req =>
      req.id === editingRequest.id
        ? { ...editingRequest, status: 'approved', dateTraitement: new Date().toISOString() }
        : req
    )
    setRequests(updatedRequests)
    localStorage.setItem('medicationRequests', JSON.stringify(updatedRequests))

    setShowEditModal(false)
    setEditingRequest(null)
    alert('Médicament modifié, approuvé et ajouté à la base!')
  }

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'history') return true
    return req.status === activeTab
  })

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length
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
              <Inbox className="h-6 w-6 text-purple-600" />
              Demandes de Médicaments
            </h1>
            <p className="text-gray-600 mt-1">Gestion des demandes d'ajout de médicaments</p>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Approuvées</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rejetées</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Inbox className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-1"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-orange-100 text-orange-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'approved'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approuvées ({stats.approved})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'rejected'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rejetées ({stats.rejected})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Historique complet
          </button>
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredRequests.length} demande(s)
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredRequests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>Aucune demande dans cette catégorie</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{request.nom}</h4>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {request.status === 'pending'
                          ? 'En attente'
                          : request.status === 'approved'
                          ? 'Approuvée'
                          : 'Rejetée'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">Dosage:</span>
                        <span className="ml-1 font-medium text-gray-900">{request.dosage}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Forme:</span>
                        <span className="ml-1 font-medium text-gray-900">{request.forme}</span>
                      </div>
                      {request.fabricant && (
                        <div>
                          <span className="text-gray-500">Fabricant:</span>
                          <span className="ml-1 font-medium text-gray-900">{request.fabricant}</span>
                        </div>
                      )}
                      {request.moleculeMere && (
                        <div>
                          <span className="text-gray-500">Molécule:</span>
                          <span className="ml-1 font-medium text-gray-900">{request.moleculeMere}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{request.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Demandé le {new Date(request.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {request.dateTraitement && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>
                            Traité le {new Date(request.dateTraitement).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {request.raison && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Raison:</span> {request.raison}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleEdit(request)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier et approuver"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprove(request)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approuver"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Rejeter"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Edit Modal */}
      {showEditModal && editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-800">
                Modifier et Approuver la Demande
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du médicament *
                  </label>
                  <input
                    type="text"
                    value={editingRequest.nom}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={editingRequest.dosage}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, dosage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forme *
                  </label>
                  <select
                    value={editingRequest.forme}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, forme: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {formes.map((forme) => (
                      <option key={forme} value={forme}>
                        {forme}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fabricant
                  </label>
                  <input
                    type="text"
                    value={editingRequest.fabricant}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, fabricant: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Molécule mère
                  </label>
                  <input
                    type="text"
                    value={editingRequest.moleculeMere}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, moleculeMere: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editingRequest.type}
                    onChange={(e) =>
                      setEditingRequest({ ...editingRequest, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    {types.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingRequest(null)
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Modifier seulement
                </button>
                <button
                  onClick={handleApproveWithModification}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Modifier et Approuver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicationRequests
