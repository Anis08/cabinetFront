import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  Plus,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { baseURL } from "../../config";
import { useAuth } from '../../store/AuthProvider';

// Valeurs normales de référence pour chaque examen
const NORMAL_RANGES = {
  'Glycémie à jeun': { min: 3.9, max: 5.5, unit: 'mmol/L', displayName: 'Glycémie à jeun' },
  'Cholestérol total': { min: 0, max: 5.2, unit: 'mmol/L', displayName: 'Cholestérol total' },
  'HDL Cholestérol': { min: 1.0, max: 999, unit: 'mmol/L', displayName: 'HDL Cholestérol' },
  'LDL Cholestérol': { min: 0, max: 3.4, unit: 'mmol/L', displayName: 'LDL Cholestérol' },
  'Triglycérides': { min: 0, max: 1.7, unit: 'mmol/L', displayName: 'Triglycérides' },
  'Hémoglobine': { min: 12.0, max: 16.0, unit: 'g/dL', displayName: 'Hémoglobine' },
  'Créatinine': { min: 45, max: 90, unit: 'μmol/L', displayName: 'Créatinine' },
  'TSH': { min: 0.4, max: 4.0, unit: 'mUI/L', displayName: 'TSH' }
};

// Types de prélèvement disponibles
const SAMPLE_TYPES = ['Sang', 'Urine', 'Selles', 'Autre'];

// Examens disponibles
const EXAM_TYPES = Object.keys(NORMAL_RANGES);

// Fonction pour comparer une valeur avec les normes
const compareWithNorm = (examType, value) => {
  if (!value || value === '' || !NORMAL_RANGES[examType]) return null;
  
  const numValue = parseFloat(value);
  const { min, max } = NORMAL_RANGES[examType];
  
  if (isNaN(numValue)) return null;
  
  if (numValue < min || numValue > max) return 'Hors norme';
  
  // Limite = entre 90% et 110% des bornes
  const minLimit = min * 0.9;
  const maxLimit = max * 1.1;
  
  if ((numValue >= minLimit && numValue < min) || (numValue > max && numValue <= maxLimit)) {
    return 'Limite';
  }
  
  return 'Normal';
};

// Composant principal
const BiologicalDataSection = ({ patientId }) => {
  const { logout, refresh } = useAuth();
  const [biologicalRequests, setBiologicalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // État du formulaire de création
  const [formData, setFormData] = useState({
    sampleTypes: [],
    requestedExams: []
  });

  // État du formulaire d'édition des résultats
  const [resultsData, setResultsData] = useState({});

  // Charger les demandes biologiques du patient
  useEffect(() => {
    loadBiologicalRequests();
  }, [patientId]);

  const loadBiologicalRequests = async () => {
    try {
      let response = await fetch(`${baseURL}/medecin/biological-requests/${patientId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        if (response.status === 401) {
          const refreshResponse = await refresh();
          if (!refreshResponse) {
            logout();
            return;
          }
          response = await fetch(`${baseURL}/medecin/biological-requests/${patientId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setBiologicalRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes biologiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle demande (SANS résultats)
  const handleCreateRequest = async () => {
    if (formData.sampleTypes.length === 0 || formData.requestedExams.length === 0) {
      alert('Veuillez sélectionner au moins un type de prélèvement et un examen.');
      return;
    }

    try {
      let response = await fetch(`${baseURL}/medecin/biological-requests`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId,
          sampleTypes: formData.sampleTypes,
          requestedExams: formData.requestedExams,
          status: 'En cours' // Statut initial
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        if (response.status === 401) {
          const refreshResponse = await refresh();
          if (!refreshResponse) {
            logout();
            return;
          }
          response = await fetch(`${baseURL}/medecin/biological-requests`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              patientId,
              sampleTypes: formData.sampleTypes,
              requestedExams: formData.requestedExams,
              status: 'En cours'
            }),
          });
        }
      }

      if (response.ok) {
        await loadBiologicalRequests();
        handleCloseModal();
        alert('Demande biologique créée avec succès !');
      } else {
        alert('Erreur lors de la création de la demande.');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la demande.');
    }
  };

  // Mettre à jour les résultats d'une demande existante
  const handleUpdateResults = async () => {
    if (!editingRequest) return;

    // Vérifier si tous les examens ont des résultats
    const allResultsFilled = editingRequest.requestedExams.every(
      exam => resultsData[exam] && resultsData[exam].trim() !== ''
    );

    // Changer le statut automatiquement si tous les résultats sont remplis
    const newStatus = allResultsFilled ? 'Complété' : 'En cours';

    try {
      let response = await fetch(`${baseURL}/medecin/biological-requests/${editingRequest.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId,
          results: resultsData,
          status: newStatus,
          samplingDate: editingRequest.samplingDate || new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        if (response.status === 401) {
          const refreshResponse = await refresh();
          if (!refreshResponse) {
            logout();
            return;
          }
          response = await fetch(`${baseURL}/medecin/biological-requests/${editingRequest.id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              patientId,
              results: resultsData,
              status: newStatus,
              samplingDate: editingRequest.samplingDate || new Date().toISOString().split('T')[0]
            }),
          });
        }
      }

      if (response.ok) {
        await loadBiologicalRequests();
        handleCloseModal();
        alert('Résultats enregistrés avec succès !');
      } else {
        alert('Erreur lors de la mise à jour des résultats.');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour des résultats.');
    }
  };

  // Ouvrir le modal pour créer une nouvelle demande
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingRequest(null);
    setFormData({ sampleTypes: [], requestedExams: [] });
    setResultsData({});
    setShowModal(true);
  };

  // Ouvrir le modal pour éditer les résultats
  const handleOpenEditModal = (request) => {
    setIsEditMode(true);
    setEditingRequest(request);
    setResultsData(request.results || {});
    setShowModal(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingRequest(null);
    setFormData({ sampleTypes: [], requestedExams: [] });
    setResultsData({});
  };

  // Gérer les cases à cocher pour types de prélèvement
  const handleSampleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      sampleTypes: prev.sampleTypes.includes(type)
        ? prev.sampleTypes.filter(t => t !== type)
        : [...prev.sampleTypes, type]
    }));
  };

  // Gérer les cases à cocher pour examens
  const handleExamChange = (exam) => {
    setFormData(prev => ({
      ...prev,
      requestedExams: prev.requestedExams.includes(exam)
        ? prev.requestedExams.filter(e => e !== exam)
        : [...prev.requestedExams, exam]
    }));
  };

  // Gérer les valeurs de résultats
  const handleResultChange = (exam, value) => {
    setResultsData(prev => ({
      ...prev,
      [exam]: value
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800">Données Biologiques</h3>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        </div>

        {/* Tableau des demandes */}
        {biologicalRequests.length > 0 ? (
          <div className="p-6">
            {biologicalRequests.map((request) => (
              <div key={request.id} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-800">
                      Demande N° {request.requestNumber}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'Complété' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {request.status === 'Complété' ? '🟢' : '🟠'} {request.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(request)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier les résultats"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tableau des résultats */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Test</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Valeur</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Norme</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Statut</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.requestedExams.map((exam) => {
                        const range = NORMAL_RANGES[exam];
                        const value = request.results?.[exam];
                        const status = compareWithNorm(exam, value);
                        
                        return (
                          <tr key={exam} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-800">{exam}</td>
                            <td className="py-3 px-4 text-sm">
                              {value ? (
                                <span className="font-semibold text-gray-800">
                                  {value} {range?.unit}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-600">
                              {range ? `${range.min} - ${range.max}` : '-'}
                            </td>
                            <td className="py-3 px-4">
                              {status ? (
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  status === 'Normal' ? 'bg-green-100 text-green-700' :
                                  status === 'Limite' ? 'bg-orange-100 text-orange-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {status === 'Normal' && <CheckCircle className="w-3 h-3" />}
                                  {status === 'Limite' && <AlertTriangle className="w-3 h-3" />}
                                  {status === 'Hors norme' && <AlertCircle className="w-3 h-3" />}
                                  {status}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {request.samplingDate 
                                ? new Date(request.samplingDate).toLocaleDateString('fr-FR')
                                : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Droplet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Aucune demande biologique</p>
            <p className="text-sm">Cliquez sur "Nouvelle demande" pour commencer</p>
          </div>
        )}
      </div>

      {/* Modal pour créer/éditer */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {isEditMode ? 'Modifier les résultats' : 'Nouvelle demande biologique'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {!isEditMode ? (
                  // Formulaire de création
                  <>
                    {/* Types de prélèvement */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Type de prélèvement *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {SAMPLE_TYPES.map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.sampleTypes.includes(type)}
                              onChange={() => handleSampleTypeChange(type)}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Examens demandés */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Examens demandés *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {EXAM_TYPES.map((exam) => (
                          <label
                            key={exam}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.requestedExams.includes(exam)}
                              onChange={() => handleExamChange(exam)}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{exam}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  // Formulaire d'édition des résultats
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Saisir les résultats des examens
                    </label>
                    <div className="space-y-4">
                      {editingRequest.requestedExams.map((exam) => {
                        const range = NORMAL_RANGES[exam];
                        const status = compareWithNorm(exam, resultsData[exam]);
                        
                        return (
                          <div key={exam} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{exam}</span>
                              {status && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  status === 'Normal' ? 'bg-green-100 text-green-700' :
                                  status === 'Limite' ? 'bg-orange-100 text-orange-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {status}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <input
                                type="number"
                                step="0.01"
                                value={resultsData[exam] || ''}
                                onChange={(e) => handleResultChange(exam, e.target.value)}
                                placeholder={`Valeur (${range?.unit || ''})`}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                              <span className="text-sm text-gray-500 min-w-fit">
                                {range?.unit}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Norme: {range?.min} - {range?.max} {range?.unit}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={isEditMode ? handleUpdateResults : handleCreateRequest}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isEditMode ? 'Enregistrer les résultats' : 'Créer la demande'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BiologicalDataSection;
