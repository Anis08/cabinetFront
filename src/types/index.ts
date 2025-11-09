// Types étendus pour Cabinet Médical v2

export type UserRole = 'admin' | 'medecin' | 'secretaire'
export type StatutVisite = 'attente' | 'appele' | 'en_consultation' | 'termine' | 'annule'
export type NiveauUrgence = 'standard' | 'prioritaire' | 'critique'
export type PaiementStatut = 'paye' | 'impaye' | 'partiel'
export type MoyenPaiement = 'cash' | 'carte' | 'virement'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  password_hash?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  nom: string
  prenom: string
  age: number
  poids?: number
  maladie?: string
  phone?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PatientFile {
  id: string
  patient_id: string
  filename: string
  mime: 'image/jpeg' | 'image/png' | 'application/pdf'
  size: number
  url: string        // URL signée courte durée
  uploaded_at: string
}

export interface PatientExtended extends Patient {
  adresse?: string
  profession?: string
  antecedents?: string
  allergies?: string
  medicaments?: string
  remarque?: string // notes générales non-cliniques
  files?: PatientFile[]
}

export interface Visit {
  id: string
  patient_id: string
  medecin_id: string
  statut: StatutVisite
  niveau_urgence: NiveauUrgence
  heure_arrivee?: string
  heure_appel?: string
  heure_debut_consult?: string
  heure_fin_consult?: string
  motif?: string
  remarques_medicales?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  visit_id: string
  acte?: string
  prix_base: number
  remise?: number
  montant_total: number
  moyen_paiement: MoyenPaiement
  statut_paiement: PaiementStatut
  notes?: string
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  medecin_id: string
  start: string // ISO
  end: string   // ISO
  statut: StatutVisite // utiliser 'attente' pour programmée/non commencée
  motif?: string
  created_at: string
  updated_at: string
}

export interface ReminderStatus {
  id: string
  appointment_id: string
  channel: 'whatsapp'
  sent_at?: string
  status: 'queued' | 'sent' | 'failed'
  error?: string
}

// Types pour les API
export interface FileUploadPresign {
  uploadUrl: string
  fileUrl: string
  headers: Record<string, string>
}

export interface InvoiceSummary {
  ca_jour: number
  ca_mois: number
  impayes: number
  panier_moyen: number
  total_consultations: number
}

export interface BillingFilters {
  from?: string
  to?: string
  medecin_id?: string
  statut?: PaiementStatut
}

export interface AppointmentFilters {
  from?: string
  to?: string
  medecin_id?: string
  statut?: StatutVisite
}

// Types pour les composants
export interface QueueItem extends Visit {
  patient?: Patient
}

export interface KPI {
  patientsToday: number
  waiting: number
  inConsultation: number
  avgWaitTime: string
}

// Types pour les permissions
export interface Permission {
  resource: string
  actions: string[]
}

export interface RolePermissions {
  [key in UserRole]: Permission[]
}

// Types pour les formulaires
export interface PatientFormData extends Omit<PatientExtended, 'id' | 'created_at' | 'updated_at'> {
  addToQueue?: boolean
}

export interface InvoiceFormData extends Omit<Invoice, 'id' | 'montant_total' | 'created_at'> {}

export interface AppointmentFormData extends Omit<Appointment, 'id' | 'created_at' | 'updated_at'> {}

export interface FinishConsultationData {
  remarques_medicales?: string
  invoice?: InvoiceFormData
  nextAppointment?: AppointmentFormData
}

// Types pour les événements Socket
export interface SocketEvents {
  'queue:update': QueueItem[]
  'appointment:created': Appointment
  'appointment:updated': Appointment
  'appointment:deleted': string
  'invoice:created': Invoice
}

// Types utilitaires
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel'
  filename?: string
}