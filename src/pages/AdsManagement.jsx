import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image,
  Video,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  Clock,
  Upload,
  X,
  Monitor,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react'
import { baseURL } from '../config'
import { useAuth } from '../store/AuthProvider'

const AdsManagement = () => {
  const { logout, refresh } = useAuth()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAd, setEditingAd] = useState(null)
  const [urlCopied, setUrlCopied] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'image', // 'image' or 'video'
    fileUrl: '',
    dateFrom: '',
    dateTo: '',
    duration: 5, // seconds
    position: 'top', // 'top' or 'bottom'
    active: true
  })

  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  // Waiting line URL
  const waitingLineUrl = window.location.origin + '/waiting-line'

  useEffect(() => {
    loadAds()
  }, [])

  const loadAds = async () => {
    setLoading(true)
    try {
      let response = await fetch(`${baseURL}/medecin/ads`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 403) {
          logout()
          return
        }
        if (response.status === 401) {
          const refreshResponse = await refresh()
          if (!refreshResponse) {
            logout()
            return
          }
          response = await fetch(`${baseURL}/medecin/ads`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          })
        }
      }

      if (response.ok) {
        const data = await response.json()
        setAds(data.ads || [])
      }
    } catch (error) {
      console.error('Error loading ads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    setUploading(true)
    setUploadProgress(0)

    try {
      const response = await fetch(`${baseURL}/medecin/ads/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, fileUrl: data.url })
        setUploadProgress(100)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Erreur lors du téléchargement du fichier')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const url = editingAd
      ? `${baseURL}/medecin/ads/${editingAd.id}`
      : `${baseURL}/medecin/ads`

    const method = editingAd ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      })

      if (response.ok) {
        loadAds()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving ad:', error)
      alert('Erreur lors de la sauvegarde de la publicité')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) return

    try {
      const response = await fetch(`${baseURL}/medecin/ads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })

      if (response.ok) {
        loadAds()
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      alert('Erreur lors de la suppression de la publicité')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'image',
      fileUrl: '',
      dateFrom: '',
      dateTo: '',
      duration: 5,
      position: 'top',
      active: true
    })
    setEditingAd(null)
  }

  const openEditModal = (ad) => {
    setEditingAd(ad)
    setFormData({
      title: ad.title,
      type: ad.type,
      fileUrl: ad.fileUrl,
      dateFrom: ad.dateFrom?.split('T')[0] || '',
      dateTo: ad.dateTo?.split('T')[0] || '',
      duration: ad.duration,
      position: ad.position,
      active: ad.active
    })
    setShowModal(true)
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(waitingLineUrl)
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const isAdActive = (ad) => {
    const now = new Date()
    const from = new Date(ad.dateFrom)
    const to = new Date(ad.dateTo)
    return ad.active && now >= from && now <= to
  }

  return (
    <div className="space-y-6">
      {/* Header with Waiting Line URL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Monitor className="h-6 w-6 mr-2 text-blue-600" />
                Gestion des Publicités
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez les publicités affichées sur l'écran de la file d'attente
              </p>
            </div>
          </div>

          {/* Waiting Line URL */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  URL de la File d'Attente
                </p>
                <code className="text-sm text-blue-600 font-mono bg-white px-3 py-2 rounded border border-blue-200 block">
                  {waitingLineUrl}
                </code>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={copyUrl}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  {urlCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Copié!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
                <a
                  href="/waiting-line"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ouvrir</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add New Ad Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter une Publicité</span>
        </button>
      </motion.div>

      {/* Ads List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune publicité
            </h3>
            <p className="text-gray-600">
              Commencez par ajouter votre première publicité
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad, index) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Preview */}
                <div className="relative h-48 bg-gray-100">
                  {ad.type === 'image' ? (
                    <img
                      src={ad.fileUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={ad.fileUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isAdActive(ad)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {isAdActive(ad) ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium uppercase">
                      {ad.type}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 bg-purple-500 text-white rounded text-xs font-medium">
                      {ad.position === 'top' ? 'Haut' : 'Bas'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                    {ad.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(ad.dateFrom).toLocaleDateString('fr-FR')} - {new Date(ad.dateTo).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{ad.duration}s par rotation</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => openEditModal(ad)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAd ? 'Modifier la Publicité' : 'Nouvelle Publicité'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="image"
                          checked={formData.type === 'image'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="text-blue-500"
                        />
                        <Image className="h-5 w-5" />
                        <span>Image</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="video"
                          checked={formData.type === 'video'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="text-blue-500"
                        />
                        <Video className="h-5 w-5" />
                        <span>Vidéo</span>
                      </label>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fichier
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                        <Upload className="h-5 w-5" />
                        <span>Télécharger un fichier</span>
                        <input
                          type="file"
                          accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {formData.fileUrl && (
                      <p className="mt-2 text-sm text-green-600">✓ Fichier téléchargé</p>
                    )}
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={formData.dateFrom}
                        onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={formData.dateTo}
                        onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée d'affichage (secondes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="top">Haut</option>
                      <option value="bottom">Bas</option>
                    </select>
                  </div>

                  {/* Active */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 text-blue-500 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Publicité active
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {editingAd ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdsManagement
