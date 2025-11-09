# 🧪 Module Données Biologiques - Guide de Démonstration

## 📋 Vue d'ensemble du module

Le nouveau module "Données Biologiques" est maintenant intégré dans la page de profil patient. Il permet une gestion complète des analyses biologiques avec :

- ✅ Création de demandes biologiques
- ✅ Génération automatique de numéro de demande
- ✅ Sélection de types de prélèvement (Sang, Urine, Selles, Autre)
- ✅ Choix d'examens multiples (10 types disponibles)
- ✅ Saisie des résultats avec validation automatique
- ✅ Comparaison automatique avec les normes
- ✅ Détection de corrélations entre examens
- ✅ Gestion des dates (prélèvement, validation)
- ✅ États de demande (Récemment créée / Complète)
- ✅ Observations médicales

## 🎯 Fonctionnalités principales

### 1. Interface utilisateur

**Emplacement:** Page de profil patient (PatientProfile.tsx)
- Accès : Cliquez sur un patient → Scroll vers le bas
- Section : "Données Biologiques" (avec icône goutte bleue)

### 2. Création d'une demande

**Étape 1 : Cliquer sur "Nouvelle demande"**
- Ouvre un formulaire complet avec animations

**Étape 2 : Sélectionner les types de prélèvement**
- Cases à cocher : Sang, Urine, Selles, Autre
- Minimum 1 type requis

**Étape 3 : Choisir les examens**
- 10 examens disponibles :
  - NFS (Numération Formule Sanguine)
  - Glycémie à jeun
  - Cholestérol total
  - Créatinine
  - TSH (Hormone thyroïdienne)
  - HbA1c (Hémoglobine glyquée)
  - Ionogramme
  - Bilan hépatique
  - Bilan rénal
  - Bilan lipidique
- Minimum 1 examen requis

**Étape 4 : Saisir les résultats (optionnel)**
- Champs numériques pour chaque examen sélectionné
- Affichage automatique des valeurs normales
- Indication en temps réel du statut :
  - ✓ **Vert** : Normale
  - ⚠ **Orange** : Limite
  - ✗ **Rouge** : Hors norme

**Étape 5 : Dates et validation**
- Date de prélèvement (optionnelle à la création)
- Date de validation (optionnelle)
- État : Récemment créée / Complète

**Étape 6 : Observation médicale**
- Champ texte libre pour commentaires
- Permet d'ajouter des interprétations

### 3. Calculs automatiques

#### Comparaison avec les normes

Le système compare automatiquement chaque valeur avec les plages normales :

```
Glycémie: 0.7 - 1.1 g/L
  → 0.95 g/L = ✓ Normale
  → 1.2 g/L = ✗ Hors norme
  → 1.08 g/L = ⚠ Limite

Cholestérol: 1.5 - 2.0 g/L
  → 1.8 g/L = ✓ Normale
  → 2.3 g/L = ✗ Hors norme
```

#### Corrélations détectées automatiquement

**1. Glycémie ↔ HbA1c**
```
Si Glycémie > 1.1 ET HbA1c > 6.0
→ "⚠️ Glycémie et HbA1c élevées : risque diabétique confirmé"
```

**2. Cholestérol ↔ Bilan lipidique**
```
Si Cholestérol > 2.0 ET Triglycérides > 1.6
→ "⚠️ Dyslipidémie mixte : risque cardiovasculaire élevé"
```

**3. Créatinine ↔ Bilan rénal**
```
Si Créatinine > 13 ET Clairance < 80
→ "⚠️ Insuffisance rénale détectée : suivi nécessaire"
```

### 4. Affichage des demandes existantes

**Vue en carte** pour chaque demande :
- Numéro de demande (ex: BIO-2024-001)
- État visuel (🔴 Récemment créée / 🟢 Complète)
- Dates importantes (création, prélèvement, validation)
- Types de prélèvement (badges colorés)
- Tableau des résultats avec statuts
- Corrélations automatiques affichées
- Observations médicales
- Informations du médecin prescripteur

**Actions disponibles :**
- ✏️ **Modifier** : Éditer une demande existante
- Les modifications mettent à jour les calculs automatiquement

### 5. Workflow typique

#### Scénario 1 : Demande sans résultats

```
1. Médecin crée une demande
2. Sélectionne : Sang
3. Choisit : Glycémie, HbA1c, Cholestérol
4. État : "Récemment créée"
5. Enregistre

→ Le patient va au laboratoire
→ Le médecin recevra les résultats plus tard
```

#### Scénario 2 : Ajout des résultats

```
1. Médecin clique "Modifier" sur la demande
2. Ajoute la date de prélèvement : 10/11/2024
3. Saisit les valeurs :
   - Glycémie : 0.95 g/L → ✓ Normale
   - HbA1c : 5.8% → ✓ Normale
   - Cholestérol : 2.3 g/L → ✗ Hors norme
4. État : "Complète"
5. Ajoute observation : "Cholestérol élevé, revoir régime alimentaire"
6. Date de validation : 11/11/2024
7. Enregistre

→ Les corrélations sont calculées automatiquement
→ La demande est marquée comme complète
```

## 🎨 Design et UX

### Animations
- Entrée/sortie du formulaire : Framer Motion
- Transitions fluides entre les états
- Feedback visuel immédiat

### Codes couleur
- **Violet/Bleu** : Actions principales
- **Vert** : Valeurs normales
- **Orange** : Valeurs limites / Avertissements
- **Rouge** : Valeurs hors norme / Attention
- **Gris** : En attente de données

### Responsive Design
- Adapté mobile et desktop
- Grilles flexibles pour les formulaires
- Tableaux scrollables sur petits écrans

## 🔧 Configuration technique

### Composant principal
```
src/components/Patients/BiologicalDataSection.jsx
```

### Intégration
```tsx
// Dans PatientProfile.tsx
import BiologicalDataSection from '../components/Patients/BiologicalDataSection';

// Utilisation
<BiologicalDataSection patientId={patientId} />
```

### Props requises
- `patientId` : ID du patient actif (string ou number)

### Dépendances
- React 18+
- Framer Motion (animations)
- Lucide React (icônes)
- baseURL depuis config.js
- AuthProvider pour l'authentification

## 🌐 Intégration Backend

### Endpoints requis

1. **GET** `/medecin/biological-requests/:patientId`
   - Récupère toutes les demandes d'un patient

2. **POST** `/medecin/biological-requests`
   - Crée une nouvelle demande

3. **PUT** `/medecin/biological-requests/:requestId`
   - Met à jour une demande existante

**Note :** Voir `BIOLOGICAL_DATA_API.md` pour la documentation complète de l'API.

## 📊 Données de test

### Exemple de demande complète

```json
{
  "sampleTypes": ["Sang", "Urine"],
  "requestedExams": ["Glycémie", "HbA1c", "Créatinine"],
  "samplingDate": "2024-11-10",
  "results": {
    "Glycémie": "1.25",
    "HbA1c": "6.5",
    "Créatinine": "15"
  },
  "validationDate": "2024-11-11",
  "status": "Complète",
  "medicalObservation": "Diabète non contrôlé, ajuster traitement"
}
```

### Résultat attendu
- Glycémie : ✗ Hors norme (> 1.1)
- HbA1c : ✗ Hors norme (> 6.0)
- Créatinine : ✗ Hors norme (> 13)
- **Corrélation détectée :** "⚠️ Glycémie et HbA1c élevées : risque diabétique confirmé"

## 🐛 Troubleshooting

### Problème : Le formulaire ne s'affiche pas
**Solution :** Vérifier que le composant est bien importé dans PatientProfile.tsx

### Problème : Erreur 401 lors de la sauvegarde
**Solution :** Le token JWT a expiré, le système tente un refresh automatique

### Problème : Les corrélations ne s'affichent pas
**Solution :** S'assurer que les deux examens liés ont des valeurs saisies

### Problème : Le bouton "Enregistrer" est désactivé
**Solution :** Au moins un type de prélèvement ET un examen doivent être sélectionnés

## 📝 Checklist de test

- [ ] Créer une nouvelle demande sans résultats
- [ ] Créer une demande avec résultats normaux
- [ ] Créer une demande avec résultats hors norme
- [ ] Modifier une demande existante
- [ ] Ajouter des résultats à une demande vide
- [ ] Tester les corrélations Glycémie-HbA1c
- [ ] Tester les corrélations Cholestérol-Triglycérides
- [ ] Tester les corrélations Créatinine-Clairance rénale
- [ ] Vérifier l'affichage responsive mobile
- [ ] Vérifier les animations d'ouverture/fermeture
- [ ] Tester l'annulation du formulaire
- [ ] Vérifier l'affichage des badges de statut
- [ ] Tester la modification de l'état (Récemment créée → Complète)

## 🚀 Prochaines améliorations possibles

1. **Export PDF** des résultats
2. **Graphiques d'évolution** des valeurs dans le temps
3. **Alertes automatiques** pour valeurs critiques
4. **Templates de demandes** fréquentes
5. **Import de fichiers** PDF de laboratoire
6. **Historique des modifications**
7. **Notification** au patient des résultats disponibles
8. **Comparaison** avec les analyses précédentes
9. **Statistiques** par type d'examen
10. **Intégration** avec systèmes de laboratoire

## 📞 Support

Pour toute question ou amélioration :
- Consulter `BIOLOGICAL_DATA_API.md` pour l'API backend
- Voir le code source dans `src/components/Patients/BiologicalDataSection.jsx`
- Tester dans la page de profil patient

---

**Module développé avec ❤️ pour améliorer la gestion des données biologiques dans les cabinets médicaux** 🏥
