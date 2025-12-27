import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileText, AlertCircle } from 'lucide-react';
import { 
  createComplementaryExam, 
  updateComplementaryExam, 
  validateExamData,
  transformExamToBackend,
  EXAM_TYPES 
} from '../../utils/complementaryExamsService';

/**
 * ExamModal Component
 * Modal for creating or editing complementary exams
 */
const ExamModal = ({ isOpen, onClose, patientId, exam, onSuccess }) => {
  const [formData, setFormData] = useState({
    typeExamen: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomType, setIsCustomType] = useState(false);

  const isEditMode = !!exam;

  /**
   * Initialize form data when exam prop changes
   */
  useEffect(() => {
    if (exam) {
      setFormData({
        typeExamen: exam.typeExamen || exam.type || '',
        date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : '',
        description: exam.description || exam.resultats || ''
      });
      
      // Check if exam type is custom
      const examType = exam.typeExamen || exam.type;
      if (examType && !EXAM_TYPES.includes(examType)) {
        setIsCustomType(true);
      }
    } else {
      // Reset form for new exam
      setFormData({
        typeExamen: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setIsCustomType(false);
    }
    setErrors([]);
  }, [exam, isOpen]);

  /**
   * Handle form field changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  /**
   * Handle exam type selection
   */
  const handleExamTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomType(true);
      setFormData(prev => ({ ...prev, typeExamen: '' }));
    } else {
      setIsCustomType(false);
      setFormData(prev => ({ ...prev, typeExamen: value }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateExamData(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Prepare data for API matching Prisma schema
      const examData = {
        patientId: parseInt(patientId),
        type: formData.typeExamen,
        description: formData.description,
        date: new Date(formData.date).toISOString()
      };

      // Validate patientId
      if (!examData.patientId || isNaN(examData.patientId)) {
        setErrors(['ID patient invalide']);
        setIsSubmitting(false);
        return;
      }

      if (isEditMode) {
        // For update, don't send patientId (it's immutable)
        const updateData = {
          type: examData.type,
          description: examData.description,
          date: examData.date
        };
        await updateComplementaryExam(exam.id, updateData);
      } else {
        await createComplementaryExam(examData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving exam:', error);
      setErrors([error.message || 'Erreur lors de l\'enregistrement de l\'examen']);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black bg-opacity-50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier l\'examen' : 'Nouvel examen complémentaire'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900 mb-1">
                        Erreur{errors.length > 1 ? 's' : ''}
                      </h3>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Exam Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type d'examen <span className="text-red-500">*</span>
                </label>
                {!isCustomType ? (
                  <select
                    name="typeExamen"
                    value={formData.typeExamen}
                    onChange={handleExamTypeChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez un type</option>
                    {EXAM_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                    <option value="custom">✏️ Autre (saisir manuellement)</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="typeExamen"
                      value={formData.typeExamen}
                      onChange={handleChange}
                      placeholder="Entrez le type d'examen"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomType(false);
                        setFormData(prev => ({ ...prev, typeExamen: '' }));
                      }}
                      className="text-sm text-medical-600 hover:text-medical-700"
                    >
                      ← Revenir à la sélection
                    </button>
                  </div>
                )}
              </div>

              {/* Date Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de l'examen <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description / Résultats <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                  placeholder="Saisissez la description et les résultats de l'examen..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Info Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Vous pourrez ajouter des fichiers (images, PDF, documents) après avoir créé l'examen.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Modifier' : 'Créer'} l'examen</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExamModal;
