# Système de Demandes de Médicaments

## 📋 Vue d'ensemble

Le système de demandes de médicaments permet une collaboration efficace pour enrichir la base de données médicamenteuse. Les médecins peuvent demander l'ajout de médicaments manquants, et un administrateur peut les approuver, modifier ou rejeter.

## 🎯 Workflow Complet

### 1. Création d'Ordonnance - Recherche de Médicament

Lors de la création d'une ordonnance, le médecin a accès à un système de recherche avancé:

#### Mode 1: Recherche dans la Base de Données
1. Sélectionner l'onglet **"Rechercher dans la base"**
2. Taper le nom du médicament (minimum 2 caractères)
3. Les résultats s'affichent instantanément
4. Cliquer sur un médicament pour voir ses dosages disponibles
5. Sélectionner le dosage désiré
6. Le formulaire se remplit automatiquement

**Avantages**:
- ✅ Recherche rapide
- ✅ Auto-complétion des champs
- ✅ Affichage de tous les dosages disponibles
- ✅ Informations complètes (fabricant, molécule mère)

#### Mode 2: Saisie Manuelle (Autre)
1. Sélectionner l'onglet **"Saisie manuelle (Autre)"**
2. Entrer le nom du médicament manuellement
3. Deux options disponibles:
   - **Utiliser ce médicament** : L'ajouter directement à l'ordonnance
   - **Demander l'ajout à la base** : Créer une demande d'ajout officielle

### 2. Médicament Non Trouvé

Quand un médicament n'existe pas dans la base:

**Scénario A: Utilisation Immédiate**
- Cliquer sur **"Utiliser quand même"**
- Le médicament est ajouté à l'ordonnance en cours
- ⚠️ Il ne sera PAS sauvegardé dans la base pour usage futur

**Scénario B: Demande d'Ajout Officielle**
- Cliquer sur **"Demander l'ajout"**
- Un formulaire de demande s'ouvre

### 3. Formulaire de Demande d'Ajout

**Champs obligatoires** (*):
- **Nom du médicament** * : Nom commercial
- **Dosage** * : Concentration (ex: 500mg)
- **Forme** * : Sélectionner dans la liste

**Champs optionnels** (mais recommandés):
- **Fabricant** : Laboratoire pharmaceutique
- **Molécule mère** : DCI / Principe actif
- **Type** : Catégorie thérapeutique
- **Raison de la demande** : Justification (optionnel mais utile)

**Données automatiques**:
- Nom du médecin (depuis la session)
- Date de création
- Statut initial: "En attente"

### 4. Page "Demandes Médicaments"

Accessible depuis le menu latéral (icône 📥 Inbox)

#### 4 Onglets Disponibles

**📋 En attente** (Orange)
- Toutes les demandes non traitées
- Actions disponibles: Modifier, Approuver, Rejeter, Supprimer

**✅ Approuvées** (Vert)
- Demandes acceptées et ajoutées à la base
- Actions disponibles: Supprimer

**❌ Rejetées** (Rouge)
- Demandes refusées
- Actions disponibles: Supprimer

**📚 Historique complet** (Violet)
- Toutes les demandes (tous statuts)
- Vue d'ensemble complète

#### Statistiques du Dashboard

4 cartes de statistiques en haut:
1. **En attente** : Nombre de demandes à traiter
2. **Approuvées** : Total des demandes acceptées
3. **Rejetées** : Total des demandes refusées
4. **Total** : Nombre total de demandes

### 5. Actions sur les Demandes

#### Pour les demandes "En attente":

**✏️ Modifier (Icône crayon bleu)**
- Ouvre un modal d'édition
- Permet de corriger/compléter les informations
- Deux boutons au bas:
  - **"Modifier seulement"** : Sauvegarder sans approuver
  - **"Modifier et Approuver"** : Sauvegarder + ajouter à la base

**✅ Approuver (Icône coche verte)**
- Approuve la demande telle quelle
- Ajoute le médicament à la base de données
- Change le statut à "Approuvée"
- Enregistre la date de traitement
- Le médicament devient immédiatement disponible

**❌ Rejeter (Icône X rouge)**
- Rejette la demande avec confirmation
- Change le statut à "Rejetée"
- Enregistre la date de traitement
- Le médicament n'est PAS ajouté à la base

**🗑️ Supprimer (Icône poubelle)**
- Supprime définitivement la demande
- Confirmation requise
- Action irréversible

#### Pour les demandes "Approuvées" ou "Rejetées":

**🗑️ Supprimer uniquement**
- Nettoyer l'historique si besoin
- Confirmation requise

### 6. Affichage des Demandes

Chaque carte de demande affiche:

**Informations principales**:
- Nom du médicament (titre)
- Badge de statut (couleur selon état)
- Dosage
- Forme pharmaceutique
- Fabricant (si renseigné)
- Molécule mère (si renseignée)

**Métadonnées**:
- 👤 Nom du médecin demandeur
- 📅 Date de création
- ✅ Date de traitement (si traité)

**Raison** (si fournie):
- Affichée dans un encadré gris
- Aide à la décision d'approbation

## 🔄 Cycle de Vie d'une Demande

```
┌─────────────────────────────────────────────────┐
│  1. Médecin cherche un médicament               │
│     └─> Non trouvé                              │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  2. Options proposées:                          │
│     • Utiliser quand même (ponctuel)            │
│     • Demander l'ajout (permanent)              │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  3. Formulaire de demande                       │
│     └─> Envoi de la demande                     │
│     └─> Statut: "En attente"                    │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  4. Admin consulte "Demandes Médicaments"       │
│     └─> Onglet "En attente"                     │
└─────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌─────────────┐         ┌─────────────┐
│  5a. Modifier│         │  5b. Rejeter│
│  et Approuver│         │             │
└─────────────┘         └─────────────┘
        │                       │
        ▼                       ▼
┌─────────────┐         ┌─────────────┐
│ Ajout dans  │         │ Statut:     │
│ la base     │         │ "Rejetée"   │
│ Statut:     │         └─────────────┘
│ "Approuvée" │
└─────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│  6. Médicament disponible pour tous             │
│     └─> Apparaît dans les recherches            │
└─────────────────────────────────────────────────┘
```

## 💾 Stockage des Données

### LocalStorage Keys

**`medicationRequests`** : Tableau de toutes les demandes
```javascript
[
  {
    id: 1234567890,
    nom: "Doliprane",
    dosage: "1000mg",
    forme: "Comprimé",
    fabricant: "Sanofi",
    moleculeMere: "Paracétamol",
    type: "Antalgique",
    frequence: "3 fois par jour",
    raison: "Médicament couramment prescrit",
    doctorName: "Dr. Ahmed Benali",
    dateCreation: "2024-11-11T14:30:00.000Z",
    dateTraitement: "2024-11-11T15:00:00.000Z",
    status: "approved" // "pending" | "approved" | "rejected"
  }
]
```

**`medicaments`** : Base de données des médicaments
- Mise à jour automatiquement lors de l'approbation
- Synchronisée entre toutes les pages

## 🎯 Cas d'Usage

### Cas 1: Médicament Urgent Non Disponible
**Problème**: Le médecin a besoin d'un médicament immédiatement mais il n'est pas dans la base.

**Solution**:
1. Mode "Saisie manuelle (Autre)"
2. Entrer le nom manuellement
3. Cliquer "Utiliser ce médicament"
4. Créer l'ordonnance
5. Optionnel: Demander l'ajout pour la prochaine fois

### Cas 2: Enrichissement de la Base
**Objectif**: Ajouter systématiquement les médicaments manquants.

**Workflow**:
1. Rechercher le médicament
2. Si non trouvé: "Demander l'ajout"
3. Remplir le formulaire complet
4. Admin approuve après vérification
5. Le médicament est disponible pour tous

### Cas 3: Demande Incomplète
**Problème**: Un médecin soumet une demande mais oublie des informations.

**Solution**:
1. Admin voit la demande dans "En attente"
2. Clic sur "Modifier" (icône crayon)
3. Compléter les informations manquantes
4. Clic "Modifier et Approuver"
5. Le médicament est ajouté avec les infos complètes

### Cas 4: Doublon ou Erreur
**Problème**: Une demande est en doublon ou erronée.

**Solution**:
1. Admin voit la demande
2. Clic sur "Rejeter"
3. La demande passe en "Rejetée"
4. Optionnel: Supprimer définitivement

## 📊 Rapports et Statistiques

### Métriques Disponibles

**Par Statut**:
- Nombre de demandes en attente
- Nombre de demandes approuvées
- Nombre de demandes rejetées
- Total des demandes

**Informations Détaillées**:
- Qui a demandé (nom du médecin)
- Quand (date de création)
- Quand traité (date de traitement)
- Raison de la demande

### Analyse Possible

- **Médicaments les plus demandés** : Identifier les manques récurrents
- **Taux d'approbation** : % approuvées vs rejetées
- **Temps de traitement** : Délai entre demande et traitement
- **Médecins actifs** : Qui contribue le plus à enrichir la base

## 🔒 Sécurité et Traçabilité

### Audit Trail Complet

**Création**:
- Nom du médecin demandeur
- Date et heure exacte
- Statut initial: "pending"

**Modification**:
- Toutes les modifications sont enregistrées
- Historique complet des changements

**Traitement**:
- Date de traitement enregistrée
- Statut final (approved/rejected)

### Permissions

**Médecins**:
- ✅ Peuvent créer des demandes
- ✅ Peuvent voir leurs propres demandes
- ❌ Ne peuvent pas approuver
- ❌ Ne peuvent pas modifier les demandes des autres

**Administrateurs**:
- ✅ Voient toutes les demandes
- ✅ Peuvent approuver
- ✅ Peuvent rejeter
- ✅ Peuvent modifier
- ✅ Peuvent supprimer

## 💡 Bonnes Pratiques

### Pour les Médecins

1. **Recherchez d'abord** : Toujours vérifier si le médicament existe
2. **Remplissez complètement** : Plus d'infos = traitement plus rapide
3. **Justifiez** : Expliquez pourquoi ce médicament est nécessaire
4. **Soyez précis** : Dosage exact, forme correcte, bon fabricant

### Pour les Administrateurs

1. **Traitez rapidement** : Les demandes en attente bloquent le travail
2. **Vérifiez les informations** : Avant d'approuver, validez les données
3. **Complétez si nécessaire** : Utilisez "Modifier et Approuver"
4. **Communiquez** : Si vous rejetez, expliquez pourquoi
5. **Nettoyez régulièrement** : Supprimez les anciennes demandes traitées

### Maintenance

**Hebdomadaire**:
- Traiter toutes les demandes en attente
- Vérifier les doublons dans la base
- Nettoyer les demandes rejetées obsolètes

**Mensuelle**:
- Analyser les médicaments les plus demandés
- Enrichir proactivement la base
- Former les médecins sur les nouveaux médicaments

## 🚀 Fonctionnalités Futures

### Prévues
- [ ] Notifications en temps réel des nouvelles demandes
- [ ] Commentaires sur les demandes (échanges médecin-admin)
- [ ] Import massif depuis fichier CSV
- [ ] Export des rapports en Excel
- [ ] Recherche avancée dans l'historique
- [ ] Filtres multiples (médecin, date, statut)
- [ ] Statistiques graphiques (charts)
- [ ] Intégration email pour notifications
- [ ] API backend pour synchronisation multi-utilisateurs

### En Considération
- Workflow d'approbation à plusieurs niveaux
- Validation par un comité médical
- Base de données centralisée cloud
- Mobile app pour consultation

## 📞 Support

### Questions Fréquentes

**Q: Que se passe-t-il si je rejette une demande par erreur?**
R: Vous pouvez la retrouver dans l'onglet "Rejetées" et la supprimer. Le médecin devra refaire une demande.

**Q: Un médicament approuvé peut-il être retiré?**
R: Oui, allez dans la page "Médicaments" et supprimez-le de la base.

**Q: Les demandes sont-elles partagées entre tous les médecins?**
R: Actuellement, elles sont stockées localement. Une version future inclura une synchronisation.

**Q: Combien de temps conserver l'historique?**
R: Recommandé: 6 mois à 1 an pour les demandes approuvées/rejetées.

---

**Version** : 1.0.0  
**Date** : Novembre 2024  
**Module** : Système de Demandes de Médicaments
