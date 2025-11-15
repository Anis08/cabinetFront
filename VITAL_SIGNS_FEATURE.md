# Add/Edit Vital Signs Feature - Documentation

## 🎯 Feature Overview
Add functionality to create and edit "Constantes Vitales" (Vital Signs) directly from the patient profile page with a comprehensive modal form.

## 📍 Location
**Page:** Patient Profile (`/patient/:patientId`)
**Section:** "Constantes Vitales" (Vital Signs section)

## 🎨 UI Components

### Button Location
- **Position:** Top-right of "Constantes Vitales" section
- **Button:** "Ajouter/Modifier" with Plus icon
- **Color:** Green/Teal gradient (matches the modal theme)
- **Alongside:** "Voir l'Historique" button

### Modal Design
- **Header:** Green-to-teal gradient background
- **Title:** "Ajouter/Modifier Constantes Vitales"
- **Icon:** Activity icon
- **Size:** Large modal (max-w-3xl)
- **Scrollable:** Yes (max-h-90vh)

## 📊 Vital Signs Fields

### 1. **Date** (Required)
- Type: Date picker
- Default: Today's date
- Format: YYYY-MM-DD

### 2. **Blood Pressure** (Red theme)
- **Systolic:** Number input (mmHg)
- **Diastolic:** Number input (mmHg)
- Placeholder: 120/80
- Step: 0.1

### 3. **Weight & BMI** (Blue theme)
- **Weight (Poids):** Number input (kg)
- **BMI (IMC):** Number input (kg/m²)
- Placeholder: 70 / 22.5
- Step: 0.1

### 4. **PCM** (Indigo theme)
- **Label:** Poids Corporel Maigre (Lean Body Mass)
- Type: Number input (kg)
- Placeholder: 65
- Step: 0.1

### 5. **Heart Rate** (Pink theme)
- **Label:** Rythme Cardiaque
- Type: Number input (bpm)
- Placeholder: 72
- Step: 1 (integer)

## 🔧 Functionality

### Auto-fill Feature
When opening the modal:
- **Pre-fills** all fields with latest recorded values
- Pulls data from `patient.rendezVous[0]` (most recent)
- Allows easy updates without re-typing
- Date always defaults to today

### Validation
- **Minimum:** At least one vital sign field must be filled
- **Optional:** All fields can be left empty except date
- **Error message:** "Veuillez remplir au moins une constante vitale"

### Save Process
1. User fills/updates desired fields
2. Clicks "Enregistrer" button
3. Loading state: "Enregistrement..."
4. API call to `POST /medecin/vital-signs`
5. On success:
   - Alert: "Constantes vitales enregistrées avec succès !"
   - Modal closes
   - Vital signs cards update immediately
   - New entry added to history

## 🌐 Backend Integration

### Endpoint
```
POST /medecin/vital-signs
```

### Request Headers
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{
  "patientId": 123,
  "date": "2024-11-15T00:00:00.000Z",
  "paSystolique": 120.5,
  "paDiastolique": 80.0,
  "poids": 72.5,
  "imc": 22.8,
  "pcm": 65.0,
  "pulse": 75,
  "status": "Completed"
}
```

**Field Types:**
- `patientId`: Integer (required)
- `date`: ISO DateTime string (required)
- `paSystolique`: Float or null
- `paDiastolique`: Float or null
- `poids`: Float or null
- `imc`: Float or null
- `pcm`: Float or null
- `pulse`: Float or null
- `status`: String (always "Completed")

### Response (200 Success)
```json
{
  "message": "Constantes vitales enregistrées avec succès",
  "vitalSigns": {
    "_id": "67890",
    "patientId": 123,
    "date": "2024-11-15T00:00:00.000Z",
    "paSystolique": 120.5,
    "paDiastolique": 80.0,
    "poids": 72.5,
    "imc": 22.8,
    "pcm": 65.0,
    "pulse": 75,
    "status": "Completed",
    "createdAt": "2024-11-15T10:30:00.000Z",
    "updatedAt": "2024-11-15T10:30:00.000Z"
  }
}
```

### Error Responses
- `400` - Missing required fields or validation error
- `401` - Unauthorized (token refresh attempted)
- `403` - Forbidden (user logged out)
- `404` - Patient not found
- `500` - Server error

## 🎨 UI Structure

### Color-Coded Sections
Each vital sign category has its own themed section:

1. **Blood Pressure:** Red background (`bg-red-50`, `border-red-100`)
2. **Weight & BMI:** Blue background (`bg-blue-50`, `border-blue-100`)
3. **PCM:** Indigo background (`bg-indigo-50`, `border-indigo-100`)
4. **Heart Rate:** Pink background (`bg-pink-50`, `border-pink-100`)

### Modal Layout
```
┌─────────────────────────────────────────────┐
│ [Activity Icon] Ajouter/Modifier            │ [X]
│ Constantes Vitales                          │
├─────────────────────────────────────────────┤
│ Date: [YYYY-MM-DD]                          │
│                                             │
│ ┌─ Blood Pressure (Red) ─────────────────┐ │
│ │ Systolique: [120] | Diastolique: [80] │ │
│ └───────────────────────────────────────── │
│                                             │
│ ┌─ Weight & BMI (Blue) ──────────────────┐ │
│ │ Poids: [72.5] | IMC: [22.8]           │ │
│ └───────────────────────────────────────── │
│                                             │
│ ┌─ PCM (Indigo) ─┐ ┌─ Heart Rate (Pink) ─┐│
│ │ PCM: [65]     │ │ Pulse: [75]        ││
│ └─────────────── └──────────────────────  │
│                                             │
│ * Au moins une constante vitale requise    │
├─────────────────────────────────────────────┤
│                    [Annuler] [Enregistrer]  │
└─────────────────────────────────────────────┘
```

## 💡 User Flow

### Scenario 1: Add New Vital Signs
1. Navigate to patient profile
2. Scroll to "Constantes Vitales" section
3. Click "Ajouter/Modifier" button
4. Modal opens with latest values pre-filled
5. Update desired fields
6. Click "Enregistrer"
7. See success message
8. Vital signs cards update automatically

### Scenario 2: Update Existing Values
1. Open modal (pre-fills with latest values)
2. Modify only changed values
3. Leave others as-is
4. Save
5. New entry created with updated values

### Scenario 3: Partial Entry
1. Open modal
2. Fill only blood pressure (120/80)
3. Leave other fields empty
4. Save successfully
5. Only blood pressure recorded

## 🔒 Security & Validation

### Client-Side Validation
- ✅ At least one vital sign must be filled
- ✅ Date is required
- ✅ Numeric validation (step values enforced)
- ✅ Patient ID validation

### Server-Side (Expected)
- ✅ JWT authentication required
- ✅ Patient belongs to authenticated doctor
- ✅ Numeric range validations
- ✅ Date format validation

## 📊 State Management

### Component State Variables
```typescript
const [showVitalSignsModal, setShowVitalSignsModal] = useState(false);
const [vitalSignsForm, setVitalSignsForm] = useState({
  paSystolique: '',
  paDiastolique: '',
  poids: '',
  imc: '',
  pcm: '',
  pulse: '',
  date: new Date().toISOString().split('T')[0]
});
const [savingVitalSigns, setSavingVitalSigns] = useState(false);
```

### Data Flow
1. **Open Modal** → Pre-fill from `patient.rendezVous[0]`
2. **User Input** → Update `vitalSignsForm` state
3. **Save** → POST to API
4. **Success** → Update `patient.rendezVous` array (prepend new entry)
5. **UI Update** → Vital signs cards show new values

## 🧪 Testing

### Manual Test Cases

**Test 1: Full Entry**
- Fill all fields with valid values
- Expected: Success, all values saved

**Test 2: Partial Entry**
- Fill only blood pressure
- Expected: Success, only BP saved

**Test 3: Empty Form**
- Leave all fields empty
- Expected: Validation error message

**Test 4: Auto-Fill**
- Open modal with existing data
- Expected: Latest values pre-filled

**Test 5: Cancel**
- Fill form, click "Annuler"
- Expected: Modal closes, no data saved

**Test 6: Loading State**
- Submit form, check button
- Expected: "Enregistrement..." shown, buttons disabled

## 📝 Backend Implementation Guide

### Prisma Schema (Expected)
```prisma
model RendezVous {
  id             Int      @id @default(autoincrement())
  patientId      Int
  medecinId      Int
  date           DateTime
  paSystolique   Float?
  paDiastolique  Float?
  poids          Float?
  imc            Float?
  pcm            Float?
  pulse          Float?
  status         String   // "Completed", etc.
  note           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  patient        Patient  @relation(fields: [patientId], references: [id])
  medecin        Medecin  @relation(fields: [medecinId], references: [id])
}
```

### Controller Example
```javascript
export const createVitalSigns = async (req, res) => {
  const medecinId = req.medecinId;
  const {
    patientId,
    date,
    paSystolique,
    paDiastolique,
    poids,
    imc,
    pcm,
    pulse
  } = req.body;

  try {
    // Validate patient belongs to medecin
    const patient = await prisma.patient.findFirst({
      where: {
        id: parseInt(patientId),
        medecinId: medecinId
      }
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }

    // Create vital signs entry
    const vitalSigns = await prisma.rendezVous.create({
      data: {
        patientId: parseInt(patientId),
        medecinId: medecinId,
        date: new Date(date),
        paSystolique: paSystolique ? parseFloat(paSystolique) : null,
        paDiastolique: paDiastolique ? parseFloat(paDiastolique) : null,
        poids: poids ? parseFloat(poids) : null,
        imc: imc ? parseFloat(imc) : null,
        pcm: pcm ? parseFloat(pcm) : null,
        pulse: pulse ? parseFloat(pulse) : null,
        status: 'Completed'
      }
    });

    res.status(200).json({
      message: 'Constantes vitales enregistrées avec succès',
      vitalSigns
    });
  } catch (error) {
    console.error('Error creating vital signs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
```

### Route Registration
```javascript
router.post('/vital-signs', verifyAccessToken, createVitalSigns);
```

## 🎉 Feature Summary

**What It Does:**
- ✅ Adds new vital signs entries
- ✅ Pre-fills with latest values for easy updates
- ✅ Validates input
- ✅ Integrates with backend API
- ✅ Updates UI immediately
- ✅ Provides clear feedback

**What It Doesn't Do:**
- ❌ Edit existing entries directly (creates new ones)
- ❌ Delete old entries
- ❌ Calculate IMC automatically (user must enter)
- ❌ Show real-time trends (see history modal for that)

**Benefits:**
- 🎯 Quick data entry
- 🔄 Easy updates
- 📊 Immediate visual feedback
- 💾 Persistent storage
- 🎨 Clean, intuitive UI
- 🔐 Secure with authentication

---

**Commit:** `2fc6102`
**Branch:** `genspark_ai_developer`
**Status:** ✅ Pushed to remote
**Dev Server:** Running on port 3003
