# Complementary Exams API Documentation

Complete documentation for the Complementary Exams (Examens Complémentaires) feature including CRUD operations and file management.

## 📋 Table of Contents

- [Overview](#overview)
- [Backend Setup](#backend-setup)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Database Schema](#database-schema)
- [File Management](#file-management)
- [Error Handling](#error-handling)
- [Testing](#testing)

## 🎯 Overview

The Complementary Exams feature allows doctors to:
- Create, read, update, and delete complementary exams for patients
- Upload and manage files (images, PDFs, documents) for each exam
- Track exam types, dates, prescribers, results, and status
- View statistics about exams by type

### Key Features

- ✅ Full CRUD operations for exams
- ✅ Multi-file upload support (PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX)
- ✅ File size validation (max 10MB per file)
- ✅ File type validation
- ✅ Upload progress tracking
- ✅ Secure file storage
- ✅ Patient ownership verification
- ✅ Automatic file cleanup on exam deletion

## 🔧 Backend Setup

### Prerequisites

```bash
npm install multer
```

### Directory Structure

```
backend/
├── controllers/
│   └── examController.js       # Controller functions (provided by user)
├── routes/
│   └── examRoutes.js          # Route definitions (see BACKEND_ROUTES_EXAMS.js)
├── middleware/
│   └── auth.js                # Authentication middleware
├── uploads/
│   └── exams/                 # File upload directory (auto-created)
└── prisma/
    └── schema.prisma          # Database schema
```

### Integration Steps

1. **Copy Route File**
   ```bash
   cp BACKEND_ROUTES_EXAMS.js backend/routes/examRoutes.js
   ```

2. **Update Main Server File** (`server.js` or `app.js`)
   ```javascript
   const examRoutes = require('./routes/examRoutes');
   app.use('/medecin', examRoutes);
   ```

3. **Ensure Uploads Directory Exists**
   ```bash
   mkdir -p backend/uploads/exams
   ```

4. **Update Prisma Schema** (see Database Schema section below)

5. **Run Migrations**
   ```bash
   npx prisma migrate dev --name add_complementary_exams
   ```

## 📡 API Endpoints

All endpoints require authentication via Bearer token.

### 1. Get Patient Exams

**GET** `/medecin/exams/patient/:patientId`

Get all complementary exams for a specific patient with statistics.

**Parameters:**
- `patientId` (path) - Patient ID

**Response:**
```json
{
  "examens": [
    {
      "id": "exam_123",
      "type": "Radiographie",
      "nom": "Radio thorax face et profil",
      "description": "Radio du thorax pour suspicion de pneumonie",
      "dateExamen": "2024-11-12T00:00:00.000Z",
      "prescripteur": "Dr. Martin LEROY",
      "resultat": "Infiltrat visible lobe inférieur droit",
      "notes": "Contrôle dans 2 semaines",
      "statut": "Effectué",
      "patientId": "patient_456",
      "fichiers": [
        {
          "id": "file_789",
          "nomOriginal": "radio_thorax.pdf",
          "chemin": "radio_thorax-1699876543210.pdf",
          "typeMime": "application/pdf",
          "taille": 2048576,
          "dateUpload": "2024-11-12T10:30:00.000Z"
        }
      ],
      "createdAt": "2024-11-12T09:00:00.000Z",
      "updatedAt": "2024-11-12T10:30:00.000Z"
    }
  ],
  "stats": {
    "total": 5,
    "types": {
      "Radiographie": 2,
      "Échographie": 1,
      "Analyse sanguine": 2
    }
  }
}
```

### 2. Get Single Exam

**GET** `/medecin/exams/:id`

Get a specific exam by ID.

**Parameters:**
- `id` (path) - Exam ID

**Response:**
```json
{
  "examen": {
    "id": "exam_123",
    "type": "Radiographie",
    "nom": "Radio thorax face et profil",
    // ... full exam details with fichiers array
  }
}
```

### 3. Create Exam

**POST** `/medecin/exams`

Create a new complementary exam.

**Request Body:**
```json
{
  "patientId": "patient_456",
  "type": "Radiographie",
  "nom": "Radio thorax face et profil",
  "description": "Radio du thorax pour suspicion de pneumonie",
  "dateExamen": "2024-11-12T00:00:00.000Z",
  "prescripteur": "Dr. Martin LEROY",
  "resultat": "Infiltrat visible lobe inférieur droit",
  "notes": "Contrôle dans 2 semaines",
  "statut": "Effectué"
}
```

**Required Fields:**
- `patientId`
- `type`
- `nom`
- `description`
- `dateExamen`
- `prescripteur`
- `statut` (one of: "En attente", "Effectué", "Annulé")

**Optional Fields:**
- `resultat`
- `notes`

**Response:**
```json
{
  "examen": {
    "id": "exam_123",
    // ... full exam details
  }
}
```

### 4. Update Exam

**PUT** `/medecin/exams/:id`

Update an existing exam.

**Parameters:**
- `id` (path) - Exam ID

**Request Body:** (all fields optional)
```json
{
  "type": "Radiographie",
  "nom": "Radio thorax face et profil",
  "description": "Updated description",
  "statut": "Effectué",
  "resultat": "New results",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "examen": {
    "id": "exam_123",
    // ... updated exam details
  }
}
```

### 5. Delete Exam

**DELETE** `/medecin/exams/:id`

Delete an exam and all associated files.

**Parameters:**
- `id` (path) - Exam ID

**Response:**
```json
{
  "message": "Examen et fichiers supprimés avec succès"
}
```

### 6. Upload File

**POST** `/medecin/exams/:id/upload`

Upload a file for an exam.

**Parameters:**
- `id` (path) - Exam ID

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**File Constraints:**
- Max size: 10MB
- Allowed types: PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX

**Response:**
```json
{
  "message": "Fichier téléchargé avec succès",
  "fichier": {
    "id": "file_789",
    "nomOriginal": "radio_thorax.pdf",
    "chemin": "radio_thorax-1699876543210.pdf",
    "typeMime": "application/pdf",
    "taille": 2048576,
    "dateUpload": "2024-11-12T10:30:00.000Z",
    "examenId": "exam_123"
  }
}
```

### 7. Delete File

**DELETE** `/medecin/exams/:examId/files/:fileId`

Delete a specific file from an exam.

**Parameters:**
- `examId` (path) - Exam ID
- `fileId` (path) - File ID

**Response:**
```json
{
  "message": "Fichier supprimé avec succès"
}
```

### 8. Download File

**GET** `/medecin/exams/:examId/files/:fileId/download`

Download a specific file.

**Parameters:**
- `examId` (path) - Exam ID
- `fileId` (path) - File ID

**Response:**
- File download (Content-Disposition: attachment)

## 🎨 Frontend Integration

### Component Structure

```
src/
├── components/
│   └── Exams/
│       └── ExamsList.jsx        # Main exams component
├── services/
│   └── examsAPI.js              # API service functions
└── pages/
    └── PatientProfile.tsx       # Integrated here
```

### Usage

```jsx
import ExamsList from '../components/Exams/ExamsList';

function PatientProfile() {
  const { patientId } = useParams();
  
  return (
    <div>
      {/* Other patient sections */}
      
      <ExamsList patientId={patientId} />
    </div>
  );
}
```

### Available Service Functions

```javascript
import {
  getPatientExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  uploadExamFile,
  deleteExamFile,
  downloadExamFile,
  validateFile,
  formatFileSize,
  getFileIcon
} from '../services/examsAPI';
```

## 🗄️ Database Schema

### Prisma Schema

```prisma
model ExamenComplementaire {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  type          String   // Radiographie, Échographie, IRM, etc.
  nom           String   // Nom de l'examen
  description   String   // Description détaillée
  dateExamen    DateTime // Date de l'examen
  prescripteur  String   // Nom du prescripteur
  resultat      String?  // Résultats de l'examen (optionnel)
  notes         String?  // Notes additionnelles (optionnel)
  statut        String   // "En attente", "Effectué", "Annulé"
  
  patientId     String   @db.ObjectId
  patient       Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  fichiers      FichierExamen[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model FichierExamen {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  nomOriginal  String   // Original filename
  chemin       String   // Stored filename
  typeMime     String   // MIME type
  taille       Int      // File size in bytes
  dateUpload   DateTime @default(now())
  
  examenId     String   @db.ObjectId
  examen       ExamenComplementaire @relation(fields: [examenId], references: [id], onDelete: Cascade)
}

// Add to existing Patient model:
model Patient {
  id                    String                    @id @default(auto()) @map("_id") @db.ObjectId
  // ... existing fields ...
  examensComplementaires ExamenComplementaire[]
}
```

### Migration

```bash
npx prisma migrate dev --name add_complementary_exams
npx prisma generate
```

## 📁 File Management

### Storage Strategy

Files are stored in `backend/uploads/exams/` with unique filenames:
- Format: `{originalName}-{timestamp}-{randomNumber}.{extension}`
- Example: `radio_thorax-1699876543210-123456789.pdf`

### Upload Flow

1. **Frontend**: User selects file
2. **Frontend**: Validate file (type, size)
3. **Frontend**: Create FormData and upload with progress tracking
4. **Backend**: Multer middleware processes upload
5. **Backend**: Validate file again
6. **Backend**: Save to disk and database
7. **Frontend**: Reload exams list

### Cleanup

Files are automatically deleted when:
- An exam is deleted (all associated files)
- A specific file is deleted
- Uses `fs.unlinkSync()` for synchronous deletion

## ⚠️ Error Handling

### Common Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation Error | Missing required fields or invalid data |
| 403 | Access Denied | Doctor doesn't own the patient |
| 404 | Not Found | Exam or file not found |
| 413 | File Too Large | File exceeds 10MB limit |
| 415 | Unsupported Media Type | Invalid file type |
| 500 | Server Error | Database or filesystem error |

### Frontend Error Handling

```javascript
try {
  await createExam(examData);
  // Success handling
} catch (error) {
  // Error message is already formatted from backend
  console.error('Error:', error.message);
  alert(error.message);
}
```

## 🧪 Testing

### Manual Testing Checklist

#### Exam CRUD Operations
- [ ] Create exam with all required fields
- [ ] Create exam with optional fields
- [ ] View exam list for patient
- [ ] View single exam details
- [ ] Update exam information
- [ ] Delete exam (verify files are also deleted)
- [ ] Try to access another doctor's patient exams (should fail)

#### File Management
- [ ] Upload PDF file
- [ ] Upload image file (JPG, PNG, GIF)
- [ ] Upload document file (DOC, DOCX, XLS, XLSX)
- [ ] Try to upload file > 10MB (should fail)
- [ ] Try to upload unsupported file type (should fail)
- [ ] Download file
- [ ] Delete file
- [ ] Delete exam and verify all files are deleted

#### UI/UX
- [ ] Upload progress indicator works
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] File icons display correctly based on type
- [ ] File size formatting is readable
- [ ] Statistics show correct counts

### API Testing with curl

```bash
# Get patient exams
curl -X GET http://localhost:4000/medecin/exams/patient/PATIENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create exam
curl -X POST http://localhost:4000/medecin/exams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_ID",
    "type": "Radiographie",
    "nom": "Test Radio",
    "description": "Test description",
    "dateExamen": "2024-11-12",
    "prescripteur": "Dr. Test",
    "statut": "En attente"
  }'

# Upload file
curl -X POST http://localhost:4000/medecin/exams/EXAM_ID/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf"

# Download file
curl -X GET http://localhost:4000/medecin/exams/EXAM_ID/files/FILE_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded_file.pdf
```

## 🚀 Deployment Checklist

- [ ] Backend routes integrated into main server
- [ ] Prisma migrations applied
- [ ] Uploads directory created with proper permissions
- [ ] Environment variables configured
- [ ] Frontend build includes new components
- [ ] File size limits configured for production
- [ ] CORS settings allow file uploads
- [ ] SSL configured for secure file transfers
- [ ] Backup strategy for uploaded files
- [ ] Monitoring for disk space usage

## 📝 Notes

- All dates are stored in ISO 8601 format
- File paths are stored relative to uploads directory
- Patient ownership is verified on all operations
- Cascade delete ensures no orphaned files or records
- Upload progress is tracked using XMLHttpRequest
- File validation happens both frontend and backend

## 🔗 Related Documentation

- [BACKEND_ROUTES_EXAMS.js](./BACKEND_ROUTES_EXAMS.js) - Complete route definitions
- [src/services/examsAPI.js](./src/services/examsAPI.js) - Frontend service functions
- [src/components/Exams/ExamsList.jsx](./src/components/Exams/ExamsList.jsx) - UI component

## 📞 Support

For issues or questions about the Complementary Exams feature:
1. Check error messages in browser console
2. Verify backend logs
3. Ensure all migrations are applied
4. Check file permissions on uploads directory
5. Verify authentication token is valid
