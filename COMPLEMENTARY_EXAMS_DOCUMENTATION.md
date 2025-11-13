# 🔬 Examens Complémentaires - Documentation Complète

## 📋 Vue d'ensemble

Le système de gestion des examens complémentaires permet aux médecins de créer, gérer et stocker tous les examens médicaux des patients avec leurs fichiers associés (résultats, images, documents).

## 🎯 Fonctionnalités

### ✅ Gestion Complète des Examens
- **CRUD complet** : Créer, lire, modifier et supprimer des examens
- **Types d'examens variés** : Radiographie, Scanner, IRM, Échographie, ECG, EEG, Endoscopie, Biopsie, Analyses, etc.
- **Dates multiples** : Date de demande et date de réalisation
- **Résultats et observations** : Zones de texte pour documenter les résultats
- **Statistiques en temps réel** : Total, en attente, réalisés

### 📁 Gestion des Fichiers
- **Upload drag & drop** : Interface moderne pour ajouter des fichiers
- **Types de fichiers acceptés** : JPG, PNG, GIF, PDF, DOC, DOCX
- **Taille maximum** : 10 MB par fichier
- **Prévisualisation** : Affichage des images et PDFs
- **Téléchargement** : Un clic pour télécharger n'importe quel fichier
- **Description optionnelle** : Ajouter une description à chaque fichier
- **Suppression** : Supprime le fichier du serveur et de la base de données

### 🔍 Recherche et Filtres
- **Recherche textuelle** : Par type d'examen, résultats, observations
- **Filtres par statut** : Tous / En attente / Réalisés
- **Actualisation** : Bouton pour recharger les données

### 🎨 Interface Utilisateur
- **Design moderne** : Cards avec animations Framer Motion
- **Responsive** : Adapté mobile et desktop
- **Accordéons** : Expand/collapse pour voir les détails
- **Statistiques visuelles** : 3 cartes avec gradient (Total, En attente, Réalisés)
- **États de chargement** : Spinners et messages d'état
- **Gestion d'erreurs** : Messages clairs et retry

## 🏗️ Architecture

### Composants Frontend

#### 1. **ComplementaryExamsSection.jsx**
Composant principal qui gère l'affichage et l'orchestration de tous les examens.

**Props:**
- `patientId` (string, required) - ID du patient

**État:**
- `exams` - Liste des examens
- `filteredExams` - Examens après application des filtres
- `statistics` - Statistiques (total, enAttente, realises)
- `searchTerm` - Terme de recherche
- `statusFilter` - Filtre de statut (all/pending/completed)

**Fonctionnalités:**
- Chargement automatique des examens au montage
- Recherche et filtrage en temps réel
- Gestion des modales (création/édition, upload de fichiers)
- Actualisation des données

#### 2. **ExamCard.jsx**
Composant pour afficher un examen individuel avec accordéon.

**Props:**
- `exam` (object, required) - Données de l'examen
- `patientId` (string, required) - ID du patient
- `onEdit` (function) - Callback pour éditer
- `onDelete` (function) - Callback pour supprimer
- `onFileUpload` (function) - Callback pour ajouter un fichier
- `onRefresh` (function) - Callback pour actualiser

**Affichage:**
- Type d'examen et dates
- Nombre de fichiers joints
- Boutons d'action (Modifier, Supprimer, Expand)
- Contenu expandable avec résultats, observations, fichiers
- Actions sur fichiers (Télécharger, Supprimer)

#### 3. **ExamModal.jsx**
Modal pour créer ou éditer un examen.

**Props:**
- `isOpen` (boolean) - État d'ouverture
- `onClose` (function) - Fermer le modal
- `patientId` (string) - ID du patient
- `exam` (object, optional) - Examen à éditer (null = création)
- `onSuccess` (function) - Callback après succès

**Champs du formulaire:**
- Type d'examen (select avec option personnalisée)
- Date de demande (required)
- Date de réalisation (optional)
- Résultats (textarea)
- Observations (textarea)

**Validation:**
- Type d'examen obligatoire
- Date de demande obligatoire
- Date de réalisation doit être >= date de demande

#### 4. **FileUploadModal.jsx**
Modal pour uploader des fichiers vers un examen.

**Props:**
- `isOpen` (boolean) - État d'ouverture
- `onClose` (function) - Fermer le modal
- `patientId` (string) - ID du patient
- `exam` (object) - Examen cible
- `onSuccess` (function) - Callback après succès

**Fonctionnalités:**
- Drag & drop ou click pour sélectionner
- Validation du type de fichier
- Validation de la taille (max 10MB)
- Description optionnelle
- Aperçu du fichier sélectionné

### Service API

#### **complementaryExamsService.js**
Service complet pour toutes les opérations API.

**Fonctions principales:**

```javascript
// Récupérer tous les examens d'un patient
getComplementaryExams(patientId)
// Retourne: { examens: [...], statistiques: {...} }

// Récupérer un examen spécifique
getComplementaryExamById(patientId, examId)
// Retourne: { examen: {...} }

// Créer un nouvel examen
createComplementaryExam(patientId, examData)
// examData: { typeExamen, dateDemande, dateRealisation?, resultats?, observations? }
// Retourne: { examen: {...} }

// Modifier un examen
updateComplementaryExam(patientId, examId, examData)
// Retourne: { examen: {...} }

// Supprimer un examen (et tous ses fichiers)
deleteComplementaryExam(patientId, examId)
// Retourne: { message, deletedFiles }

// Uploader un fichier
uploadExamFile(patientId, examId, file, description?)
// Retourne: { fichier: {...} }

// Supprimer un fichier
deleteExamFile(patientId, examId, fileId)
// Retourne: { message }

// Télécharger un fichier
downloadExamFile(patientId, examId, fileId, fileName)
// Lance le téléchargement dans le navigateur
```

**Utilitaires:**

```javascript
// Types d'examens disponibles
EXAM_TYPES = ['Radiographie', 'Scanner', 'IRM', 'Échographie', ...]

// Valider les données d'examen
validateExamData(examData)
// Retourne: { valid: boolean, errors: string[] }

// Formater la taille de fichier
formatFileSize(bytes)
// Retourne: "1.5 MB"

// Vérifier si type de fichier autorisé
isFileTypeAllowed(mimeType)
// Retourne: boolean
```

## 🔌 Endpoints Backend

### Base URL
```
http://localhost:4000
```

### Authentication
Tous les endpoints requièrent un token JWT dans le header:
```
Authorization: Bearer {token}
```

### Endpoints

#### 1. **GET** `/medecin/patients/:patientId/examens-complementaires`
Récupère tous les examens d'un patient avec statistiques.

**Réponse:**
```json
{
  "examens": [
    {
      "id": "exam_id",
      "typeExamen": "Scanner",
      "dateDemande": "2024-11-01T00:00:00.000Z",
      "dateRealisation": "2024-11-05T00:00:00.000Z",
      "resultats": "RAS",
      "observations": "...",
      "fichiers": [...],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "statistiques": {
    "total": 5,
    "enAttente": 2,
    "realises": 3
  }
}
```

#### 2. **GET** `/medecin/patients/:patientId/examens-complementaires/:examId`
Récupère un examen spécifique.

**Réponse:**
```json
{
  "examen": { ... }
}
```

#### 3. **POST** `/medecin/patients/:patientId/examens-complementaires`
Crée un nouvel examen.

**Body:**
```json
{
  "typeExamen": "Scanner",
  "dateDemande": "2024-11-01T00:00:00.000Z",
  "dateRealisation": "2024-11-05T00:00:00.000Z",
  "resultats": "Résultats détaillés...",
  "observations": "Observations complémentaires..."
}
```

**Validation:**
- `typeExamen`: requis, string
- `dateDemande`: requis, date ISO
- `dateRealisation`: optionnel, date ISO >= dateDemande
- `resultats`: optionnel, string
- `observations`: optionnel, string

**Réponse:**
```json
{
  "message": "Examen créé avec succès",
  "examen": { ... }
}
```

#### 4. **PUT** `/medecin/patients/:patientId/examens-complementaires/:examId`
Modifie un examen existant.

**Body:** Même structure que POST (tous champs optionnels)

**Réponse:**
```json
{
  "message": "Examen mis à jour avec succès",
  "examen": { ... }
}
```

#### 5. **DELETE** `/medecin/patients/:patientId/examens-complementaires/:examId`
Supprime un examen et tous ses fichiers associés.

**Réponse:**
```json
{
  "message": "Examen et fichiers supprimés avec succès",
  "deletedFiles": 3
}
```

#### 6. **POST** `/medecin/patients/:patientId/examens-complementaires/:examId/fichiers`
Upload un fichier pour un examen.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Fichier (required, max 10MB)
- `description`: Description (optional, string)

**Types acceptés:**
- Images: `image/jpeg`, `image/png`, `image/gif`
- Documents: `application/pdf`, `.doc`, `.docx`

**Réponse:**
```json
{
  "message": "Fichier uploadé avec succès",
  "fichier": {
    "id": "file_id",
    "nomFichier": "resultat.pdf",
    "cheminFichier": "/uploads/exams/...",
    "typeFichier": "application/pdf",
    "tailleFichier": 1024000,
    "description": "Résultat du scanner"
  }
}
```

#### 7. **DELETE** `/medecin/patients/:patientId/examens-complementaires/:examId/fichiers/:fileId`
Supprime un fichier d'un examen.

**Réponse:**
```json
{
  "message": "Fichier supprimé avec succès"
}
```

#### 8. **GET** `/medecin/patients/:patientId/examens-complementaires/:examId/fichiers/:fileId`
Télécharge un fichier (retourne le fichier binaire).

## 🗄️ Modèle de Données (Prisma)

### ExamenComplementaire
```prisma
model ExamenComplementaire {
  id                String   @id @default(cuid())
  typeExamen        String
  dateDemande       DateTime
  dateRealisation   DateTime?
  resultats         String?  @db.Text
  observations      String?  @db.Text
  
  patientId         String
  patient           Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  medecinId         String
  medecin           Medecin  @relation(fields: [medecinId], references: [id])
  
  fichiers          FichierExamen[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### FichierExamen
```prisma
model FichierExamen {
  id                     String   @id @default(cuid())
  nomFichier             String
  cheminFichier          String
  typeFichier            String
  tailleFichier          Int
  description            String?
  
  examenComplementaireId String
  examenComplementaire   ExamenComplementaire @relation(fields: [examenComplementaireId], references: [id], onDelete: Cascade)
  
  createdAt              DateTime @default(now())
}
```

## 📦 Installation Backend

### Prérequis
```bash
npm install @prisma/client
npm install multer  # Pour upload de fichiers
```

### Configuration Prisma

1. **Ajouter les modèles dans `schema.prisma`** (voir ci-dessus)

2. **Créer la migration:**
```bash
npx prisma migrate dev --name add_complementary_exams
```

3. **Générer le client:**
```bash
npx prisma generate
```

### Configuration Multer

Dans votre fichier de routes ou controller:

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/exams');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Nom unique: timestamp_nom-original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre de fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Middleware multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});
```

### Routes Express

```javascript
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const complementaryExamsController = require('../controllers/complementaryExamsController');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Routes CRUD pour examens
router.get(
  '/patients/:patientId/examens-complementaires',
  complementaryExamsController.getComplementaryExams
);

router.get(
  '/patients/:patientId/examens-complementaires/:examId',
  complementaryExamsController.getComplementaryExamById
);

router.post(
  '/patients/:patientId/examens-complementaires',
  complementaryExamsController.createComplementaryExam
);

router.put(
  '/patients/:patientId/examens-complementaires/:examId',
  complementaryExamsController.updateComplementaryExam
);

router.delete(
  '/patients/:patientId/examens-complementaires/:examId',
  complementaryExamsController.deleteComplementaryExam
);

// Routes pour fichiers
router.post(
  '/patients/:patientId/examens-complementaires/:examId/fichiers',
  upload.single('file'),  // Middleware multer
  complementaryExamsController.uploadExamFile
);

router.delete(
  '/patients/:patientId/examens-complementaires/:examId/fichiers/:fileId',
  complementaryExamsController.deleteExamFile
);

router.get(
  '/patients/:patientId/examens-complementaires/:examId/fichiers/:fileId',
  complementaryExamsController.downloadExamFile
);

module.exports = router;
```

### Enregistrer les routes dans app.js

```javascript
const complementaryExamsRoutes = require('./routes/complementaryExams');

app.use('/medecin', complementaryExamsRoutes);
```

## 🧪 Tests

### Test Manuel Frontend

1. **Démarrer le frontend:**
```bash
cd /home/user/webapp
npm run dev
```

2. **Naviguer vers un profil patient:**
- Aller à `/home/patients`
- Cliquer sur un patient
- Scroller jusqu'à la section "Examens Complémentaires"

3. **Tester les fonctionnalités:**
- Créer un examen
- Ajouter des fichiers
- Modifier l'examen
- Rechercher et filtrer
- Télécharger un fichier
- Supprimer un fichier
- Supprimer l'examen

### Test des Endpoints Backend

Utilisez Postman ou curl:

```bash
# 1. Récupérer les examens
curl -X GET \
  http://localhost:4000/medecin/patients/{patientId}/examens-complementaires \
  -H 'Authorization: Bearer YOUR_TOKEN'

# 2. Créer un examen
curl -X POST \
  http://localhost:4000/medecin/patients/{patientId}/examens-complementaires \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "typeExamen": "Scanner",
    "dateDemande": "2024-11-01T00:00:00.000Z",
    "resultats": "Test results"
  }'

# 3. Upload un fichier
curl -X POST \
  http://localhost:4000/medecin/patients/{patientId}/examens-complementaires/{examId}/fichiers \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'file=@/path/to/file.pdf' \
  -F 'description=Résultat du scanner'
```

## 🐛 Débogage

### Problèmes Courants

**1. Erreur 401 (Unauthorized)**
- Vérifier que le token JWT est présent et valide
- Vérifier que `localStorage.getItem('token')` retourne un token

**2. Erreur 404 (Not Found)**
- Vérifier que les routes backend sont correctement enregistrées
- Vérifier l'URL dans `.env` : `VITE_API_BASE_URL=http://localhost:4000`
- Vérifier que le backend tourne sur le bon port

**3. Erreur 500 (Server Error)**
- Vérifier les logs du backend
- Vérifier que Prisma est correctement configuré
- Vérifier que les migrations sont appliquées
- Vérifier les permissions du dossier uploads

**4. Upload de fichier échoue**
- Vérifier la taille du fichier (max 10MB)
- Vérifier le type de fichier (doit être dans la liste autorisée)
- Vérifier que le dossier `uploads/exams/` existe et est accessible en écriture
- Vérifier la configuration multer

**5. Fichiers ne se téléchargent pas**
- Vérifier que le chemin du fichier dans la BDD est correct
- Vérifier que le fichier existe physiquement sur le serveur
- Vérifier les permissions de lecture sur le fichier

### Logs Utiles

Activer les logs dans le service:
```javascript
// Dans complementaryExamsService.js
console.log('Fetching exams for patient:', patientId);
console.log('Response:', response);
console.log('Error:', error);
```

## 📈 Améliorations Futures

### Frontend
- [ ] Prévisualisation d'images en lightbox
- [ ] Annotations sur les images
- [ ] Export PDF des examens
- [ ] Comparaison entre examens
- [ ] Timeline des examens
- [ ] Notifications sur nouveaux résultats

### Backend
- [ ] Compression automatique des images
- [ ] Thumbnail generation
- [ ] OCR sur les PDFs
- [ ] Virus scanning des uploads
- [ ] Stockage cloud (S3, etc.)
- [ ] Archivage automatique
- [ ] Intégration PACS (medical imaging)

### Performance
- [ ] Pagination côté serveur
- [ ] Lazy loading des fichiers
- [ ] Cache des images
- [ ] Optimisation des requêtes Prisma

## 📄 Licence

Ce code est la propriété du projet Cabinet Médical.

## 👥 Support

Pour toute question ou problème:
1. Consulter cette documentation
2. Vérifier les logs frontend (Console) et backend
3. Tester les endpoints avec Postman
4. Contacter l'équipe de développement

---

**Dernière mise à jour:** 13 Novembre 2024
**Version:** 1.0.0
**Auteur:** GenSpark AI Developer
