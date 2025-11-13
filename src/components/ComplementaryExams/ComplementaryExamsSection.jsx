import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  FileImage,
  Calendar
} from 'lucide-react';
import ExamCard from './ExamCard';
import ExamModal from './ExamModal';
import FileUploadModal from './FileUploadModal';
import { 
  getComplementaryExams, 
  deleteComplementaryExam,
  transformExamFromBackend
} from '../../utils/complementaryExamsService';

/**
 * ComplementaryExamsSection Component
 * Main section for managing complementary medical exams
 */
const ComplementaryExamsSection = ({ patientId }) => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    enAttente: 0,
    realises: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [showExamModal, setShowExamModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Load exams from API
   */
  const loadExams = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getComplementaryExams(patientId);
      // Transform exams from backend to component format
      const transformedExams = (response.exams || []).map(transformExamFromBackend);
      setExams(transformedExams);
      setStatistics(response.statistics || { total: 0, completed: 0, pending: 0 });
    } catch (error) {
      console.error('Error loading exams:', error);
      setError('Erreur lors du chargement des examens');
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load exams on component mount
   */
  useEffect(() => {
    if (patientId) {
      loadExams();
    }
  }, [patientId]);

  /**
   * Apply filters
   */
  useEffect(() => {
    let filtered = [...exams];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam => {
        const type = (exam.typeExamen || exam.type || '').toLowerCase();
        const desc = (exam.description || exam.resultats || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return type.includes(search) || desc.includes(search);
      });
    }

    // Note: Status filter removed since we only have one date field now
    // Can be re-added if backend provides status field

    setFilteredExams(filtered);
  }, [exams, searchTerm]);

  /**
   * Handle create new exam
   */
  const handleCreateExam = () => {
    setSelectedExam(null);
    setShowExamModal(true);
  };

  /**
   * Handle edit exam
   */
  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setShowExamModal(true);
  };

  /**
   * Handle delete exam
   */
  const handleDeleteExam = async (examId) => {
    try {
      await deleteComplementaryExam(examId);
      await loadExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Erreur lors de la suppression de l\'examen');
    }
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = (exam) => {
    setSelectedExam(exam);
    setShowFileUploadModal(true);
  };

  /**
   * Handle modal success (refresh data)
   */
  const handleModalSuccess = () => {
    loadExams();
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Exams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total examens</p>
              <p className="text-3xl font-bold mt-2">{statistics.total}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </motion.div>

        {/* With Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Avec fichiers</p>
              <p className="text-3xl font-bold mt-2">{exams.filter(e => e.fichiers && e.fichiers.length > 0).length}</p>
            </div>
            <FileImage className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </motion.div>

        {/* Recent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Ce mois</p>
              <p className="text-3xl font-bold mt-2">{exams.filter(e => {
                const examDate = new Date(e.date);
                const now = new Date();
                return examDate.getMonth() === now.getMonth() && examDate.getFullYear() === now.getFullYear();
              }).length}</p>
            </div>
            <Calendar className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un examen..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
            />
          </div>


        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={loadExams}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
          <button
            onClick={handleCreateExam}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvel examen</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadExams}
                className="text-sm text-red-600 hover:text-red-700 font-medium mt-1"
              >
                Réessayer
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exams List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-medical-600 animate-spin" />
            <p className="text-gray-600">Chargement des examens...</p>
          </div>
        </div>
      ) : filteredExams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Aucun résultat' : 'Aucun examen'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par créer un nouvel examen complémentaire'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateExam}
              className="inline-flex items-center gap-2 px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Créer le premier examen</span>
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                patientId={patientId}
                onEdit={handleEditExam}
                onDelete={handleDeleteExam}
                onFileUpload={handleFileUpload}
                onRefresh={loadExams}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <ExamModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        patientId={patientId}
        exam={selectedExam}
        onSuccess={handleModalSuccess}
      />

      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        patientId={patientId}
        exam={selectedExam}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ComplementaryExamsSection;
