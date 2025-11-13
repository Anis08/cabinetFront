/**
 * Complementary Exams Service
 * API service for managing complementary medical exams and files
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get auth headers for API requests
 * @returns {Object} Headers with authorization
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Get all complementary exams for a specific patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} Response with exams list and statistics
 */
export const getComplementaryExams = async (patientId) => {
  try {
    const response = await fetch(`${baseURL}/medecin/patients/${patientId}/examens-complementaires`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exams: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching complementary exams:', error);
    throw error;
  }
};

/**
 * Get a single complementary exam by ID
 * @param {string} patientId - Patient ID
 * @param {string} examId - Exam ID
 * @returns {Promise<Object>} Exam details
 */
export const getComplementaryExamById = async (patientId, examId) => {
  try {
    const response = await fetch(`${baseURL}/medecin/patients/${patientId}/examens-complementaires/${examId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exam: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching exam by ID:', error);
    throw error;
  }
};

/**
 * Create a new complementary exam
 * @param {string} patientId - Patient ID
 * @param {Object} examData - Exam data
 * @param {string} examData.typeExamen - Exam type
 * @param {Date} examData.dateDemande - Request date
 * @param {Date} [examData.dateRealisation] - Completion date
 * @param {string} [examData.resultats] - Results
 * @param {string} [examData.observations] - Observations
 * @returns {Promise<Object>} Created exam
 */
export const createComplementaryExam = async (patientId, examData) => {
  try {
    const response = await fetch(`${baseURL}/medecin/patients/${patientId}/examens-complementaires`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(examData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create exam: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating complementary exam:', error);
    throw error;
  }
};

/**
 * Update an existing complementary exam
 * @param {string} patientId - Patient ID
 * @param {string} examId - Exam ID
 * @param {Object} examData - Updated exam data
 * @returns {Promise<Object>} Updated exam
 */
export const updateComplementaryExam = async (patientId, examId, examData) => {
  try {
    const response = await fetch(`${baseURL}/medecin/patients/${patientId}/examens-complementaires/${examId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(examData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update exam: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating complementary exam:', error);
    throw error;
  }
};

/**
 * Delete a complementary exam (and all associated files)
 * @param {string} patientId - Patient ID
 * @param {string} examId - Exam ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteComplementaryExam = async (patientId, examId) => {
  try {
    const response = await fetch(`${baseURL}/medecin/patients/${patientId}/examens-complementaires/${examId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete exam: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting complementary exam:', error);
    throw error;
  }
};

/**
 * Upload a file to a complementary exam
 * @param {string} patientId - Patient ID
 * @param {string} examId - Exam ID
 * @param {File} file - File to upload
 * @param {string} [description] - Optional file description
 * @returns {Promise<Object>} Upload confirmation with file info
 */
export const uploadExamFile = async (patientId, examId, file, description = '') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const token = getAuthToken();
    const response = await fetch(`${baseURL}/medecin/patients/${patientId}/examens-complementaires/${examId}/fichiers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Don't set Content-Type for FormData, browser will set it automatically with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to upload file: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading exam file:', error);
    throw error;
  }
};

/**
 * Delete a file from a complementary exam
 * @param {string} patientId - Patient ID
 * @param {string} examId - Exam ID
 * @param {string} fileId - File ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteExamFile = async (patientId, examId, fileId) => {
  try {
    const response = await fetch(`${baseURL}/medecin/patients/${patientId}/examens-complementaires/${examId}/fichiers/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting exam file:', error);
    throw error;
  }
};

/**
 * Get download URL for an exam file
 * @param {string} patientId - Patient ID
 * @param {string} examId - Exam ID
 * @param {string} fileId - File ID
 * @returns {string} Download URL
 */
export const getExamFileDownloadUrl = (patientId, examId, fileId) => {
  const token = getAuthToken();
  return `${baseURL}/medecin/patients/${patientId}/examens-complementaires/${examId}/fichiers/${fileId}/download?token=${token}`;
};

/**
 * Download an exam file
 * @param {string} patientId - Patient ID
 * @param {string} examId - Exam ID
 * @param {string} fileId - File ID
 * @param {string} fileName - File name for download
 */
export const downloadExamFile = async (patientId, examId, fileId, fileName) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${baseURL}/medecin/patients/${patientId}/examens-complementaires/${examId}/fichiers/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }

    // Create blob from response
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading exam file:', error);
    throw error;
  }
};

/**
 * Exam types available
 */
export const EXAM_TYPES = [
  'Radiographie',
  'Scanner',
  'IRM',
  'Échographie',
  'ECG',
  'EEG',
  'Endoscopie',
  'Biopsie',
  'Analyse sanguine',
  'Analyse urinaire',
  'Autre'
];

/**
 * Validate exam data before submission
 * @param {Object} examData - Exam data to validate
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
export const validateExamData = (examData) => {
  const errors = [];

  if (!examData.typeExamen || examData.typeExamen.trim() === '') {
    errors.push('Type d\'examen requis');
  }

  if (!examData.dateDemande) {
    errors.push('Date de demande requise');
  }

  if (examData.dateRealisation && new Date(examData.dateRealisation) < new Date(examData.dateDemande)) {
    errors.push('La date de réalisation ne peut pas être antérieure à la date de demande');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if file type is allowed for upload
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if allowed
 */
export const isFileTypeAllowed = (mimeType) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return allowedTypes.includes(mimeType);
};

export default {
  getComplementaryExams,
  getComplementaryExamById,
  createComplementaryExam,
  updateComplementaryExam,
  deleteComplementaryExam,
  uploadExamFile,
  deleteExamFile,
  getExamFileDownloadUrl,
  downloadExamFile,
  EXAM_TYPES,
  validateExamData,
  formatFileSize,
  isFileTypeAllowed
};
