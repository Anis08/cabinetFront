# 🔒 Correctif: Erreur 403 - Token Refresh

## 🐛 Problème Identifié

### Symptôme
```
Error fetching patients: 403
fetchPatients @ Ordonnances.jsx:67
```

### Cause
Après le premier correctif, le bon endpoint était utilisé mais l'erreur 403 (Forbidden) persistait. Cela indique que:
- ✅ L'endpoint est correct: `/medecin/list-patients`
- ✅ La clé localStorage est correcte: `'token'`
- ❌ Mais le token JWT est **expiré** ou **invalide**

## 🔍 Analyse

### Erreur 403 vs 401
- **401 Unauthorized**: Token manquant ou malformé
- **403 Forbidden**: Token présent mais expiré ou révoqué

### Solution Standard
Dans l'application, d'autres pages comme `CalendarSimple.jsx` implémentent déjà une logique de **refresh automatique du token** lors d'une erreur 403.

## ✅ Solution Implémentée

### Pattern de Refresh Token

Le pattern utilisé dans l'application:
1. **Premier appel API** avec le token actuel
2. Si **403** → Token expiré
3. **Appel refresh()** pour obtenir un nouveau token
4. Si refresh réussit → **Retry** l'appel API original
5. Si refresh échoue → **Logout** utilisateur

### Code Implémenté

**AVANT** (sans gestion 403):
```javascript
const fetchPatients = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${baseURL}/medecin/list-patients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      setPatients(data.patients || [])
    } else {
      console.error('Error fetching patients:', response.status)
    }
  } catch (error) {
    console.error('Error fetching patients:', error)
  }
}
```

**APRÈS** (avec gestion 403 et refresh):
```javascript
const fetchPatients = async () => {
  try {
    // 1. Premier appel API
    let response = await fetch(`${baseURL}/medecin/list-patients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include',  // Important pour les cookies
    })

    // 2. Gestion erreur 403
    if (!response.ok) {
      if (response.status === 403) {
        // Token expiré, tenter refresh
        const refreshResponse = await refresh()
        
        if (!refreshResponse) {
          // Refresh échoué, déconnecter
          logout()
          return
        }

        // 3. Retry avec nouveau token
        response = await fetch(`${baseURL}/medecin/list-patients`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        })
      }
    }

    // 4. Traiter la réponse
    if (response.ok) {
      const data = await response.json()
      setPatients(data.patients || [])
    } else {
      console.error('Error fetching patients:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Error fetching patients:', error)
  }
}
```

## 🔑 Points Clés

### 1. Utilisation de `credentials: 'include'`
```javascript
credentials: 'include'
```
- **Pourquoi**: Permet d'envoyer les cookies HTTP avec la requête
- **Nécessaire**: Pour que le backend puisse gérer le refresh token via cookie

### 2. Référence à `refresh()` et `logout()`
```javascript
const { logout, refresh } = useAuth()
```
- Provient du contexte `AuthProvider`
- `refresh()`: Demande un nouveau access token
- `logout()`: Déconnecte l'utilisateur et nettoie le state

### 3. Pattern de Retry
```javascript
let response = await fetch(...)  // Premier essai
if (response.status === 403) {
  await refresh()
  response = await fetch(...)     // Deuxième essai
}
```
- Variable `let` pour pouvoir réassigner
- Même appel fetch après refresh

## 🔄 Flow Complet

```
┌─────────────────────────────────────────┐
│ 1. User clicks "Nouvelle Ordonnance"   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 2. fetchPatients() called               │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 3. GET /medecin/list-patients           │
│    Authorization: Bearer <token>        │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌─────────────┐     ┌─────────────┐
│ Status: 200 │     │ Status: 403 │
│    OK       │     │  Forbidden  │
└─────────────┘     └─────────────┘
        │                   │
        │                   ▼
        │           ┌─────────────────┐
        │           │ Call refresh()  │
        │           └─────────────────┘
        │                   │
        │           ┌───────┴───────┐
        │           │               │
        │           ▼               ▼
        │    ┌─────────────┐  ┌─────────────┐
        │    │ Refresh OK  │  │ Refresh KO  │
        │    └─────────────┘  └─────────────┘
        │           │               │
        │           ▼               ▼
        │    ┌─────────────┐  ┌─────────────┐
        │    │ Retry fetch │  │  logout()   │
        │    └─────────────┘  └─────────────┘
        │           │               │
        │           ▼               ▼
        │    ┌─────────────┐  ┌─────────────┐
        │    │ Status: 200 │  │ Redirect to │
        │    │    OK       │  │    Login    │
        │    └─────────────┘  └─────────────┘
        │           │
        └───────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ 4. setPatients(data.patients)           │
│    Patient selector displays            │
└─────────────────────────────────────────┘
```

## 📝 Changements Détaillés

### Fichier: `src/pages/Ordonnances.jsx`

**Lignes modifiées**: 52-82

**Changements**:
1. ✅ Ajout de `let response` (au lieu de `const`)
2. ✅ Ajout de `credentials: 'include'`
3. ✅ Ajout du bloc `if (response.status === 403)`
4. ✅ Appel à `refresh()`
5. ✅ Appel à `logout()` si refresh échoue
6. ✅ Retry fetch après refresh réussi

## 🧪 Tests de Vérification

### Test 1: Token Valide
1. Se connecter à l'application
2. Aller sur "Ordonnances"
3. Cliquer "Nouvelle Ordonnance"
4. ✅ La liste des patients doit s'afficher

### Test 2: Token Expiré
1. Attendre que le token expire (ou le forcer à expirer)
2. Aller sur "Ordonnances"
3. Cliquer "Nouvelle Ordonnance"
4. ✅ Le refresh doit se faire automatiquement
5. ✅ La liste des patients doit s'afficher après refresh

### Test 3: Refresh Échoué
1. Forcer l'échec du refresh (bloquer l'API de refresh)
2. Aller sur "Ordonnances"
3. Cliquer "Nouvelle Ordonnance"
4. ✅ L'utilisateur doit être déconnecté
5. ✅ Redirection vers la page de login

## 📊 Comparaison avec Autres Pages

### Pages avec Token Refresh ✅
- `CalendarSimple.jsx` - Pattern de référence
- `Ordonnances.jsx` - Maintenant implémenté
- (À vérifier) `HistorySimple.jsx`, `QueueSimple.jsx`

### Pattern Standard à Utiliser
```javascript
let response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
  credentials: 'include',
})

if (!response.ok && response.status === 403) {
  const refreshResponse = await refresh()
  if (!refreshResponse) {
    logout()
    return
  }
  response = await fetch(url, { /* même config */ })
}

if (response.ok) {
  // Traiter les données
}
```

## 🚀 Déploiement

### Git Commit
```
Commit: ece0bf7
Message: fix: Add token refresh logic for 403 errors in Ordonnances

🐛 Bug Fix:
- Added automatic token refresh when receiving 403 Forbidden
- Implemented same pattern as CalendarSimple.jsx
- Retry fetch after token refresh
- Proper logout if refresh fails
- Added credentials: 'include' for cookies

This resolves the 403 error when fetching patients list.
```

### GitHub
- ✅ Poussé sur `origin/main`
- ✅ Disponible immédiatement

## 🔒 Sécurité

### Bonnes Pratiques Respectées
1. ✅ **Token Refresh Transparent**: L'utilisateur ne voit pas l'erreur
2. ✅ **Logout Automatique**: Si refresh échoue, déconnexion propre
3. ✅ **Retry Unique**: Un seul retry pour éviter les boucles infinies
4. ✅ **Credentials Include**: Cookies envoyés pour refresh token
5. ✅ **Logging**: Erreurs loggées pour debugging

### Points de Vigilance
- ⚠️ Le refresh token doit être stocké en **httpOnly cookie**
- ⚠️ Le backend doit implémenter l'endpoint `/auth/refresh`
- ⚠️ La durée de vie du refresh token doit être > access token
- ⚠️ Rotation du refresh token recommandée

## 📚 Références

### Documentation Interne
- `src/store/AuthProvider.jsx` - Implémentation de refresh()
- `src/pages/CalendarSimple.jsx` - Pattern de référence
- `AVAILABLE_ENDPOINTS.md` - Liste des endpoints API

### Endpoints Utilisés
- `GET /medecin/list-patients` - Liste des patients
- `POST /auth/refresh` - Refresh du token (implicite)

## 🎯 Résultat Final

### Avant
- ❌ Erreur 403 lors du chargement des patients
- ❌ Message "Aucun patient disponible"
- ❌ Impossible de créer des ordonnances

### Après
- ✅ Token refresh automatique
- ✅ Patients chargés correctement
- ✅ Création d'ordonnances fonctionnelle
- ✅ Expérience utilisateur fluide
- ✅ Gestion propre de la déconnexion

---

**Status**: ✅ Résolu  
**Version**: 2.0.0  
**Date**: Novembre 2024  
**Commit**: ece0bf7
