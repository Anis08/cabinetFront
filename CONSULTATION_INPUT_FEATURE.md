# Interface de Saisie Consultation - Documentation

## 🎯 Vue d'ensemble
Interface simplifiée et moderne pour la saisie rapide des informations de consultation directement pendant ou après la consultation du patient. La page récupère automatiquement le patient actuellement en consultation et permet au médecin de saisir toutes les informations nécessaires en une seule fois.

## 📍 Accès
**URL:** `/home/consultation-input`  
**Navigation:** Menu principal > "Saisie Consultation"  
**Icône:** ClipboardEdit (Lucide React)

## 🎯 Objectif Principal
Fournir une interface **simple et rapide** pour :
- Saisir les constantes vitales du patient
- Ajouter des notes médicales
- Enregistrer le montant payé
- Terminer la consultation en un clic

## 🔄 Fonctionnement en Temps Réel avec WebSocket

### Connexion WebSocket avec Socket.IO
```javascript
useEffect(() => {
  // Déterminer l'URL WebSocket à partir du baseURL
  const wsURL = baseURL.replace(/^http/, 'ws').replace(/^https/, 'wss');
  
  // Créer la connexion Socket.IO
  const socket = io(wsURL, {
    auth: {
      token: localStorage.getItem('token')
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // Demander le patient en consultation actuel
  socket.emit('getCurrentPatient');
  
  return () => socket.disconnect();
}, []);
```

### Événements WebSocket

#### Événements Émis (Client → Serveur)
- **`getCurrentPatient`** - Demande le patient actuellement en consultation

#### Événements Reçus (Serveur → Client)
- **`currentPatient`** - Reçoit les données du patient en consultation
- **`patientInConsultation`** - Notification quand un patient entre en consultation
- **`patientLeftConsultation`** - Notification quand un patient quitte
- **`appointmentsUpdate`** - Mise à jour de la liste complète des RDV

### Indicateur de Connexion
- **Vert avec icône Wifi** → WebSocket connecté
- **Rouge avec icône WifiOff** → WebSocket déconnecté
- **Reconnexion automatique** si perte de connexion

### États du Patient
- **"In consultation"** → Patient affiché dans l'interface
- **Autres états** → Message "Aucun patient en consultation"

### Fallback Mode
Si WebSocket échoue, le système bascule automatiquement en mode polling HTTP

## 📋 Informations Collectées

### 1. Constantes Vitales (Optionnelles)

#### Pression Artérielle
- **Systolique** (mmHg)
- **Diastolique** (mmHg)
- **Thème:** Rouge (bg-red-50, border-red-100)
- **Icône:** Heart

#### Rythme Cardiaque
- **Pulse** (bpm)
- **Thème:** Rose (bg-pink-50, border-pink-100)
- **Icône:** Activity
- **Type:** Integer

#### Poids & IMC
- **Poids** (kg)
- **IMC** (kg/m²) - **Auto-calculé**
- **Thème:** Bleu/Violet
- **Icône:** Scale / Activity
- **Formule:** `IMC = poids / (taille_m)²`

#### PCM (Poids Corporel Maigre)
- **PCM** (kg)
- **Thème:** Indigo (bg-indigo-50, border-indigo-100)
- **Icône:** Scale

### 2. Notes Médicales (Optionnel)
- **Type:** Textarea
- **Placeholder:** "Observations, diagnostic, recommandations..."
- **Lignes:** 4
- **Icône:** FileText

### 3. Montant Payé (OBLIGATOIRE)
- **Type:** Number
- **Unité:** DA (Dinars Algériens)
- **Thème:** Vert (bg-green-50, border-green-200)
- **Icône:** Droplet
- **Validation:** Requis, doit être un nombre valide

## ✨ Fonctionnalités Intelligentes

### Calcul Automatique de l'IMC
```javascript
useEffect(() => {
  const { poids } = consultationForm;
  const taille = currentPatient?.patient?.taille;
  
  if (poids && taille && poids > 0 && taille > 0) {
    const tailleM = taille / 100; // cm → m
    const imc = (parseFloat(poids) / (tailleM * tailleM)).toFixed(1);
    setConsultationForm(prev => ({ ...prev, imc }));
  }
}, [consultationForm.poids, currentPatient?.patient?.taille]);
```

**Déclencheurs:**
- Changement du poids
- Chargement d'un nouveau patient
- Taille du patient disponible

### Affichage des Informations Patient

#### En-tête Patient (Gradient Bleu-Violet)
```
┌─────────────────────────────────────────────────────┐
│ 👤  [Nom Complet Patient]                   XX min  │
│     [Âge] ans • [Sexe]          Durée consultation  │
└─────────────────────────────────────────────────────┘
```

#### Informations Supplémentaires (Fond Gris)
- **Téléphone:** Patient.phoneNumber
- **Taille:** Patient.taille (cm)
- **Maladie chronique:** Patient.maladieChronique

### Durée de Consultation en Temps Réel
```javascript
const getConsultationDuration = () => {
  if (!currentPatient?.startTime) return 'N/A';
  
  const start = new Date(currentPatient.startTime);
  const now = new Date();
  const diffMs = now - start;
  const diffMins = Math.floor(diffMs / 60000);
  
  return `${diffMins} min`;
};
```

## 🔌 Connexion WebSocket

### Configuration Socket.IO
```javascript
const socket = io(wsURL, {
  auth: {
    token: localStorage.getItem('token')  // JWT pour authentification
  },
  transports: ['websocket', 'polling'],   // WebSocket prioritaire
  reconnection: true,                      // Reconnexion auto
  reconnectionDelay: 1000,                // Délai entre tentatives
  reconnectionAttempts: 5                  // Nombre de tentatives
});
```

### Événements WebSocket

#### Émis par le Client
```javascript
// Demander le patient actuel
socket.emit('getCurrentPatient');
```

#### Reçus du Serveur
```javascript
// Patient actuellement en consultation
socket.on('currentPatient', (patient) => {
  setCurrentPatient(patient);
});

// Nouveau patient entre en consultation
socket.on('patientInConsultation', (patient) => {
  setCurrentPatient(patient);
});

// Patient quitte la consultation
socket.on('patientLeftConsultation', () => {
  setCurrentPatient(null);
});

// Mise à jour globale des RDV
socket.on('appointmentsUpdate', (appointments) => {
  setTodayAppointments(appointments);
});
```

### Gestion des Connexions
```javascript
// Connexion établie
socket.on('connect', () => {
  setSocketConnected(true);
  socket.emit('getCurrentPatient');
});

// Déconnexion
socket.on('disconnect', () => {
  setSocketConnected(false);
});

// Erreur de connexion
socket.on('connect_error', (error) => {
  setSocketConnected(false);
  // Fallback vers polling HTTP
  loadTodayAppointments();
});
```

## 🌐 Intégration API

### Endpoints Utilisés

#### 1. Récupération des Rendez-vous
```
GET /medecin/today-appointments
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "todayAppointments": [
    {
      "id": 123,
      "state": "In consultation",
      "startTime": "2024-11-21T10:30:00.000Z",
      "patient": {
        "fullName": "John Doe",
        "age": 45,
        "gender": "Masculin",
        "phoneNumber": "0555123456",
        "taille": 175,
        "maladieChronique": "Hypertension"
      }
    }
  ]
}
```

#### 2. Enregistrement de la Consultation
```
POST /medecin/finish-consultation
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "rendezVousId": 123,
  "paye": 2000,
  "note": "Observations médicales...",
  "poids": 72.5,
  "pcm": 65.0,
  "imc": 23.7,
  "pulse": 75,
  "paSystolique": 120.0,
  "paDiastolique": 80.0,
  "prochainRdv": null
}
```

**Response Success (200):**
```json
{
  "message": "Consultation terminée avec succès",
  "completedAppointment": {
    "id": 123,
    "state": "Completed",
    ...
  }
}
```

## 🎨 Design UI/UX

### Palette de Couleurs par Section

| Section | Couleur | Fond | Bordure | Icône |
|---------|---------|------|---------|-------|
| Pression Artérielle | Rouge | bg-red-50 | border-red-100 | Heart (red-500) |
| Rythme Cardiaque | Rose | bg-pink-50 | border-pink-100 | Activity (pink-500) |
| Poids | Bleu | bg-blue-50 | border-blue-100 | Scale (blue-500) |
| IMC | Violet | bg-purple-50 | border-purple-100 | Activity (purple-500) |
| PCM | Indigo | bg-indigo-50 | border-indigo-100 | Scale (indigo-500) |
| Paiement | Vert | bg-green-50 | border-green-200 | Droplet (green-500) |

### Messages d'État

#### Message d'Erreur
```jsx
<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
  <AlertCircle className="w-5 h-5 text-red-600" />
  <p className="text-red-800">{errorMessage}</p>
</div>
```

#### Message de Succès
```jsx
<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
  <CheckCircle className="w-5 h-5 text-green-600" />
  <p className="text-green-800">✅ Consultation enregistrée avec succès !</p>
</div>
```

#### État Vide (Aucun Patient)
```jsx
<div className="text-center p-12">
  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto">
    <User className="w-10 h-10 text-gray-400" />
  </div>
  <h3>Aucun patient en consultation</h3>
  <p>Commencez une consultation depuis la file d'attente...</p>
</div>
```

## 🔐 Sécurité & Validation

### Validation Côté Client
```javascript
// Paiement obligatoire et numérique
if (!consultationForm.paye || isNaN(Number(consultationForm.paye))) {
  setErrorMessage('Le montant payé est obligatoire et doit être un nombre valide');
  return;
}

// Au moins un patient en consultation
if (!currentPatient) {
  setErrorMessage('Aucun patient en consultation');
  return;
}
```

### Gestion des Erreurs d'Authentification
```javascript
if (response.status === 403) {
  logout(); // Déconnexion forcée
  return;
}

if (response.status === 401) {
  const refreshResponse = await refresh(); // Rafraîchir le token
  if (!refreshResponse) {
    logout();
    return;
  }
  // Réessayer la requête
}
```

## 🔄 Workflow Utilisateur

### Scénario Typique

1. **Navigation**
   - Le médecin clique sur "Saisie Consultation" dans le menu

2. **Affichage Patient**
   - La page charge automatiquement le patient en consultation
   - Les informations patient s'affichent dans l'en-tête

3. **Saisie des Données**
   - Le médecin remplit les constantes vitales (optionnel)
   - L'IMC se calcule automatiquement si poids saisi
   - Ajout de notes médicales (optionnel)
   - Saisie du montant payé (obligatoire)

4. **Validation**
   - Clic sur "Enregistrer la consultation"
   - Validation du formulaire
   - Envoi vers l'API

5. **Confirmation**
   - Message de succès affiché
   - Formulaire réinitialisé
   - Patient retiré de la consultation
   - Redirection automatique vers le prochain patient (s'il existe)

### Actions Disponibles

#### Bouton "Réinitialiser"
- Vide tous les champs du formulaire
- Ne modifie pas le patient affiché
- Utile pour corriger une erreur de saisie

#### Bouton "Enregistrer la consultation"
- **État Normal:** Bleu avec icône Save
- **État Chargement:** Spinner + "Enregistrement..."
- **État Désactivé:** Opacité réduite, curseur not-allowed

## 🧪 Tests Recommandés

### Tests Fonctionnels

**Test 1: Chargement du Patient**
- ✅ Patient en consultation affiché correctement
- ✅ Informations patient complètes (nom, âge, taille, etc.)
- ✅ Durée de consultation mise à jour en temps réel

**Test 2: Calcul IMC Automatique**
- ✅ IMC calculé lorsque poids saisi
- ✅ IMC mis à jour si poids modifié
- ✅ IMC non calculé si taille manquante

**Test 3: Validation Formulaire**
- ❌ Envoi échoue si paiement vide
- ❌ Envoi échoue si paiement non numérique
- ✅ Envoi réussi avec seulement le paiement

**Test 4: Sauvegarde Consultation**
- ✅ Données envoyées correctement à l'API
- ✅ Message de succès affiché
- ✅ Formulaire réinitialisé après succès
- ✅ Patient retiré de la consultation

**Test 5: Gestion Erreurs**
- ✅ Message d'erreur si pas de patient
- ✅ Message d'erreur si API échoue
- ✅ Token rafraîchi si 401
- ✅ Déconnexion si 403

### Tests d'Interface

**Test UI 1: Responsive**
- ✅ Affichage correct sur mobile (< 768px)
- ✅ Affichage correct sur tablette (768px - 1024px)
- ✅ Affichage correct sur desktop (> 1024px)

**Test UI 2: Accessibilité**
- ✅ Labels associés aux inputs
- ✅ Messages d'erreur clairs
- ✅ Navigation au clavier possible
- ✅ Contrastes de couleurs suffisants

## 📊 État de l'Application

### State Management
```javascript
// Patient en consultation
const [currentPatient, setCurrentPatient] = useState(null);

// État de chargement
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);

// Messages utilisateur
const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');

// Formulaire
const [consultationForm, setConsultationForm] = useState({
  paSystolique: '',
  paDiastolique: '',
  poids: '',
  imc: '',
  pcm: '',
  pulse: '',
  note: '',
  paye: ''
});
```

## 🎉 Avantages de cette Interface

### Pour le Médecin
- ✅ **Gain de temps:** Saisie rapide pendant ou après consultation
- ✅ **Ergonomie:** Interface claire et colorée
- ✅ **Automatisation:** Calcul IMC automatique
- ✅ **Visibilité:** Patient en cours toujours affiché
- ✅ **Simplicité:** Pas de navigation complexe

### Pour l'Application
- ✅ **Temps réel:** Mise à jour automatique toutes les 5 secondes
- ✅ **Cohérence:** Utilise les mêmes APIs que la file d'attente
- ✅ **Robustesse:** Gestion complète des erreurs
- ✅ **Extensibilité:** Facile d'ajouter de nouveaux champs
- ✅ **Performance:** Polling optimisé, pas de websockets complexes

## 🔮 Évolutions Futures Possibles

- [ ] Signature électronique du médecin
- [ ] Upload de documents (ordonnances, certificats)
- [ ] Historique des consultations précédentes en sidebar
- [ ] Suggestions IA basées sur les symptômes
- [ ] Intégration avec système de prescription
- [ ] Export PDF du résumé de consultation
- [ ] Notifications push si nouveau patient en attente
- [ ] Mode hors-ligne avec synchronisation

## 📝 Notes d'Implémentation

### Dépendances
```json
{
  "framer-motion": "^10.x.x",
  "lucide-react": "^0.x.x",
  "react": "^18.x.x",
  "react-router-dom": "^6.x.x"
}
```

### Structure Fichiers
```
src/
├── pages/
│   └── ConsultationInput.jsx    # Page principale
├── AppSimple.jsx                 # Route ajoutée
└── components/
    └── Layout/
        └── LayoutSimple.jsx      # Lien navigation ajouté
```

### Compatibilité
- ✅ React 18+
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- ✅ Mobile responsive
- ✅ Compatible avec le système d'authentification existant

---

**Commit:** `e3a4681`  
**Branch:** `genspark_ai_developer`  
**PR:** https://github.com/Anis08/cabinetFront/pull/4  
**Status:** ✅ Pushed to remote
