# Guide de Gestion des Médicaments

## 📋 Vue d'ensemble

La page **Médicaments** vous permet de gérer une base de données complète de médicaments pour faciliter la création d'ordonnances.

## 🎯 Fonctionnalités Principales

### 1. Base de Données Pré-remplie

La base contient **25 médicaments** par défaut incluant:

#### Antalgiques
- Doliprane 1000mg (Paracétamol) - Sanofi
- Efferalgan 500mg (Paracétamol) - UPSA
- Paracétamol Sirop 120mg/5ml - Sanofi

#### Antibiotiques
- Amoxicilline 500mg - Mylan
- Augmentin 1g - GSK
- Azithromycine 250mg - Pfizer
- Clamoxyl 1g - GSK
- Flagyl 500mg - Sanofi
- Ciprofloxacine 500mg - Bayer

#### Anti-inflammatoires
- Ibuprofen 400mg - Advil
- Voltarène 50mg - Novartis

#### Autres catégories
- Antiagrégants (Aspirine)
- Anti-acides (Oméprazole, Gaviscon)
- Antihistaminiques (Loratadine, Cétirizine)
- Bronchodilatateurs (Ventoline)
- Corticoïdes (Prednisolone)
- Antidiabétiques (Metformine)
- Antihypertenseurs (Amlodipine)
- Hypolipimiants (Atorvastatine)
- Hormones thyroïdiennes (Levothyroxine)
- Anti-diarrhéiques (Smecta)
- Antispasmodiques (Spasfon)
- Veinotoniques (Daflon)

## ✏️ Gestion des Médicaments

### Ajouter un Médicament

1. Cliquez sur **"Ajouter un médicament"** (bouton vert en haut à droite)
2. Remplissez le formulaire:
   - **Nom** : Nom commercial (ex: Doliprane) *
   - **Dosage** : Concentration (ex: 1000mg) *
   - **Forme** : Sélectionner dans la liste (Comprimé, Gélule, Sirop, etc.) *
   - **Fabricant** : Laboratoire pharmaceutique (ex: Sanofi) *
   - **Molécule mère** : DCI / Principe actif (ex: Paracétamol) *
   - **Type** : Catégorie thérapeutique (ex: Antalgique) *
   - **Fréquence recommandée** : Posologie standard (ex: 3 fois par jour)
3. Cliquez sur **"Ajouter"**

### Modifier un Médicament

1. Dans la liste, cliquez sur l'icône **crayon** (Edit) à droite
2. Modifiez les informations souhaitées
3. Cliquez sur **"Modifier"**

### Supprimer un Médicament

1. Dans la liste, cliquez sur l'icône **poubelle** (Trash) à droite
2. Confirmez la suppression

## 🔍 Recherche et Filtres

### Recherche Rapide
Utilisez la barre de recherche pour trouver un médicament par:
- Nom commercial
- Molécule mère
- Fabricant

### Filtres Avancés
Cliquez sur le bouton **"Filtres"** pour afficher les options:

1. **Type** : Filtrer par catégorie thérapeutique
   - Antalgique, Antibiotique, Anti-inflammatoire, etc.

2. **Dosage** : Rechercher par concentration
   - Ex: "500mg" pour trouver tous les médicaments de 500mg

3. **Molécule mère** : Filtrer par principe actif
   - Ex: "Paracétamol" pour trouver tous les médicaments à base de paracétamol

4. **Date début** : Médicaments ajoutés après cette date

5. **Date fin** : Médicaments ajoutés avant cette date

**Réinitialiser** : Cliquez sur "Réinitialiser les filtres" pour effacer tous les critères

## 🎯 Intégration avec les Ordonnances

### Autocomplétion Intelligente

Lors de la création d'une ordonnance:

1. Commencez à taper le nom du médicament (minimum 2 caractères)
2. Une liste de suggestions apparaît automatiquement
3. Les suggestions affichent:
   - Nom du médicament
   - Dosage - Forme - Fabricant
   - Molécule mère (en bleu)
4. Cliquez sur une suggestion pour **auto-remplir** les champs:
   - Nom
   - Dosage
   - Forme
   - Fréquence recommandée

### Avantages
✅ **Gain de temps** : Plus besoin de saisir manuellement tous les détails
✅ **Précision** : Évite les erreurs de saisie
✅ **Cohérence** : Utilise toujours les mêmes informations pour chaque médicament
✅ **Historique** : Retrouvez facilement les médicaments que vous prescrivez régulièrement

## 📊 Statistiques

En haut de la page, vous trouvez 3 cartes de statistiques:

1. **Total Médicaments** : Nombre total dans votre base
2. **Types** : Nombre de catégories thérapeutiques différentes
3. **Fabricants** : Nombre de laboratoires différents

## 💾 Stockage

- **LocalStorage** : Les médicaments sont sauvegardés localement dans votre navigateur
- **Persistance** : Les données restent même après fermeture du navigateur
- **Import initial** : Si aucune donnée n'existe, les 25 médicaments par défaut sont chargés automatiquement

## 📋 Tableau de Médicaments

### Colonnes affichées
- **Nom** : Nom commercial
- **Dosage** : Concentration
- **Forme** : Type pharmaceutique
- **Molécule mère** : DCI / Principe actif
- **Type** : Catégorie (avec badge coloré)
- **Fabricant** : Laboratoire
- **Date ajout** : Date d'ajout dans la base
- **Actions** : Modifier / Supprimer

### Tri et Navigation
- Le tableau affiche tous les médicaments filtrés
- Scroll horizontal pour petits écrans
- Hover sur les lignes pour effet visuel

## 🔧 Formes Pharmaceutiques Disponibles

- Comprimé
- Gélule
- Sirop
- Suppositoire
- Injectable
- Crème
- Pommade
- Aérosol
- Suspension buvable
- Poudre pour suspension
- Comprimé effervescent

## 🏷️ Types Thérapeutiques Disponibles

- Antalgique
- Antibiotique
- Anti-inflammatoire
- Antiagrégant
- Anti-acide
- Antihistaminique
- Bronchodilatateur
- Corticoïde
- Antidiabétique
- Antihypertenseur
- Hypolipémiant
- Hormone thyroïdienne
- Anti-diarrhéique
- Antispasmodique
- Veinotonique

## 💡 Conseils d'Utilisation

### Bonnes Pratiques

1. **Complétude** : Remplissez tous les champs obligatoires pour une base de données complète
2. **Cohérence** : Utilisez toujours le même nom pour un médicament
3. **Mise à jour** : Mettez à jour les informations quand les dosages changent
4. **Organisation** : Utilisez les types pour catégoriser correctement
5. **Recherche** : Privilégiez la recherche par molécule mère pour les génériques

### Workflow Recommandé

1. **Pré-remplir** votre base avec tous les médicaments que vous prescrivez souvent
2. **Catégoriser** correctement par type thérapeutique
3. **Utiliser l'autocomplétion** lors de la création d'ordonnances
4. **Ajouter** de nouveaux médicaments au fur et à mesure
5. **Nettoyer** régulièrement les médicaments obsolètes

## 🔒 Sécurité

- ✅ Les données sont stockées localement (privacy)
- ✅ Aucune connexion internet requise pour consulter
- ✅ Backup recommandé via export/import (à venir)

## 🚀 Fonctionnalités Futures

### Prévues
- [ ] Export CSV de la base de données
- [ ] Import CSV pour ajout en masse
- [ ] Historique des modifications
- [ ] Interactions médicamenteuses
- [ ] Contre-indications
- [ ] Prix et remboursement
- [ ] Photos des boîtes
- [ ] Liens vers notices officielles
- [ ] Synchronisation cloud (optionnel)

## 📞 Support

Pour toute question sur la gestion des médicaments:
- Consultez ce guide
- Vérifiez les validations lors de l'ajout
- Utilisez les filtres pour retrouver rapidement

---

**Version** : 1.0.0  
**Date** : Novembre 2024  
**Module** : Gestion des Médicaments
