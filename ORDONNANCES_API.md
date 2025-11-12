# 💊 API Ordonnances - Documentation Backend

## 📋 Vue d'ensemble

Cette documentation décrit l'endpoint API requis côté backend pour la sauvegarde des ordonnances médicales.

---

## 🔐 Endpoint: Créer une Ordonnance

### **POST** `/medecin/ordonnances`

Crée une nouvelle ordonnance pour un patient.

---

## 📤 Requête

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Body (JSON)
```json
{
  "patientId": "507f1f77bcf86cd799439011",
  "dateValidite": "2024-12-12T00:00:00.000Z",
  "note": "Observations et recommandations du médecin",
  "medicaments": [
    {
      "medicamentId": "507f191e810c19729de860ea",
      "nom": "Doliprane",
      "dosage": "1000mg",
      "forme": "Comprimé",
      "posologie": "3 fois par jour",
      "duree": "7 jours",
      "momentPrise": "Après les repas",
      "instructions": "Ne pas écraser le comprimé"
    },
    {
      "medicamentId": null,
      "nom": "Médicament personnalisé",
      "dosage": "500mg",
      "forme": "Gélule",
      "posologie": "2 fois par jour",
      "duree": "10 jours",
      "momentPrise": "Matin et soir",
      "instructions": ""
    }
  ]
}
```

### Paramètres du Body

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `patientId` | String | ✅ Oui | ID du patient (MongoDB ObjectId ou UUID) |
| `dateValidite` | String (ISO 8601) | ✅ Oui | Date de validité de l'ordonnance (par défaut: +30 jours) |
| `note` | String | ❌ Non | Observations et recommandations |
| `medicaments` | Array | ✅ Oui | Liste des médicaments (min: 1) |

### Paramètres d'un Médicament

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `medicamentId` | String \| null | ❌ Non | ID du médicament dans la base (null si saisie manuelle) |
| `nom` | String | ✅ Oui | Nom du médicament |
| `dosage` | String | ✅ Oui | Dosage (ex: "1000mg", "5ml") |
| `forme` | String | ✅ Oui | Forme (Comprimé, Gélule, Sirop, etc.) |
| `posologie` | String | ✅ Oui | Fréquence de prise (ex: "3 fois par jour") |
| `duree` | String | ✅ Oui | Durée du traitement (ex: "7 jours", "1 mois") |
| `momentPrise` | String | ❌ Non | Moment de prise (ex: "Après les repas") |
| `instructions` | String | ❌ Non | Instructions spéciales |

---

## 📥 Réponse

### Succès (201 Created)

```json
{
  "success": true,
  "message": "Ordonnance créée avec succès",
  "ordonnance": {
    "_id": "507f1f77bcf86cd799439012",
    "numero": "ORD-2024-00123",
    "patientId": "507f1f77bcf86cd799439011",
    "medecinId": "507f1f77bcf86cd799439010",
    "dateCreation": "2024-11-12T10:30:00.000Z",
    "dateValidite": "2024-12-12T00:00:00.000Z",
    "note": "Observations et recommandations du médecin",
    "medicaments": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "medicamentId": "507f191e810c19729de860ea",
        "nom": "Doliprane",
        "dosage": "1000mg",
        "forme": "Comprimé",
        "posologie": "3 fois par jour",
        "duree": "7 jours",
        "momentPrise": "Après les repas",
        "instructions": "Ne pas écraser le comprimé"
      }
    ],
    "status": "active",
    "createdAt": "2024-11-12T10:30:00.000Z",
    "updatedAt": "2024-11-12T10:30:00.000Z"
  }
}
```

### Erreur (400 Bad Request)

```json
{
  "success": false,
  "message": "Données invalides",
  "errors": [
    "Le champ patientId est requis",
    "Au moins un médicament doit être fourni"
  ]
}
```

### Erreur (401 Unauthorized)

```json
{
  "success": false,
  "message": "Token invalide ou expiré"
}
```

### Erreur (404 Not Found)

```json
{
  "success": false,
  "message": "Patient non trouvé"
}
```

### Erreur (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Erreur interne du serveur",
  "error": "Détails de l'erreur"
}
```

---

## 🗄️ Modèle de Données

### Schéma MongoDB (Exemple)

```javascript
const OrdonnanceSchema = new mongoose.Schema({
  numero: {
    type: String,
    unique: true,
    required: true,
    // Format: ORD-YYYY-XXXXX
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  medecinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medecin',
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateValidite: {
    type: Date,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  medicaments: [{
    medicamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicament',
      default: null
    },
    nom: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    forme: {
      type: String,
      required: true
    },
    posologie: {
      type: String,
      required: true
    },
    duree: {
      type: String,
      required: true
    },
    momentPrise: String,
    instructions: String
  }],
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});
```

---

## 🔧 Implémentation Backend (Exemple Node.js/Express)

```javascript
// routes/medecin/ordonnances.js
const express = require('express');
const router = express.Router();
const { verifyToken, isMedecin } = require('../../middleware/auth');
const Ordonnance = require('../../models/Ordonnance');
const Patient = require('../../models/Patient');

router.post('/ordonnances', verifyToken, isMedecin, async (req, res) => {
  try {
    const { patientId, dateValidite, note, medicaments } = req.body;
    const medecinId = req.user.id; // Depuis le token JWT

    // Validation
    if (!patientId || !dateValidite || !medicaments || medicaments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: []
      });
    }

    // Vérifier que le patient existe
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }

    // Générer un numéro d'ordonnance unique
    const year = new Date().getFullYear();
    const count = await Ordonnance.countDocuments();
    const numero = `ORD-${year}-${String(count + 1).padStart(5, '0')}`;

    // Créer l'ordonnance
    const ordonnance = new Ordonnance({
      numero,
      patientId,
      medecinId,
      dateValidite,
      note,
      medicaments,
      status: 'active'
    });

    await ordonnance.save();

    res.status(201).json({
      success: true,
      message: 'Ordonnance créée avec succès',
      ordonnance
    });
  } catch (error) {
    console.error('Erreur création ordonnance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 🧪 Test avec cURL

```bash
curl -X POST http://localhost:4000/medecin/ordonnances \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "507f1f77bcf86cd799439011",
    "dateValidite": "2024-12-12T00:00:00.000Z",
    "note": "Repos recommandé",
    "medicaments": [
      {
        "medicamentId": "507f191e810c19729de860ea",
        "nom": "Doliprane",
        "dosage": "1000mg",
        "forme": "Comprimé",
        "posologie": "3 fois par jour",
        "duree": "7 jours",
        "momentPrise": "Après les repas",
        "instructions": ""
      }
    ]
  }'
```

---

## 📊 Endpoints Complémentaires (Recommandés)

### Lister les ordonnances d'un patient
```
GET /medecin/patients/:patientId/ordonnances
```

### Récupérer une ordonnance spécifique
```
GET /medecin/ordonnances/:ordonnanceId
```

### Mettre à jour une ordonnance
```
PUT /medecin/ordonnances/:ordonnanceId
```

### Annuler une ordonnance
```
DELETE /medecin/ordonnances/:ordonnanceId
```

---

## 🔒 Sécurité

### ✅ Bonnes pratiques implémentées

1. **Authentification JWT** : Token requis dans Authorization header
2. **Vérification du rôle** : Seuls les médecins peuvent créer des ordonnances
3. **Validation des données** : Vérification des champs requis
4. **Vérification de l'existence** : Le patient doit exister
5. **Numéro unique** : Génération automatique d'un numéro d'ordonnance

### 🔐 Recommandations supplémentaires

- Vérifier que le médecin a accès au patient
- Logger toutes les créations d'ordonnances (audit trail)
- Limiter le nombre d'ordonnances par jour (rate limiting)
- Valider les formats des dosages et durées
- Notification au patient (email/SMS) lors de la création

---

## 📝 Notes de Développement

### Frontend → Backend Mapping

```javascript
// Frontend envoie
{
  posologie: "3 fois par jour",  // frequence
  duree: "7 jours"
}

// Backend stocke
{
  posologie: "3 fois par jour",
  duree: "7 jours"
}
```

### Date de Validité

Par défaut, l'ordonnance est valide **30 jours** à partir de la date de création :

```javascript
// Frontend calcule
dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

// Backend peut recalculer ou valider
```

---

## 🐛 Troubleshooting

### Problème : Token non envoyé
**Solution** : Vérifier que `localStorage.getItem('token')` retourne un token valide

### Problème : CORS Error
**Solution** : Configurer CORS sur le backend pour accepter les requêtes depuis le frontend

### Problème : 401 Unauthorized
**Solution** : Vérifier que le token JWT est valide et non expiré

### Problème : 404 Patient non trouvé
**Solution** : Vérifier que l'ID du patient existe dans la base de données

---

## ✅ Checklist d'Implémentation

- [ ] Créer le modèle `Ordonnance` dans la base de données
- [ ] Implémenter la route POST `/medecin/ordonnances`
- [ ] Ajouter l'authentification JWT
- [ ] Vérifier le rôle médecin
- [ ] Valider les données d'entrée
- [ ] Générer un numéro unique d'ordonnance
- [ ] Tester avec des données réelles
- [ ] Configurer CORS si nécessaire
- [ ] Ajouter des logs pour le débogage
- [ ] Implémenter les endpoints de lecture/mise à jour

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs du backend
2. Tester l'endpoint avec cURL ou Postman
3. Vérifier que la base de données est accessible
4. Valider le format des données envoyées
