/**
 * Système RBAC (Role-Based Access Control)
 * Définitions des rôles, permissions et ressources
 */

// Types de base
export type Role = 'admin' | 'medecin' | 'secretaire'

export type Permission = 
  // Gestion des patients
  | 'patients.read'
  | 'patients.create' 
  | 'patients.update'
  | 'patients.delete'
  | 'patients.files.read'
  | 'patients.files.upload'
  | 'patients.files.delete'
  
  // File d'attente
  | 'queue.read'
  | 'queue.add'
  | 'queue.remove'
  | 'queue.call'
  | 'queue.priority'
  
  // Consultations
  | 'consultations.read'
  | 'consultations.create'
  | 'consultations.update'
  | 'consultations.start'
  | 'consultations.finish'
  
  // Facturation
  | 'billing.read'
  | 'billing.create'
  | 'billing.update'
  | 'billing.delete'
  | 'billing.export'
  
  // Calendrier
  | 'calendar.read'
  | 'calendar.create'
  | 'calendar.update'
  | 'calendar.delete'
  | 'calendar.reminders'
  
  // Statistiques
  | 'statistics.read'
  | 'statistics.export'
  
  // Administration
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'system.settings'
  | 'system.logs'

export type Resource = 
  | 'patients'
  | 'queue'
  | 'consultations'
  | 'billing'
  | 'calendar'
  | 'statistics'
  | 'users'
  | 'system'

// Utilisateur avec rôle
export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role: Role
  permissions?: Permission[] // Permissions personnalisées (optionnelles)
  isActive: boolean
  created_at: string
  updated_at: string
}

// Configuration des permissions par rôle
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    // Toutes les permissions
    'patients.read', 'patients.create', 'patients.update', 'patients.delete',
    'patients.files.read', 'patients.files.upload', 'patients.files.delete',
    'queue.read', 'queue.add', 'queue.remove', 'queue.call', 'queue.priority',
    'consultations.read', 'consultations.create', 'consultations.update',
    'consultations.start', 'consultations.finish',
    'billing.read', 'billing.create', 'billing.update', 'billing.delete', 'billing.export',
    'calendar.read', 'calendar.create', 'calendar.update', 'calendar.delete', 'calendar.reminders',
    'statistics.read', 'statistics.export',
    'users.read', 'users.create', 'users.update', 'users.delete',
    'system.settings', 'system.logs'
  ],
  
  medecin: [
    // Gestion complète des patients
    'patients.read', 'patients.create', 'patients.update',
    'patients.files.read', 'patients.files.upload',
    
    // File d'attente complète
    'queue.read', 'queue.add', 'queue.call', 'queue.priority',
    
    // Consultations complètes
    'consultations.read', 'consultations.create', 'consultations.update',
    'consultations.start', 'consultations.finish',
    
    // Facturation (lecture et création uniquement)
    'billing.read', 'billing.create',
    
    // Calendrier complet
    'calendar.read', 'calendar.create', 'calendar.update', 'calendar.delete', 'calendar.reminders',
    
    // Statistiques en lecture
    'statistics.read'
  ],
  
  secretaire: [
    // Gestion limitée des patients
    'patients.read', 'patients.create', 'patients.update',
    'patients.files.read', 'patients.files.upload',
    
    // File d'attente limitée
    'queue.read', 'queue.add', 'queue.call',
    
    // Consultations en lecture uniquement
    'consultations.read',
    
    // Facturation limitée
    'billing.read', 'billing.create', 'billing.update',
    
    // Calendrier avec restrictions
    'calendar.read', 'calendar.create', 'calendar.update', 'calendar.reminders',
    
    // Statistiques limitées
    'statistics.read'
  ]
}

// Configuration des ressources par rôle (pour la navigation)
export const ROLE_RESOURCES: Record<Role, Resource[]> = {
  admin: ['patients', 'queue', 'consultations', 'billing', 'calendar', 'statistics', 'users', 'system'],
  medecin: ['patients', 'queue', 'consultations', 'billing', 'calendar', 'statistics'],
  secretaire: ['patients', 'queue', 'billing', 'calendar', 'statistics']
}

// Labels pour l'interface
export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrateur',
  medecin: 'Médecin',
  secretaire: 'Secrétaire'
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  'patients.read': 'Consulter les patients',
  'patients.create': 'Créer des patients',
  'patients.update': 'Modifier les patients', 
  'patients.delete': 'Supprimer les patients',
  'patients.files.read': 'Consulter les fichiers patients',
  'patients.files.upload': 'Uploader des fichiers',
  'patients.files.delete': 'Supprimer des fichiers',
  'queue.read': 'Consulter la file d\'attente',
  'queue.add': 'Ajouter à la file',
  'queue.remove': 'Retirer de la file',
  'queue.call': 'Appeler un patient',
  'queue.priority': 'Modifier les priorités',
  'consultations.read': 'Consulter l\'historique',
  'consultations.create': 'Créer des consultations',
  'consultations.update': 'Modifier des consultations',
  'consultations.start': 'Démarrer une consultation',
  'consultations.finish': 'Terminer une consultation',
  'billing.read': 'Consulter la comptabilité',
  'billing.create': 'Créer des factures',
  'billing.update': 'Modifier des factures',
  'billing.delete': 'Supprimer des factures',
  'billing.export': 'Exporter les données',
  'calendar.read': 'Consulter le calendrier',
  'calendar.create': 'Créer des rendez-vous',
  'calendar.update': 'Modifier des rendez-vous',
  'calendar.delete': 'Supprimer des rendez-vous',
  'calendar.reminders': 'Envoyer des rappels',
  'statistics.read': 'Consulter les statistiques',
  'statistics.export': 'Exporter les statistiques',
  'users.read': 'Consulter les utilisateurs',
  'users.create': 'Créer des utilisateurs',
  'users.update': 'Modifier des utilisateurs',
  'users.delete': 'Supprimer des utilisateurs',
  'system.settings': 'Gérer les paramètres',
  'system.logs': 'Consulter les logs'
}

export const RESOURCE_LABELS: Record<Resource, string> = {
  patients: 'Patients',
  queue: 'File d\'attente',
  consultations: 'Consultations',
  billing: 'Comptabilité',
  calendar: 'Calendrier',
  statistics: 'Statistiques',
  users: 'Utilisateurs',
  system: 'Système'
}