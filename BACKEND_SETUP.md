# 🔧 Configuration du Backend - Cabinet Médical

## ⚠️ Problème Actuel

L'erreur **"Le serveur a rencontré une erreur. Veuillez réessayer plus tard."** apparaît lors de l'accès au profil patient car **le backend n'est pas démarré**.

## 📋 Solution

### Étape 1 : Vérifier si le backend est démarré

```bash
curl http://localhost:4000/health
```

Si vous obtenez une erreur "Connection refused", le backend n'est pas démarré.

### Étape 2 : Démarrer le backend

Le backend du Cabinet Médical doit fonctionner sur le **port 4000**.

#### Option A : Backend Node.js/Express

Si vous avez un dossier backend séparé :

```bash
cd /path/to/backend
npm install
npm start
# ou
node server.js
```

#### Option B : Vérifier la configuration

Le frontend est configuré pour se connecter à :
- **URL API** : `http://localhost:4000`
- **Configuration** : Voir le fichier `.env`

```env
VITE_API_BASE_URL=http://localhost:4000
```

### Étape 3 : Vérifier les endpoints requis

Le backend doit exposer au minimum les endpoints suivants :

```
GET  /medecin/profile-patient/:patientId   # Récupérer le profil d'un patient
GET  /medecin/patients/:patientId          # Récupérer les données d'un patient
PUT  /medecin/patients/:patientId          # Mettre à jour un patient
DELETE /medecin/patients/:patientId        # Supprimer un patient
POST /auth/refresh                          # Rafraîchir le token d'authentification
```

## 🔍 Diagnostic

### Vérifier que le frontend peut atteindre le backend

```bash
# Test de santé (si disponible)
curl http://localhost:4000/health

# Test d'un endpoint (avec authentification)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/medecin/patients/PATIENT_ID
```

### Logs du backend

Vérifiez les logs du backend pour identifier les erreurs :
- Erreurs de connexion à la base de données
- Erreurs d'authentification
- Erreurs 500 internes

## ✅ Améliorations Apportées

### 1. Meilleure gestion des erreurs (PatientProfile)

Le code frontend a été amélioré pour :
- ✅ Vérifier correctement le statut après le refresh token
- ✅ Afficher un message clair en cas d'erreur de connexion
- ✅ Gérer tous les codes d'erreur HTTP (401, 403, 404, 500)
- ✅ Afficher un message spécifique si le backend n'est pas accessible

### 2. Messages d'erreur améliorés

- **Erreur 404** : "Aucun patient trouvé."
- **Erreur 500** : "Le serveur a rencontré une erreur. Veuillez réessayer plus tard."
- **Erreur réseau** : "Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 4000."

## 📞 Support

Si le problème persiste :

1. Vérifiez que le backend est bien démarré sur le port 4000
2. Vérifiez les logs du backend pour identifier les erreurs
3. Assurez-vous que la base de données est accessible
4. Vérifiez que les tokens d'authentification sont valides

## 🔐 Authentification

Le système utilise des tokens JWT avec refresh automatique :
- Token stocké dans `localStorage` sous la clé `'token'`
- Refresh automatique en cas d'expiration (401)
- Redirection vers login en cas d'erreur 403

## 📝 Notes Techniques

- **Frontend** : React 18 + Vite (port par défaut : 5173)
- **Backend attendu** : API REST sur port 4000
- **Gestion d'erreur** : Améliorée dans le commit `bd79750`
- **Système de recherche médicaments** : Harmonisé dans le commit `4e7f494`
