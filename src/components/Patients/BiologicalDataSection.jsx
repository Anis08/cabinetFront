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
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { baseURL } from "../../config";
import { useAuth } from '../../store/AuthProvider';

// Valeurs normales de référence pour chaque examen
const NORMAL_RANGES = {
  NFS: { min: 4000, max: 11000, unit: '/mm³', name: 'Numération Formule Sanguine' },
  Glycémie: { min: 0.7, max: 1.1, unit: 'g/L', name: 'Glycémie à jeun' },
  Cholestérol: { min: 1.5, max: 2.0, unit: 'g/L', name: 'Cholestérol total' },
  Créatinine: { min: 7, max: 13, unit: 'mg/L', name: 'Créatinine' },
  TSH: { min: 0.4, max: 4.0, unit: 'mUI/L', name: 'TSH' },
  HbA1c: { min: 4.0, max: 6.0, unit: '%', name: 'Hémoglobine glyquée' },
  Ionogramme: { min: 135, max: 145, unit: 'mmol/L', name: 'Ionogramme (Na+)' },
  'Bilan hépatique': { min: 10, max: 40, unit: 'UI/L', name: 'Transaminases (ALT)' },
  'Bilan rénal': { min: 80, max: 120, unit: 'mL/min', name: 'Clairance créatinine' },
  'Bilan lipidique': { min: 0.4, max: 1.6, unit: 'g/L', name: 'Triglycérides' }
};

// Types de prélèvement disponibles
const SAMPLE_TYPES = ['Sang', 'Urine', 'Selles', 'Autre'];

// Examens disponibles
const EXAM_TYPES = [
  'NFS',
  'Glycémie',
  'Cholestérol',
  'Créatinine',
  'TSH',
  'HbA1c',
  'Ionogramme',
  'Bilan hépatique',
  'Bilan rénal',
  'Bilan lipidique'
];

// Composant Card réutilisable
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Fonction pour comparer une valeur avec les normes
const compareWithNorm = (examType, value) => {
  if (!value || value === '' || !NORMAL_RANGES[examType]) return 'pending';
  
  const numValue = parseFloat(value);
  const { min, max } = NORMAL_RANGES[examType];
  
  if (numValue < min || numValue > max) return 'danger';
  if (numValue >= min * 0.9 && numValue <= max * 1.1) return 'normal';
  return 'warning';
};

// Fonction pour détecter les corrélations entre examens
const detectCorrelations = (results) => {
  const correlations = [];
  
  // Corrélation Glycémie ↔ HbA1c
  if (results.Glycémie && results.HbA1c) {
    const glycemie = parseFloat(results.Glycémie);
    const hba1c = parseFloat(results.HbA1c);
    
    if (glycemie > 1.1 && hba1c > 6.0) {
      correlations.push({
        type: 'danger',
        message: '⚠️ Glycémie et HbA1c élevées : risque diabétique confirmé'
      });
    } else if (glycemie > 1.1 || hba1c > 6.0) {
      correlations.push({
        type: 'warning',
        message: '⚠️ Surveillance glycémique recommandée'
      });
    }
  }
  
  // Corrélation Cholestérol ↔ Bilan lipidique
  if (results.Cholestérol && results['Bilan lipidique']) {
    const chol = parseFloat(results.Cholestérol);
    const trigly = parseFloat(results['Bilan lipidique']);
    
    if (chol > 2.0 && trigly > 1.6) {
      correlations.push({
        type: 'danger',
        message: '⚠️ Dyslipidémie mixte : risque cardiovasculaire élevé'
      });
    }
  }
  
  // Corrélation Créatinine ↔ Bilan rénal
  if (results.Créatinine && results['Bilan rénal']) {
    const creat = parseFloat(results.Créatinine);
    const clearance = parseFloat(results['Bilan rénal']);
    
    if (creat > 13 && clearance < 80) {
      correlations.push({
        type: 'danger',
        message: '⚠️ Insuffisance rénale détectée : suivi nécessaire'
      });
    }
  }
  
  return correlations;
};

// Composant principal
const BiologicalDataSection = ({ patientId }) => {
  const { logout, refresh } = useAuth();
  const [biologicalRequests, setBiologicalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    sampleTypes: [],
    requestedExams: [],
    samplingDate: '',
    results: {},
    validationDate: '',
    status: 'Récemment créée',
    medicalObservation: ''
  });

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

  // Créer ou mettre à jour une demande
  const handleSaveRequest = async () => {
    try {
      const method = editingRequest ? 'PUT' : 'POST';
      const url = editingRequest 
        ? `${baseURL}/medecin/biological-requests/${editingRequest.id}`
        : `${baseURL}/medecin/biological-requests`;

      let response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          patientId,
          ...formData
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
          response = await fetch(url, {
            method,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              patientId,
              ...formData
            }),
          });
        }
      }

      if (response.ok) {
        await loadBiologicalRequests();
        handleCancelForm();
        alert('Demande enregistrée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement de la demande.');
    }
  };

  // Gérer l'édition d'une demande existante
  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setFormData({
      sampleTypes: request.sampleTypes || [],
      requestedExams: request.requestedExams || [],
      samplingDate: request.samplingDate || '',
      results: request.results || {},
      validationDate: request.validationDate || '',
      status: request.status || 'Récemment créée',
      medicalObservation: request.medicalObservation || ''
    });
    setShowForm(true);
  };

  // Annuler le formulaire
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRequest(null);
    setFormData({
      sampleTypes: [],
      requestedExams: [],
      samplingDate: '',
      results: {},
      validationDate: '',
      status: 'Récemment créée',
      medicalObservation: ''
    });
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
    setFormData(prev => {
      const newRequestedExams = prev.requestedExams.includes(exam)
        ? prev.requestedExams.filter(e => e !== exam)
        : [...prev.requestedExams, exam];
      
      // Si on décoche un examen, supprimer son résultat
      const newResults = { ...prev.results };
      if (!newRequestedExams.includes(exam)) {
        delete newResults[exam];
      }
      
      return {
        ...prev,
        requestedExams: newRequestedExams,
        results: newResults
      };
    });
  };

  // Gérer les valeurs de résultats
  const handleResultChange = (exam, value) => {
    setFormData(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [exam]: value
      }
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de la section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-purple-500" />
            Données Biologiques
          </CardTitle>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        </CardHeader>
      </Card>

      {/* Formulaire de création/édition */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  {editingRequest ? 'Modifier la demande' : 'Nouvelle demande biologique'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
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

                  {/* Valeurs obtenues */}
                  {formData.requestedExams.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Valeurs obtenues (optionnel)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.requestedExams.map((exam) => {
                          const range = NORMAL_RANGES[exam];
                          const status = compareWithNorm(exam, formData.results[exam]);
                          
                          return (
                            <div key={exam} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{exam}</span>
                                {formData.results[exam] && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    status === 'normal' ? 'bg-green-100 text-green-700' :
                                    status === 'warning' ? 'bg-orange-100 text-orange-700' :
                                    status === 'danger' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {status === 'normal' ? '✓ Normale' :
                                     status === 'warning' ? '⚠ Limite' :
                                     status === 'danger' ? '✗ Hors norme' : '⋯ En attente'}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={formData.results[exam] || ''}
                                  onChange={(e) => handleResultChange(exam, e.target.value)}
                                  placeholder={`Valeur (${range.unit})`}
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                Norme: {range.min} - {range.max} {range.unit}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date de prélèvement
                      </label>
                      <input
                        type="date"
                        value={formData.samplingDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, samplingDate: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date de validation
                      </label>
                      <input
                        type="date"
                        value={formData.validationDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, validationDate: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* État de la demande */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      État de la demande
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="Récemment créée">🔴 Récemment créée</option>
                      <option value="Complète">🟢 Complète</option>
                    </select>
                  </div>

                  {/* Observation médicale */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observation médicale
                    </label>
                    <textarea
                      value={formData.medicalObservation}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalObservation: e.target.value }))}
                      rows={4}
                      placeholder="Commentaires ou interprétations médicales..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    />
                  </div>

                  {/* Corrélations automatiques */}
                  {formData.requestedExams.length > 0 && Object.keys(formData.results).length > 0 && (
                    <div>
                      {detectCorrelations(formData.results).map((correlation, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg flex items-start gap-3 ${
                            correlation.type === 'danger' ? 'bg-red-50 border border-red-200' :
                            'bg-orange-50 border border-orange-200'
                          }`}
                        >
                          <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                            correlation.type === 'danger' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                          <p className={`text-sm font-medium ${
                            correlation.type === 'danger' ? 'text-red-800' : 'text-orange-800'
                          }`}>
                            {correlation.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleCancelForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveRequest}
                      disabled={formData.sampleTypes.length === 0 || formData.requestedExams.length === 0}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {editingRequest ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des demandes existantes */}
      {biologicalRequests.length > 0 ? (
        <div className="space-y-4">
          {biologicalRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="space-y-4">
                  {/* En-tête de la demande */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          Demande N° {request.requestNumber}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'Complète' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {request.status === 'Complète' ? '🟢' : '🔴'} {request.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Créée le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        {request.samplingDate && (
                          <span className="flex items-center gap-1">
                            <Droplet className="w-4 h-4" />
                            Prélevée le {new Date(request.samplingDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditRequest(request)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Types de prélèvement */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Types de prélèvement:</p>
                    <div className="flex flex-wrap gap-2">
                      {request.sampleTypes.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Résultats */}
                  {request.requestedExams.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Résultats des examens:</p>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Examen</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Valeur</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Norme</th>
                              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {request.requestedExams.map((exam) => {
                              const range = NORMAL_RANGES[exam];
                              const value = request.results[exam];
                              const status = compareWithNorm(exam, value);
                              
                              return (
                                <tr key={exam} className="border-b border-gray-100">
                                  <td className="py-2 px-3 text-sm text-gray-800">{exam}</td>
                                  <td className="py-2 px-3 text-sm">
                                    {value ? (
                                      <span className="font-semibold text-gray-800">
                                        {value} {range.unit}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 italic">En attente</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-xs text-gray-600">
                                    {range.min} - {range.max} {range.unit}
                                  </td>
                                  <td className="py-2 px-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                      status === 'normal' ? 'bg-green-100 text-green-700' :
                                      status === 'warning' ? 'bg-orange-100 text-orange-700' :
                                      status === 'danger' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {status === 'normal' && <CheckCircle className="w-3 h-3" />}
                                      {status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                                      {status === 'danger' && <AlertCircle className="w-3 h-3" />}
                                      {status === 'normal' ? 'Normale' :
                                       status === 'warning' ? 'Limite' :
                                       status === 'danger' ? 'Hors norme' :
                                       'En attente'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Corrélations */}
                  {request.results && Object.keys(request.results).length > 1 && (
                    <div className="space-y-2">
                      {detectCorrelations(request.results).map((correlation, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg flex items-start gap-2 ${
                            correlation.type === 'danger' ? 'bg-red-50' : 'bg-orange-50'
                          }`}
                        >
                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                            correlation.type === 'danger' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                          <p className={`text-xs ${
                            correlation.type === 'danger' ? 'text-red-800' : 'text-orange-800'
                          }`}>
                            {correlation.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Observation médicale */}
                  {request.medicalObservation && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">Observation médicale</p>
                      <p className="text-sm text-blue-800">{request.medicalObservation}</p>
                    </div>
                  )}

                  {/* Médecin et date de validation */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <span>Prescripteur: Dr. {request.doctorName || JSON.parse(localStorage.getItem('name'))}</span>
                    {request.validationDate && (
                      <span>Validé le {new Date(request.validationDate).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Droplet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Aucune demande biologique</p>
              <p className="text-sm">Cliquez sur "Nouvelle demande" pour commencer</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BiologicalDataSection;
