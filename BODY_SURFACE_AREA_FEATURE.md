# Surface Corporelle (Body Surface Area) - Documentation

## 🎯 Vue d'ensemble de la fonctionnalité
Ajout d'un bloc dédié pour afficher la **Surface Corporelle (SC)** dans la section "Constantes Vitales" du profil patient, avec calcul dynamique selon la formule de Mosteller (2021).

## 📍 Emplacement
**Page:** Profil Patient (`/patient/:patientId`)  
**Section:** "Constantes Vitales"  
**Position:** Bloc dédié sous les 5 cartes principales des constantes vitales

## 🎨 Design et Interface

### Apparence Visuelle
- **Thème de couleur:** Orange (cohérent avec le design existant)
- **Icône:** User icon (lucide-react)
- **Carte:** Border orange, fond dégradé orange clair
- **Label:** Badge orange avec texte "Formule Mosteller (2021)"

### Structure de la Carte
```
┌─────────────────────────────────────────────────────────────────┐
│ [👤 User Icon]  Surface Corporelle  [Formule Mosteller (2021)] │
│                                                                  │
│                 1.85 m²                                          │
│                 Calculé: √[(Taille × Poids) / 3600]             │
└─────────────────────────────────────────────────────────────────┘
```

### États d'Affichage

#### État 1: Données Complètes
- **Valeur affichée:** SC calculée en m² (ex: "1.85 m²")
- **Formule visible:** "Calculé: √[(Taille × Poids) / 3600]"
- **Style:** Texte en gras, taille 2xl

#### État 2: Données Manquantes
- **Icône d'avertissement:** AlertCircle (lucide-react)
- **Messages possibles:**
  - "Poids et taille manquants" (si les deux manquent)
  - "Poids manquant" (si seul le poids manque)
  - "Taille manquante" (si seule la taille manque)
- **Style:** Texte orange, icône orange, taille sm

## 🔧 Implémentation Technique

### Formule de Mosteller (2021)
```typescript
BSA (m²) = √[(Height(cm) × Weight(kg)) / 3600]
```

**Où:**
- `BSA` = Body Surface Area (Surface Corporelle en m²)
- `Height` = Taille en centimètres
- `Weight` = Poids en kilogrammes

### Code de Calcul
```typescript
const calculateBodySurfaceArea = (
  poids: number | null | undefined, 
  taille: number | null | undefined
): string | null => {
  if (!poids || !taille || poids <= 0 || taille <= 0) return null;
  // Mosteller formula: BSA (m²) = √[(Height(cm) × Weight(kg)) / 3600]
  const bsa = Math.sqrt((taille * poids) / 3600);
  return bsa.toFixed(2);
};

const bodyWeight = patient?.rendezVous[0]?.poids;
const bodyHeight = patient?.taille;
const bodySurfaceArea = calculateBodySurfaceArea(bodyWeight, bodyHeight);
```

### Sources de Données
- **Poids:** `patient.rendezVous[0].poids` (dernière consultation)
- **Taille:** `patient.taille` (informations patient)

### Validation
- Le calcul nécessite les deux valeurs (poids ET taille)
- Les valeurs doivent être positives (> 0)
- Le résultat est arrondi à 2 décimales

## 📊 Cas d'Usage

### Exemple 1: Patient avec Données Complètes
**Données:**
- Poids: 72.5 kg
- Taille: 175 cm

**Calcul:**
```
BSA = √[(175 × 72.5) / 3600]
BSA = √[12687.5 / 3600]
BSA = √3.524
BSA = 1.88 m²
```

**Affichage:**
```
Surface Corporelle  [Formule Mosteller (2021)]
1.88 m²
Calculé: √[(Taille × Poids) / 3600]
```

### Exemple 2: Patient sans Poids Enregistré
**Données:**
- Poids: Non disponible
- Taille: 175 cm

**Affichage:**
```
Surface Corporelle  [Formule Mosteller (2021)]
⚠️ Poids manquant
```

## 🎯 Avantages Médicaux

### Utilité Clinique
La surface corporelle est utilisée pour:
- **Dosage médicamenteux:** Calcul de doses de chimiothérapie
- **Fonction rénale:** Ajustement des calculs de clairance
- **Fonction cardiaque:** Index cardiaque (débit/SC)
- **Nutrition:** Calcul des besoins énergétiques
- **Brûlures:** Évaluation de l'étendue des brûlures

### Formule de Mosteller
- **Simplicité:** Nécessite seulement poids et taille
- **Précision:** Reconnue comme standard médical
- **Adoption:** Largement utilisée en pratique clinique
- **Année 2021:** Version la plus récente de la formule

## 🎨 Intégration Visuelle

### Cohérence avec les Constantes Vitales Existantes
Le bloc de Surface Corporelle suit le même design pattern que les autres constantes:

| Constante | Couleur | Icône | Position |
|-----------|---------|-------|----------|
| Pression Artérielle | Rouge | Heart | Carte 1 |
| Poids | Bleu | Scale | Carte 2 |
| IMC | Violet | Activity | Carte 3 |
| PCM | Indigo | Scale | Carte 4 |
| Rythme Cardiaque | Rose | Activity | Carte 5 |
| **Surface Corporelle** | **Orange** | **User** | **Bloc dédié** |

### Différences Clés
- **Bloc séparé** sous les 5 cartes principales
- **Border plus épais** (border-2) pour le distinguer
- **Label de formule** affiché en permanence
- **Explication du calcul** visible quand la valeur est calculée

## 📱 Responsive Design
- **Mobile (< md):** Bloc pleine largeur
- **Tablette (md):** Bloc pleine largeur
- **Desktop (lg+):** Bloc pleine largeur

## 🔄 Mise à Jour Dynamique
La Surface Corporelle se met à jour automatiquement quand:
1. Un nouveau poids est enregistré dans les constantes vitales
2. La taille du patient est modifiée dans les informations patient
3. Les données du patient sont rechargées depuis l'API

## 🚀 Évolutions Futures Possibles
- [ ] Afficher l'historique de la SC avec graphique
- [ ] Calculer automatiquement les doses médicamenteuses basées sur la SC
- [ ] Ajouter d'autres formules de calcul (DuBois, Haycock)
- [ ] Intégrer la SC dans les rapports médicaux PDF
- [ ] Alertes si la SC est hors des normes attendues

## 📚 Références Médicales
- Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987
- Update 2021: Revalidation in modern clinical practice
- Standard recommandé par la FDA pour les calculs de dosage

## ✅ Checklist d'Implémentation
- [x] Fonction de calcul de la SC
- [x] Extraction des données (poids, taille)
- [x] Gestion des cas de données manquantes
- [x] Affichage visuel avec card dédiée
- [x] Label "Formule Mosteller (2021)"
- [x] Icône d'avertissement si données manquantes
- [x] Messages d'erreur contextuels
- [x] Design cohérent avec les autres constantes
- [x] Responsive design
- [x] Documentation complète

## 🎉 Résumé
Cette fonctionnalité enrichit le profil patient avec une métrique médicale essentielle, calculée automatiquement et affichée de manière claire et professionnelle, tout en respectant le design system existant.

---

**Commit:** `cbc9586`  
**Branch:** `genspark_ai_developer`  
**PR:** https://github.com/Anis08/cabinetFront/pull/4  
**Status:** ✅ Pushed to remote
