/**
 * ExamsList Component
 * 
 * Displays and manages complementary exams (examens complémentaires) for a patient
 * Includes CRUD operations and file management
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPatientExams,
  createExam,
  updateExam,
  deleteExam,
  uploadExamFile,
  deleteExamFile,
  downloadExamFile,
  validateFile,
  formatFileSize,
  getFileIcon
} from '../../services/examsAPI';

const ExamsList = ({ patientId }) => {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    nom: '',
    description: '',
    dateExamen: new Date().toISOString().split('T')[0],
    prescripteur: '',
    resultat: '',
    notes: '',
    statut: 'En attente'
  });

  // Exam types
  const examTypes = [
    'Radiographie',
    'Échographie',
    'IRM',
    'Scanner',
    'Analyse sanguine',
    'Analyse urinaire',
    'ECG',
    'EEG',
    'Endoscopie',
    'Biopsie',
    'Autre'
  ];

  // Load exams on mount
  useEffect(() => {
    if (patientId) {
      loadExams();
    }
  }, [patientId]);

  // Auto-hide messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // ============================================
  // DATA LOADING
  // ============================================

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await getPatientExams(patientId);
      setExams(data.examens || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      const examData = {
        ...formData,
        patientId
      };
      await createExam(examData);
      setSuccess('Examen ajouté avec succès');
      setShowAddModal(false);
      resetForm();
      loadExams();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      await updateExam(selectedExam.id, formData);
      setSuccess('Examen mis à jour avec succès');
      setShowEditModal(false);
      setSelectedExam(null);
      resetForm();
      loadExams();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen et tous ses fichiers ?')) {
      return;
    }
    try {
      await deleteExam(examId);
      setSuccess('Examen supprimé avec succès');
      setShowViewModal(false);
      setSelectedExam(null);
      loadExams();
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================================
  // FILE MANAGEMENT
  // ============================================

  const handleFileUpload = async (examId, file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      setUploadProgress({ [examId]: 0 });
      
      await uploadExamFile(examId, file, (progress) => {
        setUploadProgress({ [examId]: Math.round(progress) });
      });

      setSuccess('Fichier téléchargé avec succès');
      setUploadProgress({});
      loadExams();
    } catch (err) {
      setError(err.message);
      setUploadProgress({});
    }
  };

  const handleDeleteFile = async (examId, fileId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return;
    }
    try {
      await deleteExamFile(examId, fileId);
      setSuccess('Fichier supprimé avec succès');
      loadExams();
    } catch (err) {
      setError(err.message);
    }
  };

  // ============================================
  // UI HELPERS
  // ============================================

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (exam) => {
    setSelectedExam(exam);
    setFormData({
      type: exam.type || '',
      nom: exam.nom || '',
      description: exam.description || '',
      dateExamen: exam.dateExamen ? new Date(exam.dateExamen).toISOString().split('T')[0] : '',
      prescripteur: exam.prescripteur || '',
      resultat: exam.resultat || '',
      notes: exam.notes || '',
      statut: exam.statut || 'En attente'
    });
    setShowEditModal(true);
  };

  const openViewModal = (exam) => {
    setSelectedExam(exam);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      nom: '',
      description: '',
      dateExamen: new Date().toISOString().split('T')[0],
      prescripteur: '',
      resultat: '',
      notes: '',
      statut: 'En attente'
    });
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Effectué':
        return 'bg-green-100 text-green-800';
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Examens Complémentaires</h2>
          {stats && (
            <p className="text-sm text-gray-600 mt-1">
              Total: {stats.total} examen{stats.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Nouvel Examen
        </button>
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {stats && stats.types && Object.keys(stats.types).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.types).map(([type, count]) => (
            <div key={type} className="bg-white p-4 rounded-lg shadow border">
              <div className="text-sm text-gray-600">{type}</div>
              <div className="text-2xl font-bold text-teal-600">{count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Exams List */}
      {exams.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">Aucun examen complémentaire enregistré</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
          >
            Ajouter le premier examen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{exam.nom}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(exam.statut)}`}>
                      {exam.statut}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Type:</span> {exam.type}</p>
                    <p><span className="font-medium">Date:</span> {new Date(exam.dateExamen).toLocaleDateString('fr-FR')}</p>
                    <p><span className="font-medium">Prescripteur:</span> {exam.prescripteur}</p>
                    {exam.description && (
                      <p><span className="font-medium">Description:</span> {exam.description}</p>
                    )}
                  </div>
                  
                  {/* Files */}
                  {exam.fichiers && exam.fichiers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {exam.fichiers.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-sm"
                        >
                          <span>{getFileIcon(file.typeMime)}</span>
                          <span className="text-gray-700">{file.nomOriginal}</span>
                          <span className="text-gray-500">({formatFileSize(file.taille)})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploadProgress[exam.id] !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress[exam.id]}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Téléchargement: {uploadProgress[exam.id]}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openViewModal(exam)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Voir détails"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => openEditModal(exam)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <ExamModal
            title="Nouvel Examen Complémentaire"
            formData={formData}
            setFormData={setFormData}
            examTypes={examTypes}
            onSubmit={handleAddExam}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <ExamModal
            title="Modifier l'Examen"
            formData={formData}
            setFormData={setFormData}
            examTypes={examTypes}
            onSubmit={handleUpdateExam}
            onClose={() => {
              setShowEditModal(false);
              setSelectedExam(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedExam && (
          <ViewExamModal
            exam={selectedExam}
            onClose={() => {
              setShowViewModal(false);
              setSelectedExam(null);
            }}
            onFileUpload={handleFileUpload}
            onFileDelete={handleDeleteFile}
            uploadProgress={uploadProgress[selectedExam.id]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// EXAM FORM MODAL
// ============================================

const ExamModal = ({ title, formData, setFormData, examTypes, onSubmit, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type d'examen *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Sélectionner un type</option>
                {examTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'examen *
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Ex: Radio thorax face et profil"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                rows="3"
                placeholder="Description détaillée de l'examen demandé"
              />
            </div>

            {/* Date & Prescripteur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de l'examen *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateExamen}
                  onChange={(e) => setFormData({ ...formData, dateExamen: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescripteur *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prescripteur}
                  onChange={(e) => setFormData({ ...formData, prescripteur: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Dr. Nom"
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="En attente">En attente</option>
                <option value="Effectué">Effectué</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>

            {/* Resultat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résultat
              </label>
              <textarea
                value={formData.resultat}
                onChange={(e) => setFormData({ ...formData, resultat: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                rows="3"
                placeholder="Résultats de l'examen (optionnel)"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes additionnelles
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                rows="2"
                placeholder="Notes complémentaires (optionnel)"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// VIEW EXAM MODAL
// ============================================

const ViewExamModal = ({ exam, onClose, onFileUpload, onFileDelete, uploadProgress }) => {
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(exam.id, file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{exam.nom}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{exam.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  exam.statut === 'Effectué' ? 'bg-green-100 text-green-800' :
                  exam.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {exam.statut}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {new Date(exam.dateExamen).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prescripteur</p>
                <p className="font-medium">{exam.prescripteur}</p>
              </div>
            </div>

            {/* Description */}
            {exam.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-800">{exam.description}</p>
              </div>
            )}

            {/* Resultat */}
            {exam.resultat && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Résultat</p>
                <p className="text-gray-800">{exam.resultat}</p>
              </div>
            )}

            {/* Notes */}
            {exam.notes && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="text-gray-800">{exam.notes}</p>
              </div>
            )}

            {/* Files Section */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Fichiers joints</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-colors"
                >
                  📎 Ajouter un fichier
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress !== undefined && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Téléchargement: {uploadProgress}%
                  </p>
                </div>
              )}

              {/* Files List */}
              {exam.fichiers && exam.fichiers.length > 0 ? (
                <div className="space-y-2">
                  {exam.fichiers.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(file.typeMime)}</span>
                        <div>
                          <p className="font-medium text-gray-800">{file.nomOriginal}</p>
                          <p className="text-xs text-gray-600">
                            {formatFileSize(file.taille)} • {new Date(file.dateUpload).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadExamFile(exam.id, file.id, file.nomOriginal)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Télécharger"
                        >
                          ⬇️
                        </button>
                        <button
                          onClick={() => onFileDelete(exam.id, file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucun fichier joint
                </p>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExamsList;
