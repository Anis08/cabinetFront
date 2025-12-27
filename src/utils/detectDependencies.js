// Utilitaire pour détecter les dépendances disponibles

export const checkReactQuery = () => {
  try {
    // Tenter d'importer React Query
    require('@tanstack/react-query')
    return true
  } catch (error) {
    console.warn('⚠️ @tanstack/react-query non disponible, utilisation du mode fallback')
    return false
  }
}

export const getDependencyStatus = () => {
  const status = {
    reactQuery: false,
    framerMotion: false,
    reactHookForm: false,
    reactRouter: false
  }

  try {
    require('@tanstack/react-query')
    status.reactQuery = true
  } catch (e) {}

  try {
    require('framer-motion')
    status.framerMotion = true
  } catch (e) {}

  try {
    require('react-hook-form')
    status.reactHookForm = true
  } catch (e) {}

  try {
    require('react-router-dom')
    status.reactRouter = true
  } catch (e) {}

  return status
}

export const showDependencyWarnings = () => {
  const status = getDependencyStatus()
  const missing = []

  if (!status.reactQuery) missing.push('@tanstack/react-query')
  if (!status.framerMotion) missing.push('framer-motion')
  if (!status.reactHookForm) missing.push('react-hook-form')
  if (!status.reactRouter) missing.push('react-router-dom')

  if (missing.length > 0) {
    console.warn('⚠️ Dépendances manquantes:', missing.join(', '))
    console.log('💡 Exécutez: npm run setup')
    return missing
  }

  console.log('✅ Toutes les dépendances sont installées')
  return []
}