# Available Backend Endpoints

## Documented Endpoints (from codebase analysis)

### 📊 Dashboard & Statistics

#### `GET /medecin/dashboard-kpis` ⏳ (Documenté mais non testé)
**Response**:
```json
{
  "kpis": {
    "patientsToday": 12,
    "waiting": 3,
    "completed": 8,
    "revenue": 845,
    "trends": {
      "patientsDiff": "+2",
      "waitingTime": "15min",
      "completionRate": "67%",
      "revenueChange": "+12%"
    }
  }
}
```

### 👥 Patients Management

#### `GET /medecin/list-patients` ✅ (Utilisé)
**Used in**: PatientsSimple.jsx, QueueSimple.jsx, CalendarSimple.jsx
**Description**: Récupère la liste complète des patients
**Auth**: Bearer Token required

#### `POST /medecin/create-patient` ✅ (Utilisé)
**Used in**: PatientsSimple.jsx
**Description**: Crée un nouveau patient
**Auth**: Bearer Token required

#### `GET /medecin/patients/:id` ✅ (Utilisé)
**Used in**: PatientProfile.tsx
**Description**: Récupère le profil détaillé d'un patient
**Auth**: Bearer Token required

#### `PUT /medecin/patients/:id` ✅ (Utilisé)
**Used in**: PatientProfile.tsx
**Description**: Met à jour les informations d'un patient
**Auth**: Bearer Token required

#### `DELETE /medecin/patients/:id` ✅ (Utilisé)
**Used in**: PatientProfile.tsx
**Description**: Supprime un patient
**Auth**: Bearer Token required

### 📅 Appointments Management

#### `GET /medecin/appointments` ✅ (Utilisé)
**Used in**: CalendarSimple.jsx
**Description**: Récupère tous les rendez-vous
**Auth**: Bearer Token required

#### `GET /medecin/today-appointments` ✅ (Utilisé)
**Used in**: QueueSimple.jsx
**Description**: Récupère les rendez-vous d'aujourd'hui
**Auth**: Bearer Token required

#### `GET /medecin/completed-appointments` ✅ (Utilisé)
**Used in**: QueueSimple.jsx
**Description**: Récupère les rendez-vous terminés
**Auth**: Bearer Token required

#### `POST /medecin/add-appointment` ✅ (Utilisé)
**Used in**: CalendarSimple.jsx
**Description**: Ajoute un nouveau rendez-vous
**Auth**: Bearer Token required

### 🔬 Complementary Exams Management

#### `GET /medecin/exams/patient/:patientId` ✅ (Nouveau)
**Used in**: ExamsList.jsx
**Description**: Récupère tous les examens complémentaires d'un patient avec statistiques
**Auth**: Bearer Token required
**Response**:
```json
{
  "examens": [...],
  "stats": {
    "total": 5,
    "types": {
      "Radiographie": 2,
      "Échographie": 1
    }
  }
}
```

#### `GET /medecin/exams/:id` ✅ (Nouveau)
**Used in**: ExamsList.jsx
**Description**: Récupère un examen complémentaire spécifique
**Auth**: Bearer Token required

#### `POST /medecin/exams` ✅ (Nouveau)
**Used in**: ExamsList.jsx
**Description**: Crée un nouvel examen complémentaire
**Auth**: Bearer Token required
**Body**:
```json
{
  "patientId": "string",
  "type": "string",
  "nom": "string",
  "description": "string",
  "dateExamen": "ISO date",
  "prescripteur": "string",
  "statut": "En attente|Effectué|Annulé"
}
```

#### `PUT /medecin/exams/:id` ✅ (Nouveau)
**Used in**: ExamsList.jsx
**Description**: Met à jour un examen complémentaire
**Auth**: Bearer Token required

#### `DELETE /medecin/exams/:id` ✅ (Nouveau)
**Used in**: ExamsList.jsx
**Description**: Supprime un examen et tous ses fichiers
**Auth**: Bearer Token required

#### `POST /medecin/exams/:id/upload` ✅ (Nouveau)
**Used in**: ExamsList.jsx
**Description**: Upload un fichier pour un examen (max 10MB, PDF/JPG/PNG/DOC/XLS)
**Auth**: Bearer Token required
**Content-Type**: multipart/form-data

#### `DELETE /medecin/exams/:examId/files/:fileId` ✅ (Nouveau)
**Used in**: ExamsList.jsx
**Description**: Supprime un fichier d'un examen
**Auth**: Bearer Token required

#### `GET /medecin/exams/:examId/files/:fileId/download` ✅ (Nouveau)
**Used in**: ExamsList.jsx
**Description**: Télécharge un fichier d'un examen
**Auth**: Bearer Token required

### 🕐 Waiting Queue Management

#### `POST /medecin/add-to-waiting` ✅ (Utilisé)
**Used in**: QueueSimple.jsx
**Description**: Ajoute un patient existant à la file d'attente
**Auth**: Bearer Token required

#### `POST /medecin/add-to-waiting-today` ✅ (Utilisé)
**Used in**: QueueSimple.jsx
**Description**: Ajoute un patient avec RDV aujourd'hui à la file
**Auth**: Bearer Token required

#### `POST /medecin/add-to-actif` ✅ (Utilisé)
**Used in**: QueueSimple.jsx
**Description**: Démarre une consultation (passe en "En cours")
**Auth**: Bearer Token required

#### `POST /medecin/finish-consultation` ✅ (Utilisé)
**Used in**: QueueSimple.jsx
**Description**: Termine une consultation
**Auth**: Bearer Token required
**Body**:
```json
{
  "appointmentId": "string",
  "paye": "boolean",
  "note": "string",
  "poids": "number",
  "prochainRdv": "date",
  "pcm": "number",
  "imc": "number",
  "pulse": "number",
  "paSystolique": "number",
  "paDiastolique": "number"
}
```

---

## 🎯 Recommended Dashboard KPIs Based on Available Data

### Option 1: Calculate from existing endpoints

Instead of waiting for `/medecin/dashboard-kpis`, we can fetch data from existing endpoints:

#### Data Sources:
1. **GET /medecin/today-appointments** → Patients aujourd'hui, En attente, Terminés
2. **GET /medecin/completed-appointments** → Revenue calculation (if payment info available)
3. **GET /medecin/list-patients** → Total patients count

#### Implementation Strategy:

```javascript
const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    
    // Fetch today's appointments
    const todayResponse = await fetch(`${baseURL}/medecin/today-appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const todayData = await todayResponse.json()
    
    // Calculate KPIs from today's appointments
    const appointments = todayData.appointments || []
    const patientsToday = appointments.length
    const waiting = appointments.filter(a => 
      a.status === 'En attente' || a.status === 'En cours'
    ).length
    const completed = appointments.filter(a => 
      a.status === 'Terminé'
    ).length
    
    // Calculate revenue (if paye field exists)
    const revenue = appointments
      .filter(a => a.status === 'Terminé' && a.paye)
      .reduce((sum, a) => sum + (a.price || 50), 0)
    
    setKpis({
      patientsToday,
      waiting,
      completed,
      revenue,
      trends: {
        patientsDiff: '+2', // Would need yesterday's data
        waitingTime: '15min', // Would need actual timestamps
        completionRate: `${Math.round((completed/patientsToday)*100)}%`,
        revenueChange: '+12%' // Would need yesterday's data
      }
    })
  } catch (err) {
    // Fallback to mock data
  }
}
```

---

## 📋 Summary

### ✅ Endpoints Confirmed Working:
- Patient CRUD operations
- Appointment management
- Waiting queue operations
- Consultation completion

### ⏳ Endpoints Documented but Not Tested:
- `/medecin/dashboard-kpis` (documented in guide)

### 💡 Recommendation:

**Option A**: Wait for backend to implement `/medecin/dashboard-kpis`
- Pros: Clean, dedicated endpoint
- Cons: Requires backend development

**Option B**: Calculate KPIs from existing endpoints
- Pros: Works with current backend
- Cons: Multiple API calls, client-side calculation

**Option C**: Keep mock data fallback (Current)
- Pros: Dashboard always works
- Cons: Not real-time data

---

## 🔧 Next Steps

### If Backend is Ready:
1. Test `/medecin/dashboard-kpis` endpoint
2. Verify response structure matches documentation
3. Remove mock data fallback

### If Backend Not Ready:
1. Implement Option B (calculate from existing endpoints)
2. Use `/medecin/today-appointments` as primary data source
3. Keep mock data as ultimate fallback

### For Better Statistics:
Consider creating these endpoints:
- `GET /medecin/statistics/today` - Today's summary
- `GET /medecin/statistics/week` - Week summary
- `GET /medecin/statistics/month` - Month summary
