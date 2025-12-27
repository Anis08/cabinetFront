import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Download, 
  Trash2, 
  Edit2, 
  ChevronDown, 
  ChevronUp,
  FileImage,
  
  File,
  Upload,
  X
} from 'lucide-react';
import { formatFileSize, downloadExamFile, deleteExamFile } from '../../utils/complementaryExamsService';

/**
 * ExamCard Component
 * Displays a single complementary exam with expandable details and file management
 */
const ExamCard = ({ exam, patientId, onEdit, onDelete, onFileUpload, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Get icon based on file extension
   */
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return FileImage;
    if (ext === 'pdf') return FilePdf;
    return File;
  };

  /**
   * Handle file download
   */
  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadExamFile(exam.id, fileId, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  /**
   * Handle file deletion
   */
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return;
    }

    setDeletingFileId(fileId);
    try {
      await deleteExamFile(exam.id, fileId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Erreur lors de la suppression du fichier');
    } finally {
      setDeletingFileId(null);
    }
  };

  /**
   * Handle exam deletion
   */
  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet examen et tous ses fichiers associés ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(exam.id);
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Erreur lors de la suppression de l\'examen');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
        <div className="flex-1 flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-medical-600" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {exam.typeExamen || exam.type}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(exam.date)}</span>
              </div>
            </div>
            {exam.fichiers && exam.fichiers.length > 0 && (
              <div className="mt-1 text-sm text-gray-500">
                {exam.fichiers.length} fichier{exam.fichiers.length > 1 ? 's' : ''} joint{exam.fichiers.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(exam)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-gray-50">
              {/* Description */}
              {(exam.description || exam.resultats) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{exam.description || exam.resultats}</p>
                </div>
              )}

              {/* Files */}
              {exam.fichiers && exam.fichiers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Fichiers joints</h4>
                  <div className="space-y-2">
                    {exam.fichiers.map((file) => {
                      const FileIcon = getFileIcon(file.nomFichier);
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.nomFichier}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{formatFileSize(file.tailleFichier)}</span>
                                {file.description && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{file.description}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleDownload(file.id, file.nomFichier)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              disabled={deletingFileId === file.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Supprimer"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload New File Button */}
              <div className="pt-2">
                <button
                  onClick={() => onFileUpload(exam)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-medical-500 hover:bg-medical-50 transition-colors text-gray-600 hover:text-medical-600"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Ajouter un fichier</span>
                </button>
              </div>

              {/* Metadata */}
              <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Créé le {formatDate(exam.createdAt)}</span>
                  {exam.updatedAt && exam.updatedAt !== exam.createdAt && (
                    <span>Modifié le {formatDate(exam.updatedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExamCard;
