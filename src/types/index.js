/**
 * Types et interfaces pour l'application Cabinet Médical
 * Version JavaScript (au lieu de TypeScript)
 */

// Définitions des types pour référence (commentaires JSDoc)

/**
 * @typedef {Object} Patient
 * @property {string} id - Identifiant unique du patient
 * @property {string} nom - Nom de famille
 * @property {string} prenom - Prénom
 * @property {number} age - Âge
 * @property {number} poids - Poids en kg
 * @property {string} phone - Numéro de téléphone
 * @property {string} maladie - Maladie principale
 * @property {string} remarque - Remarques
 * @property {string} created_at - Date de création
 * @property {string} updated_at - Date de mise à jour
 */

/**
 * @typedef {Object} PatientExtended
 * @property {string} id - Identifiant unique
 * @property {string} nom - Nom de famille
 * @property {string} prenom - Prénom
 * @property {number} age - Âge
 * @property {number} poids - Poids en kg
 * @property {string} phone - Numéro de téléphone
 * @property {string} adresse - Adresse complète
 * @property {string} profession - Profession
 * @property {string} antecedents - Antécédents médicaux
 * @property {string} allergies - Allergies connues
 * @property {string} medicaments - Médicaments actuels
 * @property {string} maladie - Maladie principale
 * @property {string} remarque - Remarques
 * @property {PatientFile[]} files - Fichiers médicaux
 * @property {string} created_at - Date de création
 * @property {string} updated_at - Date de mise à jour
 */

/**
 * @typedef {Object} PatientFile
 * @property {string} id - Identifiant unique du fichier
 * @property {string} patient_id - ID du patient
 * @property {string} name - Nom original du fichier
 * @property {string} type - Type MIME
 * @property {number} size - Taille en bytes
 * @property {string} url - URL d'accès au fichier
 * @property {string} description - Description du fichier
 * @property {string} uploaded_by - ID de l'utilisateur qui a uploadé
 * @property {string} created_at - Date d'upload
 */

/**
 * @typedef {Object} Visit
 * @property {string} id - Identifiant unique
 * @property {string} patient_id - ID du patient
 * @property {string} medecin_id - ID du médecin
 * @property {string} niveau_urgence - Niveau d'urgence (standard, prioritaire, critique)
 * @property {string} statut - Statut (en_attente, en_consultation, termine, annule)
 * @property {string} heure_arrivee - Heure d'arrivée
 * @property {string} heure_appel - Heure d'appel (optionnel)
 * @property {string} heure_debut - Heure de début de consultation (optionnel)
 * @property {string} heure_fin - Heure de fin de consultation (optionnel)
 * @property {string} motif - Motif de la consultation
 * @property {string} diagnostic - Diagnostic (optionnel)
 * @property {string} traitement - Traitement prescrit (optionnel)
 * @property {string} remarques - Remarques
 * @property {number} cout - Coût de la consultation
 * @property {string} created_at - Date de création
 * @property {string} updated_at - Date de mise à jour
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id - Identifiant unique
 * @property {string} visit_id - ID de la visite
 * @property {string} patient_id - ID du patient
 * @property {string} medecin_id - ID du médecin
 * @property {string} numero_facture - Numéro de facture
 * @property {number} montant_ht - Montant hors taxes
 * @property {number} taux_tva - Taux de TVA (%)
 * @property {number} montant_ttc - Montant toutes taxes comprises
 * @property {'paye'|'impaye'|'partiel'} statut_paiement - Statut du paiement
 * @property {'especes'|'carte'|'virement'|'cheque'} mode_paiement - Mode de paiement
 * @property {Object[]} prestations - Liste des prestations
 * @property {string} prestations[].description - Description de la prestation
 * @property {number} prestations[].quantite - Quantité
 * @property {number} prestations[].prix_unitaire - Prix unitaire
 * @property {number} prestations[].total - Total de la prestation
 * @property {string} created_at - Date de création
 * @property {string} updated_at - Date de mise à jour
 */

/**
 * @typedef {Object} Appointment
 * @property {string} id - Identifiant unique
 * @property {string} patient_id - ID du patient
 * @property {string} medecin_id - ID du médecin
 * @property {string} start - Date/heure de début (ISO string)
 * @property {string} end - Date/heure de fin (ISO string)
 * @property {'attente'|'en_consultation'|'termine'|'annule'} statut - Statut du RDV
 * @property {string} motif - Motif du rendez-vous
 * @property {string} notes - Notes du rendez-vous
 * @property {boolean} send_reminder - Envoyer un rappel
 * @property {number} reminder_hours - Heures avant rappel
 * @property {string} created_at - Date de création
 * @property {string} updated_at - Date de mise à jour
 */

// Constantes utiles
export const URGENCE_LEVELS = {
  STANDARD: 'standard',
  PRIORITAIRE: 'prioritaire',
  CRITIQUE: 'critique'
}

export const VISIT_STATUS = {
  EN_ATTENTE: 'en_attente',
  APPELE: 'appele',
  EN_CONSULTATION: 'en_consultation',
  TERMINE: 'termine',
  ANNULE: 'annule'
}

export const PAYMENT_STATUS = {
  PAYE: 'paye',
  IMPAYE: 'impaye',
  PARTIEL: 'partiel'
}

export const PAYMENT_METHODS = {
  ESPECES: 'especes',
  CARTE: 'carte',
  VIREMENT: 'virement',
  CHEQUE: 'cheque'
}

export const APPOINTMENT_STATUS = {
  ATTENTE: 'attente',
  EN_CONSULTATION: 'en_consultation',
  TERMINE: 'termine',
  ANNULE: 'annule'
}

export const FILE_TYPES = {
  PDF: 'application/pdf',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_WEBP: 'image/webp'
}

// Helpers de validation
export const validatePatient = (patient) => {
  const required = ['nom', 'prenom', 'age', 'phone']
  return required.every(field => patient[field])
}

export const validateVisit = (visit) => {
  const required = ['patient_id', 'niveau_urgence', 'motif']
  return required.every(field => visit[field])
}

export const validateInvoice = (invoice) => {
  const required = ['visit_id', 'patient_id', 'montant_ttc', 'prestations']
  return required.every(field => invoice[field])
}

export const validateAppointment = (appointment) => {
  const required = ['patient_id', 'medecin_id', 'start', 'end', 'motif']
  return required.every(field => appointment[field])
}