/**
 * Système RBAC (Role-Based Access Control)
 * Définitions des rôles, permissions et ressources
 * Version JavaScript (au lieu de TypeScript)
 */

// Types de base (pour référence)
export const ROLES = {
  ADMIN: 'admin',
  MEDECIN: 'medecin',
  SECRETAIRE: 'secretaire'
}

export const PERMISSIONS = {
  // Gestion des patients
  PATIENTS_READ: 'patients.read',
  PATIENTS_CREATE: 'patients.create',
  PATIENTS_UPDATE: 'patients.update',
  PATIENTS_DELETE: 'patients.delete',
  PATIENTS_FILES_READ: 'patients.files.read',
  PATIENTS_FILES_UPLOAD: 'patients.files.upload',
  PATIENTS_FILES_DELETE: 'patients.files.delete',
  
  // File d'attente
  QUEUE_READ: 'queue.read',
  QUEUE_ADD: 'queue.add',
  QUEUE_REMOVE: 'queue.remove',
  QUEUE_CALL: 'queue.call',
  QUEUE_PRIORITY: 'queue.priority',
  
  // Consultations
  CONSULTATIONS_READ: 'consultations.read',
  CONSULTATIONS_CREATE: 'consultations.create',
  CONSULTATIONS_UPDATE: 'consultations.update',
  CONSULTATIONS_START: 'consultations.start',
  CONSULTATIONS_FINISH: 'consultations.finish',
  
  // Facturation
  BILLING_READ: 'billing.read',
  BILLING_CREATE: 'billing.create',
  BILLING_UPDATE: 'billing.update',
  BILLING_DELETE: 'billing.delete',
  BILLING_EXPORT: 'billing.export',
  
  // Calendrier
  CALENDAR_READ: 'calendar.read',
  CALENDAR_CREATE: 'calendar.create',
  CALENDAR_UPDATE: 'calendar.update',
  CALENDAR_DELETE: 'calendar.delete',
  CALENDAR_REMINDERS: 'calendar.reminders',
  
  // Statistiques
  STATISTICS_READ: 'statistics.read',
  STATISTICS_EXPORT: 'statistics.export',
  
  // Administration
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_LOGS: 'system.logs'
}

export const RESOURCES = {
  PATIENTS: 'patients',
  QUEUE: 'queue',
  CONSULTATIONS: 'consultations',
  BILLING: 'billing',
  CALENDAR: 'calendar',
  STATISTICS: 'statistics',
  USERS: 'users',
  SYSTEM: 'system'
}

// Configuration des permissions par rôle
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Toutes les permissions
    PERMISSIONS.PATIENTS_READ, PERMISSIONS.PATIENTS_CREATE, PERMISSIONS.PATIENTS_UPDATE, PERMISSIONS.PATIENTS_DELETE,
    PERMISSIONS.PATIENTS_FILES_READ, PERMISSIONS.PATIENTS_FILES_UPLOAD, PERMISSIONS.PATIENTS_FILES_DELETE,
    PERMISSIONS.QUEUE_READ, PERMISSIONS.QUEUE_ADD, PERMISSIONS.QUEUE_REMOVE, PERMISSIONS.QUEUE_CALL, PERMISSIONS.QUEUE_PRIORITY,
    PERMISSIONS.CONSULTATIONS_READ, PERMISSIONS.CONSULTATIONS_CREATE, PERMISSIONS.CONSULTATIONS_UPDATE,
    PERMISSIONS.CONSULTATIONS_START, PERMISSIONS.CONSULTATIONS_FINISH,
    PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_CREATE, PERMISSIONS.BILLING_UPDATE, PERMISSIONS.BILLING_DELETE, PERMISSIONS.BILLING_EXPORT,
    PERMISSIONS.CALENDAR_READ, PERMISSIONS.CALENDAR_CREATE, PERMISSIONS.CALENDAR_UPDATE, PERMISSIONS.CALENDAR_DELETE, PERMISSIONS.CALENDAR_REMINDERS,
    PERMISSIONS.STATISTICS_READ, PERMISSIONS.STATISTICS_EXPORT,
    PERMISSIONS.USERS_READ, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_UPDATE, PERMISSIONS.USERS_DELETE,
    PERMISSIONS.SYSTEM_SETTINGS, PERMISSIONS.SYSTEM_LOGS
  ],
  
  [ROLES.MEDECIN]: [
    // Gestion complète des patients
    PERMISSIONS.PATIENTS_READ, PERMISSIONS.PATIENTS_CREATE, PERMISSIONS.PATIENTS_UPDATE,
    PERMISSIONS.PATIENTS_FILES_READ, PERMISSIONS.PATIENTS_FILES_UPLOAD,
    
    // File d'attente complète
    PERMISSIONS.QUEUE_READ, PERMISSIONS.QUEUE_ADD, PERMISSIONS.QUEUE_CALL, PERMISSIONS.QUEUE_PRIORITY,
    
    // Consultations complètes
    PERMISSIONS.CONSULTATIONS_READ, PERMISSIONS.CONSULTATIONS_CREATE, PERMISSIONS.CONSULTATIONS_UPDATE,
    PERMISSIONS.CONSULTATIONS_START, PERMISSIONS.CONSULTATIONS_FINISH,
    
    // Facturation (lecture et création uniquement)
    PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_CREATE,
    
    // Calendrier complet
    PERMISSIONS.CALENDAR_READ, PERMISSIONS.CALENDAR_CREATE, PERMISSIONS.CALENDAR_UPDATE, PERMISSIONS.CALENDAR_DELETE, PERMISSIONS.CALENDAR_REMINDERS,
    
    // Statistiques en lecture
    PERMISSIONS.STATISTICS_READ
  ],
  
  [ROLES.SECRETAIRE]: [
    // Gestion limitée des patients
    PERMISSIONS.PATIENTS_READ, PERMISSIONS.PATIENTS_CREATE, PERMISSIONS.PATIENTS_UPDATE,
    PERMISSIONS.PATIENTS_FILES_READ, PERMISSIONS.PATIENTS_FILES_UPLOAD,
    
    // File d'attente limitée
    PERMISSIONS.QUEUE_READ, PERMISSIONS.QUEUE_ADD, PERMISSIONS.QUEUE_CALL,
    
    // Consultations en lecture uniquement
    PERMISSIONS.CONSULTATIONS_READ,
    
    // Facturation limitée
    PERMISSIONS.BILLING_READ, PERMISSIONS.BILLING_CREATE, PERMISSIONS.BILLING_UPDATE,
    
    // Calendrier avec restrictions
    PERMISSIONS.CALENDAR_READ, PERMISSIONS.CALENDAR_CREATE, PERMISSIONS.CALENDAR_UPDATE, PERMISSIONS.CALENDAR_REMINDERS,
    
    // Statistiques limitées
    PERMISSIONS.STATISTICS_READ
  ]
}

// Configuration des ressources par rôle (pour la navigation)
export const ROLE_RESOURCES = {
  [ROLES.ADMIN]: [RESOURCES.PATIENTS, RESOURCES.QUEUE, RESOURCES.CONSULTATIONS, RESOURCES.BILLING, RESOURCES.CALENDAR, RESOURCES.STATISTICS, RESOURCES.USERS, RESOURCES.SYSTEM],
  [ROLES.MEDECIN]: [RESOURCES.PATIENTS, RESOURCES.QUEUE, RESOURCES.CONSULTATIONS, RESOURCES.BILLING, RESOURCES.CALENDAR, RESOURCES.STATISTICS],
  [ROLES.SECRETAIRE]: [RESOURCES.PATIENTS, RESOURCES.QUEUE, RESOURCES.BILLING, RESOURCES.CALENDAR, RESOURCES.STATISTICS]
}

// Labels pour l'interface
export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.MEDECIN]: 'Médecin',
  [ROLES.SECRETAIRE]: 'Secrétaire'
}

export const PERMISSION_LABELS = {
  [PERMISSIONS.PATIENTS_READ]: 'Consulter les patients',
  [PERMISSIONS.PATIENTS_CREATE]: 'Créer des patients',
  [PERMISSIONS.PATIENTS_UPDATE]: 'Modifier les patients', 
  [PERMISSIONS.PATIENTS_DELETE]: 'Supprimer les patients',
  [PERMISSIONS.PATIENTS_FILES_READ]: 'Consulter les fichiers patients',
  [PERMISSIONS.PATIENTS_FILES_UPLOAD]: 'Uploader des fichiers',
  [PERMISSIONS.PATIENTS_FILES_DELETE]: 'Supprimer des fichiers',
  [PERMISSIONS.QUEUE_READ]: 'Consulter la file d\'attente',
  [PERMISSIONS.QUEUE_ADD]: 'Ajouter à la file',
  [PERMISSIONS.QUEUE_REMOVE]: 'Retirer de la file',
  [PERMISSIONS.QUEUE_CALL]: 'Appeler un patient',
  [PERMISSIONS.QUEUE_PRIORITY]: 'Modifier les priorités',
  [PERMISSIONS.CONSULTATIONS_READ]: 'Consulter l\'historique',
  [PERMISSIONS.CONSULTATIONS_CREATE]: 'Créer des consultations',
  [PERMISSIONS.CONSULTATIONS_UPDATE]: 'Modifier des consultations',
  [PERMISSIONS.CONSULTATIONS_START]: 'Démarrer une consultation',
  [PERMISSIONS.CONSULTATIONS_FINISH]: 'Terminer une consultation',
  [PERMISSIONS.BILLING_READ]: 'Consulter la comptabilité',
  [PERMISSIONS.BILLING_CREATE]: 'Créer des factures',
  [PERMISSIONS.BILLING_UPDATE]: 'Modifier des factures',
  [PERMISSIONS.BILLING_DELETE]: 'Supprimer des factures',
  [PERMISSIONS.BILLING_EXPORT]: 'Exporter les données',
  [PERMISSIONS.CALENDAR_READ]: 'Consulter le calendrier',
  [PERMISSIONS.CALENDAR_CREATE]: 'Créer des rendez-vous',
  [PERMISSIONS.CALENDAR_UPDATE]: 'Modifier des rendez-vous',
  [PERMISSIONS.CALENDAR_DELETE]: 'Supprimer des rendez-vous',
  [PERMISSIONS.CALENDAR_REMINDERS]: 'Envoyer des rappels',
  [PERMISSIONS.STATISTICS_READ]: 'Consulter les statistiques',
  [PERMISSIONS.STATISTICS_EXPORT]: 'Exporter les statistiques',
  [PERMISSIONS.USERS_READ]: 'Consulter les utilisateurs',
  [PERMISSIONS.USERS_CREATE]: 'Créer des utilisateurs',
  [PERMISSIONS.USERS_UPDATE]: 'Modifier des utilisateurs',
  [PERMISSIONS.USERS_DELETE]: 'Supprimer des utilisateurs',
  [PERMISSIONS.SYSTEM_SETTINGS]: 'Gérer les paramètres',
  [PERMISSIONS.SYSTEM_LOGS]: 'Consulter les logs'
}

export const RESOURCE_LABELS = {
  [RESOURCES.PATIENTS]: 'Patients',
  [RESOURCES.QUEUE]: 'File d\'attente',
  [RESOURCES.CONSULTATIONS]: 'Consultations',
  [RESOURCES.BILLING]: 'Comptabilité',
  [RESOURCES.CALENDAR]: 'Calendrier',
  [RESOURCES.STATISTICS]: 'Statistiques',
  [RESOURCES.USERS]: 'Utilisateurs',
  [RESOURCES.SYSTEM]: 'Système'
}