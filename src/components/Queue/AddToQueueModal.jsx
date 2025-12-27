import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useApp } from '@/store/AppContext'
import Button from '@/components/UI/Button'

const AddToQueueModal = ({ isOpen, onClose }) => {
  const { patients, addVisit, currentUser } = useApp()
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      const visitData = {
        id: `visit-${Date.now()}`,
        patient_id: data.patient_id,
        medecin_id: currentUser.id,
        statut: 'attente',
        niveau_urgence: data.niveau_urgence,
        heure_arrivee: new Date().toISOString(),
        motif: data.motif,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      addVisit(visitData)
      handleClose()
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la file:', error)
    } finally {
      setLoading(false)
    }
  }

  const urgenceOptions = [
    { value: 'standard', label: 'Standard', color: 'text-gray-600' },
    { value: 'prioritaire', label: 'Prioritaire', color: 'text-orange-600' },
    { value: 'critique', label: 'Critique', color: 'text-red-600' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              
              {/* En-tête */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Ajouter à la file d'attente
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                
                {/* Sélection du patient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>
                  <select
                    {...register('patient_id', { required: 'Veuillez sélectionner un patient' })}
                    className="input-field"
                  >
                    <option value="">Choisir un patient...</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.prenom} {patient.nom} ({patient.age} ans)
                      </option>
                    ))}
                  </select>
                  {errors.patient_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.patient_id.message}
                    </p>
                  )}
                </div>

                {/* Niveau d'urgence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'urgence
                  </label>
                  <div className="space-y-2">
                    {urgenceOptions.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          value={option.value}
                          {...register('niveau_urgence')}
                          defaultChecked={option.value === 'standard'}
                          className="focus:ring-medical-500 h-4 w-4 text-medical-600 border-gray-300"
                        />
                        <span className={`ml-3 flex items-center space-x-2 ${option.color}`}>
                          {option.value === 'critique' && <AlertTriangle className="w-4 h-4" />}
                          <span>{option.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Motif de consultation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif de consultation
                  </label>
                  <input
                    type="text"
                    {...register('motif')}
                    placeholder="Ex: Consultation de routine, Urgence..."
                    className="input-field"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleClose}
                    variant="secondary"
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    icon={User}
                  >
                    Ajouter à la file
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AddToQueueModal