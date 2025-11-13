# 🔬 API Endpoints - Examens Complémentaires

## 📋 Vue d'ensemble

Ce document décrit tous les endpoints API nécessaires pour le système de gestion des examens complémentaires, basés sur le modèle Prisma fourni.

## 🗄️ Modèle de Base de Données (Prisma)

```prisma
model ComplementaryExam {
  id          Int         @id @default(autoincrement())
  patientId   Int
  type        String      // Type of exam (Échographie rénale, Scanner/IRM, etc.)
  description String      @db.Text
  date        DateTime
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  patient     Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  files       ExamFile[]
}

model ExamFile {
  id        Int      @id @default(autoincrement())
  examId    Int
  fileName  String
  fileUrl   String
  fileType  String   // MIME type
  fileSize  Int      // Size in bytes
  uploadDate DateTime @default(now())
  
  exam      ComplementaryExam @relation(fields: [examId], references: [id], onDelete: Cascade)
}
```

## 🔑 Authentication

Tous les endpoints nécessitent un token JWT dans le header:
```
Authorization: Bearer {token}
```

Le token est récupéré depuis `localStorage.getItem('token')`

## 📡 Base URL

```
http://localhost:4000
```

Configurable via `VITE_API_BASE_URL` dans `.env`

---

## 📋 Endpoints - Examens

### 1. GET /medecin/complementary-exams/patient/:patientId

**Description:** Récupérer tous les examens d'un patient avec statistiques

**Paramètres URL:**
- `patientId` (number, required) - ID du patient

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Réponse Success (200):**
```json
{
  "exams": [
    {
      "id": 1,
      "patientId": 123,
      "type": "Échographie rénale",
      "description": "Contrôle post-opératoire...",
      "date": "2024-11-10T00:00:00.000Z",
      "createdAt": "2024-11-01T10:00:00.000Z",
      "updatedAt": "2024-11-01T10:00:00.000Z",
      "files": [
        {
          "id": 1,
          "examId": 1,
          "fileName": "resultat_echo.pdf",
          "fileUrl": "/uploads/exams/1234567890_resultat_echo.pdf",
          "fileType": "application/pdf",
          "fileSize": 1024000,
          "uploadDate": "2024-11-01T10:30:00.000Z"
        }
      ]
    }
  ],
  "statistics": {
    "total": 10,
    "completed": 8,
    "pending": 2
  }
}
```

**Réponse Error (404):**
```json
{
  "error": "Patient non trouvé"
}
```

---

### 2. GET /medecin/complementary-exams/:examId

**Description:** Récupérer un examen spécifique par ID

**Paramètres URL:**
- `examId` (number, required) - ID de l'examen

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Réponse Success (200):**
```json
{
  "exam": {
    "id": 1,
    "patientId": 123,
    "type": "Scanner thoracique",
    "description": "Scanner effectué pour...",
    "date": "2024-11-10T00:00:00.000Z",
    "createdAt": "2024-11-01T10:00:00.000Z",
    "updatedAt": "2024-11-01T10:00:00.000Z",
    "files": [...]
  }
}
```

**Réponse Error (404):**
```json
{
  "error": "Examen non trouvé"
}
```

---

### 3. POST /medecin/complementary-exams

**Description:** Créer un nouvel examen complémentaire

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "patientId": 123,
  "type": "IRM cérébrale",
  "description": "IRM de contrôle suite à...",
  "date": "2024-11-15T00:00:00.000Z"
}
```

**Validation:**
- `patientId`: required, number, must exist in database
- `type`: required, string, max 255 chars
- `description`: required, string (Text field)
- `date`: required, ISO 8601 date string

**Réponse Success (201):**
```json
{
  "message": "Examen créé avec succès",
  "exam": {
    "id": 15,
    "patientId": 123,
    "type": "IRM cérébrale",
    "description": "IRM de contrôle suite à...",
    "date": "2024-11-15T00:00:00.000Z",
    "createdAt": "2024-11-13T14:30:00.000Z",
    "updatedAt": "2024-11-13T14:30:00.000Z",
    "files": []
  }
}
```

**Réponse Error (400):**
```json
{
  "error": "Données invalides",
  "details": {
    "type": "Type d'examen requis",
    "description": "Description requise"
  }
}
```

---

### 4. PUT /medecin/complementary-exams/:examId

**Description:** Mettre à jour un examen existant

**Paramètres URL:**
- `examId` (number, required) - ID de l'examen

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "type": "IRM cérébrale (modifié)",
  "description": "Description mise à jour...",
  "date": "2024-11-16T00:00:00.000Z"
}
```

**Note:** Le `patientId` ne peut pas être modifié (immutable)

**Réponse Success (200):**
```json
{
  "message": "Examen mis à jour avec succès",
  "exam": {
    "id": 15,
    "patientId": 123,
    "type": "IRM cérébrale (modifié)",
    "description": "Description mise à jour...",
    "date": "2024-11-16T00:00:00.000Z",
    "createdAt": "2024-11-13T14:30:00.000Z",
    "updatedAt": "2024-11-13T15:00:00.000Z",
    "files": [...]
  }
}
```

**Réponse Error (404):**
```json
{
  "error": "Examen non trouvé"
}
```

---

### 5. DELETE /medecin/complementary-exams/:examId

**Description:** Supprimer un examen et tous ses fichiers associés

**Paramètres URL:**
- `examId` (number, required) - ID de l'examen

**Headers:**
```
Authorization: Bearer {token}
```

**Comportement:**
- Supprime l'examen de la base de données
- Supprime tous les fichiers associés (ExamFile records)
- Supprime les fichiers physiques du serveur
- Cascade delete grâce à `onDelete: Cascade` dans Prisma

**Réponse Success (200):**
```json
{
  "message": "Examen et fichiers supprimés avec succès",
  "deletedFiles": 3
}
```

**Réponse Error (404):**
```json
{
  "error": "Examen non trouvé"
}
```

---

## 📁 Endpoints - Fichiers

### 6. POST /medecin/complementary-exams/:examId/files

**Description:** Uploader un fichier pour un examen

**Paramètres URL:**
- `examId` (number, required) - ID de l'examen

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (File, required) - Le fichier à uploader
- `description` (string, optional) - Description du fichier

**Validation:**
- Types acceptés: `image/jpeg`, `image/png`, `image/gif`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/dicom`
- Taille maximum: 10 MB
- Le fichier est sauvegardé dans `/uploads/exams/` avec nom unique

**Réponse Success (201):**
```json
{
  "message": "Fichier uploadé avec succès",
  "file": {
    "id": 25,
    "examId": 15,
    "fileName": "resultat_irm.pdf",
    "fileUrl": "/uploads/exams/1699876543210_resultat_irm.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048000,
    "uploadDate": "2024-11-13T15:30:00.000Z"
  }
}
```

**Réponse Error (400):**
```json
{
  "error": "Type de fichier non autorisé"
}
```

**Réponse Error (413):**
```json
{
  "error": "Fichier trop volumineux (max 10 MB)"
}
```

---

### 7. DELETE /medecin/complementary-exams/:examId/files/:fileId

**Description:** Supprimer un fichier d'un examen

**Paramètres URL:**
- `examId` (number, required) - ID de l'examen
- `fileId` (number, required) - ID du fichier

**Headers:**
```
Authorization: Bearer {token}
```

**Comportement:**
- Vérifie que le fichier appartient bien à l'examen spécifié
- Supprime le fichier physique du serveur
- Supprime l'enregistrement de la base de données

**Réponse Success (200):**
```json
{
  "message": "Fichier supprimé avec succès"
}
```

**Réponse Error (404):**
```json
{
  "error": "Fichier non trouvé"
}
```

---

### 8. GET /medecin/complementary-exams/:examId/files/:fileId/download

**Description:** Télécharger un fichier

**Paramètres URL:**
- `examId` (number, required) - ID de l'examen
- `fileId` (number, required) - ID du fichier

**Headers:**
```
Authorization: Bearer {token}
```

**Réponse Success (200):**
- Content-Type: Le MIME type du fichier
- Content-Disposition: `attachment; filename="nom_fichier.ext"`
- Body: Le contenu binaire du fichier

**Réponse Error (404):**
```json
{
  "error": "Fichier non trouvé"
}
```

---

## 🔒 Sécurité & Validation

### Authentication
```javascript
// Middleware d'authentification requis
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.userId = user.id;
    next();
  });
};
```

### Validation des Données
```javascript
// Exemple de validation pour création
const validateExamData = (data) => {
  const errors = {};
  
  if (!data.patientId || isNaN(parseInt(data.patientId))) {
    errors.patientId = 'ID patient invalide';
  }
  
  if (!data.type || data.type.trim() === '') {
    errors.type = 'Type d\'examen requis';
  }
  
  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description requise';
  }
  
  if (!data.date) {
    errors.date = 'Date requise';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};
```

### Upload de Fichiers (Multer)
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/exams/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/dicom'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: fileFilter
});
```

---

## 📝 Exemples de Requêtes

### Curl - Créer un examen
```bash
curl -X POST http://localhost:4000/medecin/complementary-exams \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "type": "Scanner thoracique",
    "description": "Scanner de contrôle post-opératoire",
    "date": "2024-11-15T00:00:00.000Z"
  }'
```

### Curl - Upload un fichier
```bash
curl -X POST http://localhost:4000/medecin/complementary-exams/15/files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/resultat.pdf" \
  -F "description=Résultat du scanner"
```

### JavaScript Fetch - Récupérer les examens
```javascript
const response = await fetch(
  'http://localhost:4000/medecin/complementary-exams/patient/123',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data.exams);
```

---

## 🗂️ Structure des Dossiers Backend

```
backend/
├── controllers/
│   └── complementaryExamsController.js
├── routes/
│   └── complementaryExams.js
├── middleware/
│   └── auth.js
├── uploads/
│   └── exams/              # Fichiers uploadés
├── prisma/
│   └── schema.prisma
└── utils/
    └── fileHelper.js
```

---

## ✅ Checklist d'Implémentation

### Backend
- [ ] Créer `complementaryExamsController.js` avec les 8 fonctions
- [ ] Créer les routes dans `routes/complementaryExams.js`
- [ ] Configurer Multer pour l'upload de fichiers
- [ ] Créer le dossier `uploads/exams/` avec permissions d'écriture
- [ ] Ajouter middleware d'authentification
- [ ] Implémenter la validation des données
- [ ] Gérer la suppression des fichiers physiques
- [ ] Tester tous les endpoints avec Postman

### Base de Données
- [ ] Les modèles `ComplementaryExam` et `ExamFile` sont déjà dans le schema
- [ ] Pas de migration nécessaire si déjà appliquée

### Frontend
- [x] Service API créé (`complementaryExamsService.js`)
- [x] Composants créés (ExamModal, ExamCard, etc.)
- [x] Intégration dans PatientProfile
- [ ] Test après implémentation backend

---

## 🔍 Tests Postman

Collection Postman disponible pour tester les endpoints:

1. Importer la collection
2. Configurer la variable `{{baseUrl}}` = `http://localhost:4000`
3. Configurer la variable `{{token}}` avec votre JWT
4. Exécuter les requêtes dans l'ordre

---

**Version:** 1.0.0  
**Date:** 13 Novembre 2024  
**Status:** ✅ READY FOR BACKEND IMPLEMENTATION  
**Auteur:** GenSpark AI Developer
