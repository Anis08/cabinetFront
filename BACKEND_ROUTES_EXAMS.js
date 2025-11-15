/**
 * BACKEND ROUTING FILE FOR COMPLEMENTARY EXAMS
 * 
 * This file should be placed in your backend project at:
 * backend/routes/examRoutes.js (or similar location)
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to your backend project
 * 2. Ensure you have the controller file with all the functions
 * 3. Install required dependencies: multer
 * 4. Import this in your main app.js/server.js file
 * 5. Add authentication middleware
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import your controller functions
// Adjust the path based on your project structure
const examController = require('../controllers/examController');

// Import authentication middleware
// Adjust the path based on your project structure
const { authenticateMedecin } = require('../middleware/auth');

// ============================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// ============================================

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/exams');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Allowed file types
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

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Formats acceptés: PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// ============================================
// EXAM ROUTES
// ============================================

/**
 * GET /medecin/exams/patient/:patientId
 * Get all complementary exams for a specific patient
 * 
 * Response:
 * {
 *   "examens": [...],
 *   "stats": {
 *     "total": 5,
 *     "types": {...}
 *   }
 * }
 */
router.get(
  '/exams/patient/:patientId',
  authenticateMedecin,
  examController.getComplementaryExams
);

/**
 * GET /medecin/exams/:id
 * Get a specific complementary exam by ID
 * 
 * Response:
 * {
 *   "examen": {...}
 * }
 */
router.get(
  '/exams/:id',
  authenticateMedecin,
  examController.getComplementaryExamById
);

/**
 * POST /medecin/exams
 * Create a new complementary exam
 * 
 * Body:
 * {
 *   "patientId": "string",
 *   "type": "string",
 *   "nom": "string",
 *   "description": "string",
 *   "dateExamen": "ISO date string",
 *   "prescripteur": "string",
 *   "resultat": "string" (optional),
 *   "notes": "string" (optional),
 *   "statut": "En attente" | "Effectué" | "Annulé"
 * }
 */
router.post(
  '/exams',
  authenticateMedecin,
  examController.createComplementaryExam
);

/**
 * PUT /medecin/exams/:id
 * Update an existing complementary exam
 * 
 * Body: Same as POST, all fields optional
 */
router.put(
  '/exams/:id',
  authenticateMedecin,
  examController.updateComplementaryExam
);

/**
 * DELETE /medecin/exams/:id
 * Delete a complementary exam and all associated files
 */
router.delete(
  '/exams/:id',
  authenticateMedecin,
  examController.deleteComplementaryExam
);

/**
 * POST /medecin/exams/:id/upload
 * Upload a file for a specific exam
 * 
 * Form data:
 * - file: The file to upload (multipart/form-data)
 * 
 * Response:
 * {
 *   "message": "Fichier téléchargé avec succès",
 *   "fichier": {...}
 * }
 */
router.post(
  '/exams/:id/upload',
  authenticateMedecin,
  upload.single('file'),
  examController.uploadExamFile
);

/**
 * DELETE /medecin/exams/:examId/files/:fileId
 * Delete a specific file from an exam
 */
router.delete(
  '/exams/:examId/files/:fileId',
  authenticateMedecin,
  examController.deleteExamFile
);

/**
 * GET /medecin/exams/:examId/files/:fileId/download
 * Download a specific file
 * 
 * This is a simple download endpoint that serves the file
 */
router.get(
  '/exams/:examId/files/:fileId/download',
  authenticateMedecin,
  async (req, res) => {
    try {
      const { examId, fileId } = req.params;
      const medecinId = req.medecinId;

      // Get the exam and verify ownership
      const examen = await prisma.examenComplementaire.findUnique({
        where: { id: examId },
        include: {
          patient: true,
          fichiers: {
            where: { id: fileId }
          }
        }
      });

      if (!examen || examen.patient.medecinId !== medecinId) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      const fichier = examen.fichiers[0];
      if (!fichier) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      // Serve the file
      const filePath = path.join(__dirname, '../uploads/exams', fichier.chemin);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier physique non trouvé' });
      }

      res.download(filePath, fichier.nomOriginal);
    } catch (error) {
      console.error('Erreur téléchargement fichier:', error);
      res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
    }
  }
);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Multer error handler
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Fichier trop volumineux. Taille maximale: 10MB'
      });
    }
    return res.status(400).json({
      error: `Erreur de téléchargement: ${error.message}`
    });
  }
  next(error);
});

module.exports = router;

// ============================================
// INTEGRATION INSTRUCTIONS
// ============================================

/**
 * In your main app.js or server.js file, add:
 * 
 * const examRoutes = require('./routes/examRoutes');
 * app.use('/medecin', examRoutes);
 * 
 * Make sure this comes AFTER:
 * - Body parser middleware (express.json())
 * - CORS configuration
 * - Authentication middleware setup
 * 
 * Example:
 * 
 * const express = require('express');
 * const cors = require('cors');
 * const app = express();
 * 
 * app.use(cors());
 * app.use(express.json());
 * app.use(express.urlencoded({ extended: true }));
 * 
 * // Routes
 * const examRoutes = require('./routes/examRoutes');
 * app.use('/medecin', examRoutes);
 * 
 * app.listen(4000, () => {
 *   console.log('Server running on port 4000');
 * });
 */
