import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import BillingForm from '../Billing/BillingForm'

const FinishConsultationWizard = ({ 
  visit, 
  patient, 
  onComplete, 
  onCancel,
  isLoading = false 
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [consultationData, setConsultationData] = useState({
    remarques_medicales: '',
    invoice: null,
    nextAppointment: null
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      remarques_medicales: visit.remarques_medicales || ''
    }
  })

  const steps = [
    {
      id: 1,
      title: 'Notes médicales',
      description: 'Compléter les notes de la consultation',
      icon: '📝'
    },
    {
      id: 2,
      title: 'Facturation',
      description: 'Créer la facture de la consultation',
      icon: '💰'
    },
    {
      id: 3,
      title: 'Prochain RDV',
      description: 'Planifier un rendez-vous de suivi (optionnel)',
      icon: '📅'
    },
    {
      id: 4,
      title: 'Récapitulatif',
      description: 'Vérifier les informations avant validation',
      icon: '✅'
    }
  ]

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleMedicalNotesSubmit = (data) => {
    setConsultationData(prev => ({
      ...prev,
      remarques_medicales: data.remarques_medicales
    }))
    nextStep()
  }

  const handleBillingSubmit = (invoiceData) => {
    setConsultationData(prev => ({
      ...prev,
      invoice: invoiceData
    }))
    nextStep()
  }

  const handleSkipBilling = () => {
    setConsultationData(prev => ({
      ...prev,
      invoice: null
    }))
    nextStep()
  }

  const handleAppointmentSubmit = (appointmentData) => {
    setConsultationData(prev => ({
      ...prev,
      nextAppointment: appointmentData
    }))
    nextStep()
  }

  const handleSkipAppointment = () => {
    setConsultationData(prev => ({
      ...prev,
      nextAppointment: null
    }))
    nextStep()
  }

  const handleFinalSubmit = () => {
    onComplete(consultationData)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Notes de consultation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez vos observations médicales et recommandations pour le patient {patient.nom} {patient.prenom}
              </p>
            </div>

            <form onSubmit={handleSubmit(handleMedicalNotesSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarques médicales
                </label>
                <textarea
                  {...register('remarques_medicales')}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Observations, diagnostic, traitement prescrit, recommandations..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Continuer
                </button>
              </div>
            </form>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Facturation de la consultation
                </h3>
                <p className="text-sm text-gray-600">
                  Créez la facture pour cette consultation
                </p>
              </div>
              <button
                onClick={handleSkipBilling}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Passer cette étape
              </button>
            </div>

            <BillingForm
              visitId={visit.id}
              patientName={`${patient.nom} ${patient.prenom}`}
              onSubmit={handleBillingSubmit}
              onCancel={prevStep}
              isLoading={false}
            />
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Prochain rendez-vous
                </h3>
                <p className="text-sm text-gray-600">
                  Planifiez un rendez-vous de suivi si nécessaire
                </p>
              </div>
              <button
                onClick={handleSkipAppointment}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Passer cette étape
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-lg">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Fonctionnalité en développement
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700">
                    Le module de planification des rendez-vous sera disponible dans la prochaine mise à jour.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour
              </button>
              <button
                onClick={handleSkipAppointment}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continuer sans RDV
              </button>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Récapitulatif de la consultation
              </h3>
              <p className="text-sm text-gray-600">
                Vérifiez les informations avant de terminer la consultation
              </p>
            </div>

            <div className="space-y-4">
              {/* Informations patient */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Patient</h4>
                <p className="text-sm text-gray-600">
                  {patient.nom} {patient.prenom} - {patient.age} ans
                </p>
              </div>

              {/* Notes médicales */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Notes médicales</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {consultationData.remarques_medicales || 'Aucune note ajoutée'}
                </p>
              </div>

              {/* Facturation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Facturation</h4>
                {consultationData.invoice ? (
                  <div className="text-sm text-gray-600">
                    <p><strong>Acte:</strong> {consultationData.invoice.acte}</p>
                    <p><strong>Montant:</strong> {consultationData.invoice.montant_total?.toFixed(2)} €</p>
                    <p><strong>Paiement:</strong> {consultationData.invoice.moyen_paiement}</p>
                    <p><strong>Statut:</strong> {consultationData.invoice.statut_paiement}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune facture créée</p>
                )}
              </div>

              {/* Prochain RDV */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Prochain rendez-vous</h4>
                {consultationData.nextAppointment ? (
                  <p className="text-sm text-gray-600">
                    RDV programmé - Fonctionnalité en développement
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Aucun rendez-vous programmé</p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retour
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Finalisation...
                  </div>
                ) : (
                  'Terminer la consultation'
                )}
              </button>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête avec étapes */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Terminer la consultation
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

          {/* Indicateur d'étapes */}
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.icon}
                </div>
                <div className="ml-2 min-w-0 flex-1">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${
                    currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu de l'étape */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default FinishConsultationWizard