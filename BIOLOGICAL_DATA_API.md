# API Documentation - Données Biologiques (Biological Data)

## 📋 Vue d'ensemble

Ce document décrit les endpoints API requis pour le module de gestion des données biologiques des patients dans le système de cabinet médical.

## 🗄️ Structure de la base de données

### Table: `biological_requests`

```sql
CREATE TABLE biological_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  
  -- Dates
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sampling_date DATE NULL,
  validation_date DATE NULL,
  
  -- Types de prélèvement (stockés en JSON ou table liée)
  sample_types JSON NOT NULL, -- ['Sang', 'Urine', 'Selles', 'Autre']
  
  -- Examens demandés et résultats (stockés en JSON)
  requested_exams JSON NOT NULL, -- ['NFS', 'Glycémie', 'Cholestérol', ...]
  results JSON NULL, -- {'Glycémie': '0.95', 'Cholestérol': '1.8', ...}
  
  -- État et observations
  status ENUM('Récemment créée', 'Complète') DEFAULT 'Récemment créée',
  medical_observation TEXT NULL,
  
  -- Clés étrangères
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### Alternative: Structure normalisée

Si vous préférez une structure plus normalisée :

```sql
CREATE TABLE biological_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sampling_date DATE NULL,
  validation_date DATE NULL,
  status ENUM('Récemment créée', 'Complète') DEFAULT 'Récemment créée',
  medical_observation TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);

CREATE TABLE request_sample_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  sample_type ENUM('Sang', 'Urine', 'Selles', 'Autre') NOT NULL,
  FOREIGN KEY (request_id) REFERENCES biological_requests(id) ON DELETE CASCADE
);

CREATE TABLE request_exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  exam_type VARCHAR(50) NOT NULL,
  result_value DECIMAL(10,2) NULL,
  FOREIGN KEY (request_id) REFERENCES biological_requests(id) ON DELETE CASCADE
);
```

## 🔌 Endpoints API

### 1. Récupérer toutes les demandes d'un patient

**GET** `/medecin/biological-requests/:patientId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "requests": [
    {
      "id": 1,
      "requestNumber": "BIO-2024-001",
      "patientId": 123,
      "doctorId": 456,
      "doctorName": "Dr. Martin",
      "createdAt": "2024-11-09T10:30:00Z",
      "samplingDate": "2024-11-10",
      "validationDate": null,
      "sampleTypes": ["Sang", "Urine"],
      "requestedExams": ["NFS", "Glycémie", "Cholestérol"],
      "results": {
        "Glycémie": "0.95",
        "Cholestérol": "1.8"
      },
      "status": "Récemment créée",
      "medicalObservation": "Patient à jeun depuis 12h"
    }
  ]
}
```

**Response 401:** Token expiré (nécessite refresh)
**Response 403:** Non autorisé
**Response 404:** Aucune demande trouvée

---

### 2. Créer une nouvelle demande

**POST** `/medecin/biological-requests`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "patientId": 123,
  "sampleTypes": ["Sang", "Urine"],
  "requestedExams": ["NFS", "Glycémie", "Cholestérol", "TSH"],
  "samplingDate": "2024-11-10",
  "results": {
    "Glycémie": "0.95"
  },
  "validationDate": null,
  "status": "Récemment créée",
  "medicalObservation": "Patient à jeun depuis 12h"
}
```

**Response 201:**
```json
{
  "message": "Demande biologique créée avec succès",
  "request": {
    "id": 1,
    "requestNumber": "BIO-2024-001",
    "patientId": 123,
    "doctorId": 456,
    "doctorName": "Dr. Martin",
    "createdAt": "2024-11-09T10:30:00Z",
    "samplingDate": "2024-11-10",
    "validationDate": null,
    "sampleTypes": ["Sang", "Urine"],
    "requestedExams": ["NFS", "Glycémie", "Cholestérol", "TSH"],
    "results": {
      "Glycémie": "0.95"
    },
    "status": "Récemment créée",
    "medicalObservation": "Patient à jeun depuis 12h"
  }
}
```

**Response 400:** Données invalides
**Response 401:** Token expiré
**Response 403:** Non autorisé

---

### 3. Mettre à jour une demande existante

**PUT** `/medecin/biological-requests/:requestId`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "patientId": 123,
  "sampleTypes": ["Sang", "Urine"],
  "requestedExams": ["NFS", "Glycémie", "Cholestérol", "TSH"],
  "samplingDate": "2024-11-10",
  "results": {
    "Glycémie": "0.95",
    "Cholestérol": "1.8",
    "TSH": "2.4"
  },
  "validationDate": "2024-11-11",
  "status": "Complète",
  "medicalObservation": "Résultats satisfaisants, glycémie contrôlée"
}
```

**Response 200:**
```json
{
  "message": "Demande mise à jour avec succès",
  "request": {
    "id": 1,
    "requestNumber": "BIO-2024-001",
    "patientId": 123,
    "doctorId": 456,
    "doctorName": "Dr. Martin",
    "createdAt": "2024-11-09T10:30:00Z",
    "samplingDate": "2024-11-10",
    "validationDate": "2024-11-11",
    "sampleTypes": ["Sang", "Urine"],
    "requestedExams": ["NFS", "Glycémie", "Cholestérol", "TSH"],
    "results": {
      "Glycémie": "0.95",
      "Cholestérol": "1.8",
      "TSH": "2.4"
    },
    "status": "Complète",
    "medicalObservation": "Résultats satisfaisants, glycémie contrôlée"
  }
}
```

**Response 400:** Données invalides
**Response 401:** Token expiré
**Response 403:** Non autorisé
**Response 404:** Demande non trouvée

---

## 🔐 Authentification et Sécurité

Tous les endpoints nécessitent :
- Un token JWT valide dans le header `Authorization: Bearer {token}`
- Le médecin doit être authentifié
- Le médecin doit avoir accès au patient concerné

### Gestion du refresh token

Si un endpoint retourne 401, le frontend tentera automatiquement :
1. D'appeler l'endpoint de refresh token
2. De réessayer la requête avec le nouveau token
3. Si le refresh échoue, rediriger vers la page de login

## 📊 Génération du numéro de demande

Le numéro de demande doit être généré automatiquement selon le format :
- **Format:** `BIO-YYYY-XXX`
- **YYYY:** Année en cours (2024)
- **XXX:** Numéro séquentiel sur 3 chiffres (001, 002, 003...)

**Exemple de génération côté backend:**

```javascript
// Node.js / Express
const generateRequestNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `BIO-${currentYear}-`;
  
  // Trouver le dernier numéro de l'année
  const lastRequest = await BiologicalRequest.findOne({
    request_number: { $regex: `^${prefix}` }
  }).sort({ request_number: -1 });
  
  let nextNumber = 1;
  if (lastRequest) {
    const lastNumber = parseInt(lastRequest.request_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};
```

## 🧪 Valeurs normales de référence

Les valeurs normales sont gérées côté frontend, mais voici la référence :

```javascript
const NORMAL_RANGES = {
  'NFS': { min: 4000, max: 11000, unit: '/mm³' },
  'Glycémie': { min: 0.7, max: 1.1, unit: 'g/L' },
  'Cholestérol': { min: 1.5, max: 2.0, unit: 'g/L' },
  'Créatinine': { min: 7, max: 13, unit: 'mg/L' },
  'TSH': { min: 0.4, max: 4.0, unit: 'mUI/L' },
  'HbA1c': { min: 4.0, max: 6.0, unit: '%' },
  'Ionogramme': { min: 135, max: 145, unit: 'mmol/L' },
  'Bilan hépatique': { min: 10, max: 40, unit: 'UI/L' },
  'Bilan rénal': { min: 80, max: 120, unit: 'mL/min' },
  'Bilan lipidique': { min: 0.4, max: 1.6, unit: 'g/L' }
};
```

## 🔄 Corrélations automatiques

Le frontend détecte automatiquement certaines corrélations :

1. **Glycémie ↔ HbA1c:** Détection du risque diabétique
2. **Cholestérol ↔ Bilan lipidique:** Dyslipidémie mixte
3. **Créatinine ↔ Bilan rénal:** Insuffisance rénale

Ces corrélations sont affichées automatiquement quand les deux valeurs sont présentes.

## 📝 Notes d'implémentation

### Workflow de création

1. **Création initiale:**
   - Le médecin sélectionne les types de prélèvement et examens
   - Status = "Récemment créée"
   - `samplingDate`, `results`, `validationDate` = NULL

2. **Ajout des résultats:**
   - Le médecin saisit la date de prélèvement
   - Le médecin entre les valeurs obtenues
   - Le frontend calcule automatiquement les statuts (Normal/Warning/Danger)

3. **Validation:**
   - Le médecin ajoute une observation médicale
   - Le médecin saisit la date de validation
   - Status = "Complète"

### Permissions requises

- Seuls les médecins peuvent créer/modifier des demandes biologiques
- Un médecin ne peut voir que les demandes de ses propres patients
- Le médecin prescripteur est automatiquement lié via le token JWT

## 🧪 Exemple de test avec cURL

```bash
# Créer une demande
curl -X POST http://localhost:3000/medecin/biological-requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "sampleTypes": ["Sang"],
    "requestedExams": ["Glycémie", "HbA1c"],
    "status": "Récemment créée",
    "medicalObservation": "Contrôle diabète"
  }'

# Récupérer les demandes d'un patient
curl -X GET http://localhost:3000/medecin/biological-requests/123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mettre à jour une demande
curl -X PUT http://localhost:3000/medecin/biological-requests/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 123,
    "sampleTypes": ["Sang"],
    "requestedExams": ["Glycémie", "HbA1c"],
    "samplingDate": "2024-11-10",
    "results": {
      "Glycémie": "0.95",
      "HbA1c": "5.8"
    },
    "validationDate": "2024-11-11",
    "status": "Complète",
    "medicalObservation": "Résultats satisfaisants"
  }'
```

## 🚀 Migration de la base de données

```sql
-- Migration: Créer la table biological_requests
CREATE TABLE IF NOT EXISTS biological_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sampling_date DATE NULL,
  validation_date DATE NULL,
  sample_types JSON NOT NULL,
  requested_exams JSON NOT NULL,
  results JSON NULL,
  status ENUM('Récemment créée', 'Complète') DEFAULT 'Récemment créée',
  medical_observation TEXT NULL,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_patient (patient_id),
  INDEX idx_doctor (doctor_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

**Développé pour le module de gestion des données biologiques - Cabinet Médical** 🏥
