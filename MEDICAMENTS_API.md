# 💊 API Médicaments - Documentation

## 📋 Vue d'ensemble

Le frontend charge maintenant tous les médicaments depuis l'API au démarrage pour une recherche ultra-rapide et instantanée.

---

## 🔐 Endpoint: Récupérer tous les médicaments

### **GET** `/medecin/medicaments/`

Récupère la liste complète de tous les médicaments disponibles avec leurs dosages.

---

## 📤 Requête

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Paramètres
Aucun paramètre requis. L'endpoint retourne tous les médicaments.

---

## 📥 Réponse

### Succès (200 OK)

```json
{
  "medicaments": [
    {
      "id": 1,
      "nom": "Doliprane",
      "moleculeMereId": 1,
      "type": "Antalgique",
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z",
      "dosages": [
        {
          "id": 1,
          "valeur": "500 mg",
          "medicamentId": 1
        },
        {
          "id": 2,
          "valeur": "1 g",
          "medicamentId": 1
        }
      ],
      "moleculeMereRel": {
        "id": 1,
        "nom": "Paracétamol"
      },
      "ordonnanceMedicaments": [],
      "demandeMedicaments": []
    },
    {
      "id": 2,
      "nom": "Amoxicilline Biogaran",
      "moleculeMereId": 2,
      "type": "Antibiotique",
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z",
      "dosages": [
        {
          "id": 3,
          "valeur": "500 mg",
          "medicamentId": 2
        },
        {
          "id": 4,
          "valeur": "250 mg",
          "medicamentId": 2
        }
      ],
      "moleculeMereRel": {
        "id": 2,
        "nom": "Amoxicilline"
      },
      "ordonnanceMedicaments": [],
      "demandeMedicaments": []
    }
  ],
  "stats": {
    "total": 5,
    "types": 4
  },
  "message": "Médicaments récupérés avec succès"
}
```

### Structure d'un Médicament

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Number | ID unique du médicament |
| `nom` | String | Nom commercial du médicament |
| `moleculeMereId` | Number | ID de la molécule mère |
| `type` | String | Type thérapeutique (Antalgique, Antibiotique, etc.) |
| `createdAt` | String (ISO 8601) | Date de création |
| `updatedAt` | String (ISO 8601) | Date de dernière modification |
| `dosages` | Array | Liste des dosages disponibles |
| `moleculeMereRel` | Object | Relation vers la molécule mère |
| `ordonnanceMedicaments` | Array | Relations vers les ordonnances |
| `demandeMedicaments` | Array | Relations vers les demandes |

### Structure d'un Dosage

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Number | ID unique du dosage |
| `valeur` | String | Valeur du dosage (ex: "500 mg", "1 g") |
| `medicamentId` | Number | ID du médicament parent |

### Structure de MoleculeMereRel

| Champ | Type | Description |
|-------|------|-------------|
| `id` | Number | ID de la molécule |
| `nom` | String | Nom de la molécule (ex: "Paracétamol") |

### Structure de Stats

| Champ | Type | Description |
|-------|------|-------------|
| `total` | Number | Nombre total de médicaments |
| `types` | Number | Nombre de types différents |

---

## ❌ Erreurs Possibles

### 401 Unauthorized
```json
{
  "message": "Token invalide ou expiré"
}
```

### 403 Forbidden
```json
{
  "message": "Accès interdit - Rôle médecin requis"
}
```

### 500 Internal Server Error
```json
{
  "message": "Erreur interne du serveur",
  "error": "Détails de l'erreur"
}
```

---

## 🔧 Implémentation Backend (Exemple)

### Node.js/Express + Sequelize/Prisma

```javascript
// routes/medecin/medicaments.js
const express = require('express');
const router = express.Router();
const { verifyToken, isMedecin } = require('../../middleware/auth');
const { Medicament, Dosage, MoleculeMere } = require('../../models');

router.get('/medicaments/', verifyToken, isMedecin, async (req, res) => {
  try {
    // Récupérer tous les médicaments avec leurs relations
    const medicaments = await Medicament.findAll({
      include: [
        {
          model: Dosage,
          as: 'dosages',
          attributes: ['id', 'valeur', 'medicamentId']
        },
        {
          model: MoleculeMere,
          as: 'moleculeMereRel',
          attributes: ['id', 'nom']
        }
      ],
      order: [['nom', 'ASC']]
    });

    // Calculer les statistiques
    const types = new Set(medicaments.map(m => m.type));
    
    res.json({
      medicaments,
      stats: {
        total: medicaments.length,
        types: types.size
      },
      message: 'Médicaments récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur récupération médicaments:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 💡 Utilisation Frontend

### Chargement au Démarrage

Le composant `MedicationSelector` charge automatiquement tous les médicaments au montage :

```javascript
useEffect(() => {
  const fetchMedicaments = async () => {
    const response = await fetch(`${baseURL}/medecin/medicaments/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    setMedicaments(data.medicaments)
  }
  
  fetchMedicaments()
}, [])
```

### Recherche Locale Instantanée

Une fois chargés, les médicaments sont filtrés localement :

```javascript
const filtered = medicaments.filter(med =>
  med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
  med.moleculeMereRel.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
  med.type.toLowerCase().includes(searchTerm.toLowerCase())
)
```

### Sélection d'un Dosage

```javascript
const handleSelectDosage = (medicament, dosage) => {
  onSelect({
    id: medicament.id,
    nom: medicament.nom,
    dosage: dosage.valeur,
    moleculeMere: medicament.moleculeMereRel.nom,
    type: medicament.type,
    // ... autres champs
  })
}
```

---

## ⚡ Performance

### Avantages du Chargement Complet

✅ **Une seule requête** : Chargement au démarrage uniquement
✅ **Recherche instantanée** : Filtrage local ultra-rapide
✅ **Pas de délai** : Aucune attente pendant la frappe
✅ **Offline-ready** : Données en mémoire
✅ **Moins de charge serveur** : Pas de requêtes répétées

### Considérations

⚠️ **Taille des données** : 
- Acceptable jusqu'à ~1000-2000 médicaments
- Au-delà, envisager pagination ou recherche serveur

⚠️ **Mémoire** :
- ~1KB par médicament avec dosages
- 1000 médicaments ≈ 1MB (acceptable)

### Optimisations Possibles

Si la base devient très grande (10000+ médicaments) :

1. **Recherche serveur** avec debouncing
2. **Pagination** ou lazy loading
3. **Cache** avec IndexedDB
4. **Compression** des données

---

## 🧪 Test avec cURL

```bash
curl -X GET http://localhost:4000/medecin/medicaments/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🔒 Sécurité

### ✅ Implémentées

1. **Authentification JWT** : Token requis
2. **Vérification rôle** : Seuls les médecins
3. **Validation automatique** : Via ORM/middleware

### 🔐 Recommandations

- Rate limiting (max 10 requêtes/minute)
- Cache côté serveur (Redis, 5 minutes)
- Logging des accès
- Validation des relations (medicamentId valide)

---

## 📊 Types Thérapeutiques Standards

```javascript
const TYPES = [
  'Antalgique',           // Doliprane, Efferalgan
  'Antibiotique',         // Amoxicilline, Augmentin
  'Anti-inflammatoire',   // Ibuprofène, Advil
  'Antiagrégant',        // Aspirine, Plavix
  'Anti-acide',          // Maalox, Gaviscon
  'Antihistaminique',    // Aerius, Zyrtec
  'Bronchodilatateur',   // Ventoline, Salbumol
  'Corticoïde',          // Cortisone, Prednisolone
  'Antidiabétique',      // Metformine, Glucophage
  'Antihypertenseur',    // Ramipril, Amlodipine
  'Hypolipémiant',       // Statines, Crestor
  'Hormone thyroïdienne', // Levothyrox
  'Anti-diarrhéique',    // Smecta, Imodium
  'Antispasmodique',     // Spasfon, Debridat
  'Veinotonique'         // Daflon, Ginkor
]
```

---

## 🗄️ Modèles de Données

### Schéma Medicament (Sequelize)

```javascript
const Medicament = sequelize.define('Medicament', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  moleculeMereId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'MoleculeMeres',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  }
});
```

### Schéma Dosage (Sequelize)

```javascript
const Dosage = sequelize.define('Dosage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  valeur: {
    type: DataTypes.STRING,
    allowNull: false
  },
  medicamentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Medicaments',
      key: 'id'
    }
  }
});
```

### Relations

```javascript
Medicament.hasMany(Dosage, { as: 'dosages', foreignKey: 'medicamentId' })
Dosage.belongsTo(Medicament, { foreignKey: 'medicamentId' })

Medicament.belongsTo(MoleculeMere, { as: 'moleculeMereRel', foreignKey: 'moleculeMereId' })
MoleculeMere.hasMany(Medicament, { foreignKey: 'moleculeMereId' })
```

---

## 🐛 Troubleshooting

### Problème : Aucun médicament chargé

**Solutions** :
1. Vérifier que le backend retourne des données
2. Vérifier le token JWT
3. Inspecter la console du navigateur
4. Tester l'endpoint avec cURL

### Problème : Recherche lente

**Solutions** :
1. Vérifier le nombre de médicaments (<2000 OK)
2. Optimiser le filtrage (mémoïzation)
3. Debounce la recherche (300ms)

### Problème : Dosages manquants

**Solutions** :
1. Vérifier l'inclusion dans la requête Sequelize
2. Vérifier les relations foreign keys
3. Peupler la table Dosages

---

## ✅ Checklist Backend

- [ ] Créer tables Medicament, Dosage, MoleculeMere
- [ ] Définir les relations (hasMany, belongsTo)
- [ ] Implémenter la route GET /medecin/medicaments/
- [ ] Ajouter authentification JWT
- [ ] Vérifier rôle médecin
- [ ] Inclure dosages et moleculeMereRel
- [ ] Trier par nom (ORDER BY)
- [ ] Retourner statistiques
- [ ] Tester avec données réelles
- [ ] Ajouter rate limiting
- [ ] Considérer le cache Redis

---

## 📝 Migration des Données

Si vous aviez des médicaments en localStorage :

```javascript
// Script de migration (à exécuter une fois)
const migrateToAPI = async () => {
  const localMeds = JSON.parse(localStorage.getItem('medicaments') || '[]')
  
  for (const med of localMeds) {
    await fetch(`${baseURL}/admin/medicaments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nom: med.nom,
        type: med.type,
        moleculeMere: med.moleculeMere,
        dosages: [med.dosage]
      })
    })
  }
  
  localStorage.removeItem('medicaments')
  console.log('Migration terminée!')
}
```

---

## 🎯 Points Clés

✅ **Chargement unique** au démarrage
✅ **Recherche instantanée** locale
✅ **Structure normalisée** de l'API
✅ **Relations** avec molécules et dosages
✅ **Performance optimale** pour <2000 médicaments
✅ **États de chargement** et d'erreur gérés
✅ **Compatible** avec le système d'ordonnances

Le système est maintenant optimisé pour des performances maximales ! 🚀
