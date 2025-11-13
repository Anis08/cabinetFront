/**
 * Complementary Exams Service
 * API service for managing complementary medical exams and files
 * Adapted to match Prisma schema: ComplementaryExam and ExamFile models
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
 * Endpoint: GET /medecin/complementary-exams/patient/:patientId
 * @param {number} patientId - Patient ID
 * @returns {Promise<Object>} Response with exams list and statistics
 * Response format: { exams: [], statistics: { total, completed, pending } }
 */
export const getComplementaryExams = async (patientId) => {
  try {
    const response = await fetch(`${baseURL}/medecin/complementary-exams/patient/${patientId}`, {
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
 * Endpoint: GET /medecin/complementary-exams/:examId
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} Exam details with files
 * Response format: { exam: { id, patientId, type, description, date, files: [...] } }
 */
export const getComplementaryExamById = async (examId) => {
  try {
    const response = await fetch(`${baseURL}/medecin/complementary-exams/${examId}`, {
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
 * Endpoint: POST /medecin/complementary-exams
 * @param {Object} examData - Exam data
 * @param {number} examData.patientId - Patient ID (required)
 * @param {string} examData.type - Exam type (required)
 * @param {string} examData.description - Exam description (required)
 * @param {string} examData.date - Exam date ISO string (required)
 * @returns {Promise<Object>} Created exam
 * Response format: { message, exam: { id, patientId, type, description, date, ... } }
 */
export const createComplementaryExam = async (examData) => {
  try {
    const response = await fetch(`${baseURL}/medecin/complementary-exams`, {
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
 * Endpoint: PUT /medecin/complementary-exams/:examId
 * @param {number} examId - Exam ID
 * @param {Object} examData - Updated exam data
 * @param {string} [examData.type] - Exam type
 * @param {string} [examData.description] - Exam description
 * @param {string} [examData.date] - Exam date ISO string
 * @returns {Promise<Object>} Updated exam
 * Response format: { message, exam: { id, patientId, type, description, date, ... } }
 */
export const updateComplementaryExam = async (examId, examData) => {
  try {
    const response = await fetch(`${baseURL}/medecin/complementary-exams/${examId}`, {
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
 * Endpoint: DELETE /medecin/complementary-exams/:examId
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} Deletion confirmation
 * Response format: { message, deletedFiles: number }
 */
export const deleteComplementaryExam = async (examId) => {
  try {
    const response = await fetch(`${baseURL}/medecin/complementary-exams/${examId}`, {
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
 * Endpoint: POST /medecin/complementary-exams/:examId/files
 * @param {number} examId - Exam ID
 * @param {File} file - File to upload
 * @param {string} [description] - Optional file description
 * @returns {Promise<Object>} Upload confirmation with file info
 * Response format: { message, file: { id, examId, fileName, fileUrl, fileType, fileSize, uploadDate } }
 */
export const uploadExamFile = async (examId, file, description = '') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    const token = getAuthToken();
    const response = await fetch(`${baseURL}/medecin/complementary-exams/${examId}/files`, {
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
 * Endpoint: DELETE /medecin/complementary-exams/:examId/files/:fileId
 * @param {number} examId - Exam ID
 * @param {number} fileId - File ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 * Response format: { message }
 */
export const deleteExamFile = async (examId, fileId) => {
  try {
    const response = await fetch(`${baseURL}/medecin/complementary-exams/${examId}/files/${fileId}`, {
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
 * @param {number} examId - Exam ID
 * @param {number} fileId - File ID
 * @returns {string} Download URL
 */
export const getExamFileDownloadUrl = (examId, fileId) => {
  const token = getAuthToken();
  return `${baseURL}/medecin/complementary-exams/${examId}/files/${fileId}/download?token=${token}`;
};

/**
 * Download an exam file
 * Endpoint: GET /medecin/complementary-exams/:examId/files/:fileId/download
 * @param {number} examId - Exam ID
 * @param {number} fileId - File ID
 * @param {string} fileName - File name for download
 */
export const downloadExamFile = async (examId, fileId, fileName) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${baseURL}/medecin/complementary-exams/${examId}/files/${fileId}/download`, {
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
 * Exam types available (based on common medical exams)
 */
export const EXAM_TYPES = [
  'Radiographie',
  'Scanner',
  'IRM',
  'Échographie',
  'Échographie rénale',
  'Échographie abdominale',
  'Échographie cardiaque',
  'ECG',
  'EEG',
  'Endoscopie',
  'Coloscopie',
  'Gastroscopie',
  'Biopsie',
  'Mammographie',
  'Doppler',
  'Scintigraphie',
  'PET Scan',
  'Analyse sanguine',
  'Analyse urinaire',
  'Test d\'effort',
  'Spirométrie',
  'Autre'
];

/**
 * Validate exam data before submission
 * @param {Object} examData - Exam data to validate
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
export const validateExamData = (examData) => {
  const errors = [];

  if (!examData.type || examData.type.trim() === '') {
    errors.push('Type d\'examen requis');
  }

  if (!examData.description || examData.description.trim() === '') {
    errors.push('Description requise');
  }

  if (!examData.date) {
    errors.push('Date de l\'examen requise');
  }

  if (!examData.patientId || isNaN(parseInt(examData.patientId))) {
    errors.push('ID patient invalide');
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
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/dicom', // For medical imaging (DICOM files)
    'application/zip'
  ];
  return allowedTypes.includes(mimeType);
};

/**
 * Transform exam data from backend format to component format
 * @param {Object} exam - Exam from backend
 * @returns {Object} Transformed exam
 */
export const transformExamFromBackend = (exam) => {
  return {
    id: exam.id,
    patientId: exam.patientId,
    typeExamen: exam.type,
    date: exam.date,
    description: exam.description,
    resultats: exam.description, // Map description to resultats for compatibility
    observations: '', // Can be added to schema later if needed
    fichiers: exam.files ? exam.files.map(file => ({
      id: file.id,
      nomFichier: file.fileName,
      cheminFichier: file.fileUrl,
      typeFichier: file.fileType,
      tailleFichier: file.fileSize,
      uploadDate: file.uploadDate
    })) : [],
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt
  };
};

/**
 * Transform exam data from component format to backend format
 * @param {Object} examData - Exam from component
 * @returns {Object} Transformed exam for backend
 */
export const transformExamToBackend = (examData) => {
  return {
    patientId: parseInt(examData.patientId),
    type: examData.typeExamen || examData.type,
    description: examData.resultats || examData.description,
    date: examData.date
  };
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
  isFileTypeAllowed,
  transformExamFromBackend,
  transformExamToBackend
};
