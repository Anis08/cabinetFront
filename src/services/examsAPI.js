/**
 * API Service for Complementary Exams
 * 
 * This service handles all API calls related to complementary exams (examens complémentaires)
 * including CRUD operations and file management.
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Get authentication headers
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Get multipart form headers (for file uploads)
 */
const getMultipartHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type for multipart/form-data - browser will set it with boundary
  };
};

// ============================================
// EXAM CRUD OPERATIONS
// ============================================

/**
 * Get all complementary exams for a patient
 * 
 * @param {string} patientId - The patient ID
 * @returns {Promise<{examens: Array, stats: Object}>}
 */
export const getPatientExams = async (patientId) => {
  try {
    const response = await fetch(
      `${baseURL}/medecin/exams/patient/${patientId}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération des examens');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching patient exams:', error);
    throw error;
  }
};

/**
 * Get a specific exam by ID
 * 
 * @param {string} examId - The exam ID
 * @returns {Promise<{examen: Object}>}
 */
export const getExamById = async (examId) => {
  try {
    const response = await fetch(
      `${baseURL}/medecin/exams/${examId}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération de l\'examen');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching exam:', error);
    throw error;
  }
};

/**
 * Create a new complementary exam
 * 
 * @param {Object} examData - The exam data
 * @param {string} examData.patientId - Patient ID
 * @param {string} examData.type - Exam type
 * @param {string} examData.nom - Exam name
 * @param {string} examData.description - Exam description
 * @param {string} examData.dateExamen - Exam date (ISO string)
 * @param {string} examData.prescripteur - Prescriber name
 * @param {string} [examData.resultat] - Exam result (optional)
 * @param {string} [examData.notes] - Additional notes (optional)
 * @param {string} examData.statut - Status (En attente, Effectué, Annulé)
 * @returns {Promise<{examen: Object}>}
 */
export const createExam = async (examData) => {
  try {
    const response = await fetch(
      `${baseURL}/medecin/exams`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(examData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création de l\'examen');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

/**
 * Update an existing exam
 * 
 * @param {string} examId - The exam ID
 * @param {Object} examData - The updated exam data (partial)
 * @returns {Promise<{examen: Object}>}
 */
export const updateExam = async (examId, examData) => {
  try {
    const response = await fetch(
      `${baseURL}/medecin/exams/${examId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(examData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour de l\'examen');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

/**
 * Delete an exam and all associated files
 * 
 * @param {string} examId - The exam ID
 * @returns {Promise<{message: string}>}
 */
export const deleteExam = async (examId) => {
  try {
    const response = await fetch(
      `${baseURL}/medecin/exams/${examId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression de l\'examen');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};

// ============================================
// FILE MANAGEMENT
// ============================================

/**
 * Upload a file for an exam
 * 
 * @param {string} examId - The exam ID
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<{message: string, fichier: Object}>}
 */
export const uploadExamFile = async (examId, file, onProgress) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || 'Erreur lors du téléchargement du fichier'));
          } catch (e) {
            reject(new Error('Erreur lors du téléchargement du fichier'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Erreur réseau lors du téléchargement'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Téléchargement annulé'));
      });

      xhr.open('POST', `${baseURL}/medecin/exams/${examId}/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from an exam
 * 
 * @param {string} examId - The exam ID
 * @param {string} fileId - The file ID
 * @returns {Promise<{message: string}>}
 */
export const deleteExamFile = async (examId, fileId) => {
  try {
    const response = await fetch(
      `${baseURL}/medecin/exams/${examId}/files/${fileId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression du fichier');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get download URL for a file
 * 
 * @param {string} examId - The exam ID
 * @param {string} fileId - The file ID
 * @returns {string} The download URL
 */
export const getFileDownloadUrl = (examId, fileId) => {
  const token = localStorage.getItem('accessToken');
  return `${baseURL}/medecin/exams/${examId}/files/${fileId}/download?token=${token}`;
};

/**
 * Download a file (triggers browser download)
 * 
 * @param {string} examId - The exam ID
 * @param {string} fileId - The file ID
 * @param {string} fileName - The file name
 */
export const downloadExamFile = (examId, fileId, fileName) => {
  const url = getFileDownloadUrl(examId, fileId);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate file before upload
 * 
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Le fichier est trop volumineux (max 10MB)'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Type de fichier non autorisé. Formats acceptés: PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX'
    };
  }

  return { valid: true };
};

/**
 * Format file size for display
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file icon based on mime type
 * 
 * @param {string} mimeType - The file mime type
 * @returns {string} Icon name or emoji
 */
export const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  return '📎';
};

export default {
  getPatientExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  uploadExamFile,
  deleteExamFile,
  getFileDownloadUrl,
  downloadExamFile,
  validateFile,
  formatFileSize,
  getFileIcon
};
