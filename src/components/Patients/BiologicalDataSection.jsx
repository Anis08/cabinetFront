
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
  Upload,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { baseURL } from "../../config";
import { useAuth } from '../../store/AuthProvider';

// Valeurs normales de référence pour chaque examen
const NORMAL_RANGES = {


  "ASAT":{ min: 10, max: 35, unit: "U/L", displayName: "ASAT" },
     "ALAT": { min: 7, max: 56, unit: "U/L", displayName: "ALAT" },
      "Gamma GT":{ min: 8, max: 61, unit: "U/L", displayName: "Gamma GT" },
      "Bilirubine totale":{ min: 0, max: 17, unit: "µmol/L", displayName: "Bilirubine totale" },
      "Sodium sanguin":{ min: 135, max: 145, unit: "mmol/L", displayName: "Sodium sanguin" },
      "Potassium sanguin":{ min: 3.5, max: 5.1, unit: "mmol/L", displayName: "Potassium sanguin" },
      "Calcium ionisé":{ min: 2.2, max: 2.6, unit: "mmol/L", displayName: "Calcium ionisé" },
      "Urécémie":{ min: 140, max: 360, unit: "µmol/L", displayName: "Urécémie" },
      "Urée sanguine":{ min: 2.5, max: 7.5, unit: "mmol/L", displayName: "Urée sanguine" },
      "Créatininémie":{ min: 45, max: 90, unit: "µmol/L", displayName: "Créatininémie" },
      "CRP":{ min: 0, max: 5, unit: "mg/L", displayName: "CRP" },
      "Calcémie totale":{ min: 2.15, max: 2.55, unit: "mmol/L", displayName: "Calcémie totale" },
      "Phosphorémie":{ min: 0.8, max: 1.5, unit: "mmol/L", displayName: "Phosphorémie" },
      "Phosphatases alcalines":{ min: 40, max: 129, unit: "U/L", displayName: "Phosphatases alcalines" },
      "Ferritine":{ min: 30, max: 400, unit: "ng/mL", displayName: "Ferritine" },
      "Fer sérique":{ min: 10, max: 30, unit: "µmol/L", displayName: "Fer sérique" },
      "Glycémie à jeun":{ min: 3.9, max: 5.5, unit: "mmol/L", displayName: "Glycémie à jeun" },
      "Cholestérol total":{ min: 0, max: 5.2, unit: "mmol/L", displayName: "Cholestérol total" },
      "HDL Cholestérol":{ min: 1.0, max: 2.0, unit: "mmol/L", displayName: "HDL Cholestérol" },
      "LDL Cholestérol":{ min: 0, max: 3.4, unit: "mmol/L", displayName: "LDL Cholestérol" },
      "Triglycérides":{ min: 0, max: 1.7, unit: "mmol/L", displayName: "Triglycérides" },





  "TIBC": { min: 45, max: 72, unit: "µmol/L", displayName: "TIBC (capacité totale fixation fer)" },

  "Vitamine D (25-OH)": { min: 30, max: 100, unit: "ng/mL", displayName: "Vitamine D 25-OH" },
  "PTH": { min: 10, max: 65, unit: "pg/mL", displayName: "Parathormone (PTH)" },







  "HbA1c": { min: 4.0, max: 5.6, unit: "%", displayName: "HbA1c" },



  "PSA total": { min: 0, max: 4, unit: "ng/mL", displayName: "PSA total" },
  "PSA libre": { min: 0, max: 0.9, unit: "ng/mL", displayName: "PSA libre" },

  "Chimie urinaire": { min: null, max: null, unit: "", displayName: "Analyse chimique urinaire" },
  "Rapport Albuminurie/Créatininurie": { min: 0, max: 30, unit: "mg/g", displayName: "Albuminurie/Créatininurie" },


};

const categories = [
  {
    name: "Biochimie sanguine",
    type: "Sang",
    exams: [
      { min: 10, max: 35, unit: "U/L", displayName: "ASAT" },
      { min: 7, max: 56, unit: "U/L", displayName: "ALAT" },
      { min: 8, max: 61, unit: "U/L", displayName: "Gamma GT" },
      { min: 0, max: 17, unit: "µmol/L", displayName: "Bilirubine totale" },
      { min: 135, max: 145, unit: "mmol/L", displayName: "Sodium sanguin" },
      { min: 3.5, max: 5.1, unit: "mmol/L", displayName: "Potassium sanguin" },
      { min: 2.2, max: 2.6, unit: "mmol/L", displayName: "Calcium ionisé" },
      { min: 140, max: 360, unit: "µmol/L", displayName: "Urécémie" },
      { min: 2.5, max: 7.5, unit: "mmol/L", displayName: "Urée sanguine" },
      { min: 45, max: 90, unit: "µmol/L", displayName: "Créatininémie" },
      { min: 0, max: 5, unit: "mg/L", displayName: "CRP" },
      { min: 2.15, max: 2.55, unit: "mmol/L", displayName: "Calcémie totale" },
      { min: 0.8, max: 1.5, unit: "mmol/L", displayName: "Phosphorémie" },
      { min: 40, max: 129, unit: "U/L", displayName: "Phosphatases alcalines" },
      { min: 30, max: 400, unit: "ng/mL", displayName: "Ferritine" },
      { min: 10, max: 30, unit: "µmol/L", displayName: "Fer sérique" },
      { min: 3.9, max: 5.5, unit: "mmol/L", displayName: "Glycémie à jeun" },
      { min: 0, max: 5.2, unit: "mmol/L", displayName: "Cholestérol total" },
      { min: 1.0, max: 2.0, unit: "mmol/L", displayName: "HDL Cholestérol" },
      { min: 0, max: 3.4, unit: "mmol/L", displayName: "LDL Cholestérol" },
      { min: 0, max: 1.7, unit: "mmol/L", displayName: "Triglycérides" },
    ]
  },
  {
    name: "Hématologie",
    type: "Sang",
    exams: [
      { min: 4.0, max: 10.0, unit: "G/L", displayName: "Leucocytes" },
      { min: 4.5, max: 5.9, unit: "T/L", displayName: "Hématies" },
      { min: 13, max: 17, unit: "g/dL", displayName: "Hémoglobine" },
      { min: 150, max: 400, unit: "G/L", displayName: "Plaquettes" },
      { min: 80, max: 100, unit: "fL", displayName: "VGM" },
    ]
  },
  {
    name: "Hémostase (Citrate)",
    type: "Sang",
    exams: [
      { min: 70, max: 100, unit: "%", displayName: "Taux de prothrombine (TP)" },
      { min: 25, max: 35, unit: "s", displayName: "TCA" },
      { min: 2, max: 4, unit: "g/L", displayName: "Fibrinogène" },
    ]
  },
  {
    name: "Fonction rénale",
    type: "Sang",
    exams: [
      { min: 90, max: 120, unit: "mL/min/1.73m²", displayName: "DFG estimé (CKD-EPI)" },
      { min: 3.5, max: 5.0, unit: "g/L", displayName: "Albuminémie" },
      { min: 15, max: 45, unit: "pg/mL", displayName: "PTH intacte" },
      { min: 30, max: 100, unit: "ng/mL", displayName: "Vitamine D (25-OH)" },
    ]
  },
  {
    name: "Immunologie / Sérologie",
    type: "Sang",
    exams: [
      { min: 0, max: 0, unit: "positif/négatif", displayName: "Sérologie Hépatite B" },
      { min: 0, max: 0, unit: "positif/négatif", displayName: "Sérologie Hépatite C" },
      { min: 0, max: 0, unit: "positif/négatif", displayName: "VIH" },
      { min: 0, max: 20, unit: "UI/mL", displayName: "ANA" },
      { min: 0, max: 20, unit: "UI/mL", displayName: "ANCA" },
    ]
  },
  {
    name: "Examens urinaires",
    type: "Urine",
    exams: [
      { min: 0, max: 0.15, unit: "g/L", displayName: "Protéinurie" },
      { min: 0, max: 30, unit: "mg/g", displayName: "Rapport albumine/créatinine" },
      { min: 4.5, max: 8.0, unit: "", displayName: "pH urinaire" },
      { min: 1.005, max: 1.030, unit: "", displayName: "Densité urinaire" },
    ]
  },
  {
    name: "Microbiologie urinaire",
    type: "Urine",
    exams: [
      { min: 0, max: 0, unit: "infection/stérile", displayName: "ECBU" }
    ]
  }
];


// Types de prélèvement disponibles
const SAMPLE_TYPES = ['Sang', 'Urine', 'Selles', 'Autre'];



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

const CategoryBar = ({ category, requestedExams, onChange }) => {
  const [isOpened, setIsOpened] = useState(false)
  const [count, setCount] = useState(0)

  const handleCheckboxChange = (examName) => {
  const isChecked = requestedExams.includes(examName);

  setCount(c => (isChecked ? c - 1 : c + 1));

  onChange(examName);
};


  return (
    <div className={`overflow-hidden border border-gray-400 bg-gray-100 rounded-lg px-2 py-3 transition-all duration-300 ${isOpened ? 'max-h-[4000px]' : 'max-h-14'}`}>
      <div className='flex items-center justify-between mb-4' onClick={() => setIsOpened(!isOpened)}>
        <span className="text-lg font-medium text-gray-700">{category.name}</span>

        <div className="flex items-center gap-1">
          {count > 0 && (
            <span className="rounded-full h-5 min-w-5 flex items-center justify-center bg-blue-700 text-white text-xs">
              {count}
            </span>
          )}

          <button onClick={() => setIsOpened(prev => !prev)}>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isOpened ? 'rotate-180' : ''
                }`}
            />
          </button>
        </div>


      </div>


      <div className='rounded-lg flex flex-col gap-2 p-2 bg-white'>
        {category.exams.map((exam) => (
          <label
            key={exam.displayName}
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={requestedExams.includes(exam.displayName)}
              onChange={() => handleCheckboxChange(exam.displayName)}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">{exam.displayName}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Composant principal
const BiologicalDataSection = ({ patientId }) => {
  const { logout, refresh } = useAuth();
  const [biologicalRequests, setBiologicalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState({}); // Pour gérer l'accordéon

  // État du formulaire de création
  const [formData, setFormData] = useState({
    sampleTypes: [],
    requestedExams: []
  });

  const selectedCategories = categories.filter(category => formData.sampleTypes.includes(category.type));

  // État du formulaire d'édition des résultats
  const [resultsData, setResultsData] = useState({});

  // Fonction pour toggle l'affichage d'une demande
  const toggleRequestExpansion = (requestId) => {
    setExpandedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

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

        {/* Liste des demandes avec accordéon */}
        {biologicalRequests.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {biologicalRequests.map((request) => (
              <div key={request.id} className="bg-white">
                {/* En-tête de la demande (toujours visible) */}
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Bouton flèche pour expand/collapse */}
                    <button
                      onClick={() => toggleRequestExpansion(request.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title={expandedRequests[request.id] ? "Masquer les détails" : "Afficher les détails"}
                    >
                      {expandedRequests[request.id] ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                    {/* Info de la demande */}
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-800">
                        Demande N° {request.requestNumber}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'Complété'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                        }`}>
                        {request.status === 'Complété' ? '🟢' : '🟠'} {request.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Bouton modifier */}
                  <button
                    onClick={() => handleOpenEditModal(request)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Modifier les résultats"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>

                {/* Tableau des résultats (affiché conditionnellement) */}
                <AnimatePresence>
                  {expandedRequests[request.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="overflow-x-auto bg-gray-50 rounded-lg">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
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
                                  <tr key={exam} className="border-b border-gray-100 hover:bg-white transition-colors">
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
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status === 'Normal' ? 'bg-green-100 text-green-700' :
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-scroll"
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
                      <div className="grid grid-cols-1  gap-3">
                        {selectedCategories.map((category) => (
                          <CategoryBar category={category} onChange={(name) => handleExamChange(name)} requestedExams={formData.requestedExams} />
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
                                <span className={`text-xs px-2 py-1 rounded-full ${status === 'Normal' ? 'bg-green-100 text-green-700' :
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
