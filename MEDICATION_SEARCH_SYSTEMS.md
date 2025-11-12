# 💊 Systèmes de Recherche de Médicaments

## 📋 Vue d'ensemble

L'application propose **deux systèmes différents** de recherche de médicaments, chacun adapté à un contexte d'utilisation spécifique.

---

## 🔍 Système 1 : Autocomplétion (Utilisé dans les Ordonnances)

### 📂 Fichier
`src/components/Ordonnances/MedicationSelector.jsx`

### ✨ Fonctionnement
1. **Tapez 2+ caractères** dans le champ de recherche
2. **Liste déroulante automatique** avec les suggestions
3. **Recherche intelligente** : nom du médicament OU molécule mère
4. **Cliquez sur un médicament** pour voir tous les dosages disponibles
5. **Sélectionnez le dosage souhaité** → Rempli automatiquement le formulaire

### 🎯 Avantages
- ✅ **Rapide** : Recherche instantanée pendant la frappe
- ✅ **Intuitif** : Comme Google search
- ✅ **Flexible** : Recherche par nom ou molécule
- ✅ **Visuel** : Affiche fabricant, forme, type
- ✅ **Groupé** : Tous les dosages d'un médicament ensemble

### 📸 Exemple d'utilisation
```
1. Tapez : "doli"
   → Dropdown affiche : Doliprane (Paracétamol • Antalgique)
   
2. Cliquez sur "Doliprane"
   → Affiche les dosages : 500mg, 1000mg
   
3. Cliquez sur "1000mg"
   → Formulaire rempli automatiquement !
```

### 🔴 Si médicament non trouvé
- **Option 1** : "Utiliser quand même" → Saisie manuelle
- **Option 2** : "Demander l'ajout" → Envoie une demande à l'admin

---

## 🎯 Système 2 : Sélection en Cascade (Disponible mais non utilisé actuellement)

### 📂 Fichier
`src/components/Ordonnances/MedicationSelectorCascade.jsx`

### ✨ Fonctionnement
Navigation guidée en 4 étapes :
1. **Étape 1** : Sélectionner le nom (dropdown)
2. **Étape 2** : Sélectionner le dosage (dropdown)
3. **Étape 3** : Sélectionner la forme (dropdown)
4. **Étape 4** : Sélectionner la molécule (dropdown si plusieurs)

### 🎯 Avantages
- ✅ **Guidé** : Impossible de se tromper
- ✅ **Breadcrumb** : Navigation claire
- ✅ **Filtrage progressif** : Chaque étape réduit les options
- ✅ **Retour en arrière** : Facile à chaque étape

### 📸 Exemple d'utilisation
```
1. Nom : Choisir "Doliprane"
   → Passe automatiquement à l'étape 2

2. Dosage : Choisir "1000mg"
   → Passe automatiquement à l'étape 3

3. Forme : Choisir "Comprimé"
   → Passe automatiquement à l'étape 4 (ou finalise si une seule molécule)

4. Finaliser : Compléter fréquence et durée
   → Ajouter à l'ordonnance
```

---

## 🔄 Comparaison

| Critère | Autocomplétion | Cascade |
|---------|---------------|---------|
| **Vitesse** | ⚡⚡⚡ Ultra rapide | ⚡⚡ Rapide |
| **Facilité** | ⭐⭐⭐ Très facile | ⭐⭐ Facile |
| **Guidage** | ⭐⭐ Minimal | ⭐⭐⭐ Maximal |
| **Flexibilité** | ⭐⭐⭐ Très flexible | ⭐ Rigide |
| **Recherche** | Nom + Molécule | Nom uniquement |
| **Saisie libre** | ✅ Oui | ❌ Non (sauf mode manuel) |

---

## 🏥 Utilisation Actuelle

### ✅ Dans les Ordonnances
**Système utilisé** : **Autocomplétion** (`MedicationSelector.jsx`)

**Raison** : 
- Plus rapide pour les prescriptions fréquentes
- Recherche flexible (nom ou molécule)
- Interface familière pour les médecins
- Permet la saisie manuelle si nécessaire

### ✅ Dans le Profil Patient
**Système utilisé** : **Cascade** (`MedicationSelectorCascade.jsx`)

**Raison** :
- Contexte différent (historique, pas prescription)
- Guidage plus important
- Navigation structurée

---

## 🔧 Comment Changer de Système

Si vous souhaitez utiliser le système en cascade dans les ordonnances :

### Étape 1 : Modifier l'import dans OrdonnanceEditor.jsx
```javascript
// Remplacer
import MedicationSelector from './MedicationSelector'

// Par
import MedicationSelector from './MedicationSelectorCascade'
```

### Étape 2 : Tester
```bash
npm run dev
# Créer une nouvelle ordonnance
# Tester la recherche de médicaments
```

---

## 📊 Base de Données Requise

Les deux systèmes nécessitent une base de médicaments dans localStorage :

```javascript
// Structure attendue
const medicaments = [
  {
    nom: "Doliprane",
    dosage: "1000mg",
    forme: "Comprimé",
    moleculeMere: "Paracétamol",
    fabricant: "Sanofi",
    type: "Antalgique",
    frequence: "3 fois par jour"  // optionnel
  },
  // ... autres médicaments
]

// Stockage
localStorage.setItem('medicaments', JSON.stringify(medicaments))
```

---

## 🐛 Débogage

### Problème : Aucune suggestion n'apparaît

**Solution** :
1. Vérifier que la base de données existe :
```javascript
console.log(JSON.parse(localStorage.getItem('medicaments')))
```

2. Vérifier que vous tapez au moins 2 caractères

3. Vérifier les noms des médicaments (sensible à la casse dans la recherche)

### Problème : Le dropdown ne se ferme pas

**Solution** : Cliquer en dehors du dropdown ou appuyer sur Échap

---

## 🎨 Personnalisation

### Modifier le nombre minimum de caractères
```javascript
// Dans MedicationSelector.jsx
if (searchTerm.length >= 2) { // Changer 2 par 1 ou 3
```

### Modifier le nombre de résultats
```javascript
// Pas de limite actuellement, tous les résultats sont affichés
// Pour limiter, ajouter :
const filtered = medicamentsDB
  .filter(...)
  .slice(0, 10) // Limite à 10 résultats
```

---

## 📝 Commits Associés

- `89c3b31` - Restauration du système d'autocomplétion
- `4e7f494` - Première tentative (système en cascade, corrigée)
- `bd79750` - Amélioration gestion d'erreur
- `65a0eec` - Documentation backend

---

## 💡 Recommandations

### Pour les prescriptions fréquentes
➡️ **Autocomplétion** (système actuel)

### Pour les utilisateurs novices
➡️ **Cascade** (guidage étape par étape)

### Pour une base de données limitée
➡️ **Cascade** (voir tous les médicaments facilement)

### Pour une grande base de données
➡️ **Autocomplétion** (recherche rapide et précise)
