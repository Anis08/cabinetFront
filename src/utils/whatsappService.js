/**
 * Service de gestion des rappels WhatsApp
 * Simulation d'intégration avec l'API WhatsApp Business
 */

// Configuration WhatsApp (simulation)
const WHATSAPP_CONFIG = {
  phoneNumberId: 'demo-phone-number-id',
  accessToken: 'demo-access-token',
  businessAccountId: 'demo-business-account',
  apiUrl: 'https://graph.facebook.com/v18.0',
  verified: true,
  webhookUrl: '/webhook/whatsapp'
}

/**
 * Templates de messages pour les rappels
 */
export const MESSAGE_TEMPLATES = {
  appointment_reminder_24h: {
    name: 'appointment_reminder_24h',
    language: 'fr',
    components: [
      {
        type: 'header',
        format: 'text',
        text: '🏥 Rappel de rendez-vous'
      },
      {
        type: 'body',
        text: 'Bonjour {{1}},\n\nNous vous rappelons votre rendez-vous prévu demain ({{2}}) à {{3}} avec {{4}}.\n\n📍 Cabinet médical\n{{5}}\n\nMerci de confirmer votre présence en répondant OUI ou d\'annuler en répondant NON.'
      },
      {
        type: 'footer',
        text: 'Cabinet Médical - Ne pas répondre à ce numéro'
      }
    ]
  },
  
  appointment_reminder_2h: {
    name: 'appointment_reminder_2h',
    language: 'fr',
    components: [
      {
        type: 'header',
        format: 'text',
        text: '⏰ Rendez-vous dans 2h'
      },
      {
        type: 'body',
        text: 'Bonjour {{1}},\n\nVotre rendez-vous avec {{2}} est prévu dans 2 heures ({{3}}).\n\n📍 Cabinet médical\n{{4}}\n\nÀ bientôt !'
      },
      {
        type: 'footer',
        text: 'Cabinet Médical'
      }
    ]
  },
  
  appointment_confirmation: {
    name: 'appointment_confirmation',
    language: 'fr',
    components: [
      {
        type: 'header',
        format: 'text',
        text: '✅ Rendez-vous confirmé'
      },
      {
        type: 'body',
        text: 'Bonjour {{1}},\n\nVotre rendez-vous a été confirmé :\n\n📅 {{2}} à {{3}}\n👨‍⚕️ {{4}}\n📍 {{5}}\n\nMerci et à bientôt !'
      }
    ]
  },
  
  appointment_cancelled: {
    name: 'appointment_cancelled',
    language: 'fr',
    components: [
      {
        type: 'header',
        format: 'text',
        text: '❌ Rendez-vous annulé'
      },
      {
        type: 'body',
        text: 'Bonjour {{1}},\n\nVotre rendez-vous du {{2}} à {{3}} avec {{4}} a été annulé.\n\nPour reprendre rendez-vous, contactez-nous au {{5}}.\n\nCordialement.'
      }
    ]
  }
}

/**
 * Formater un numéro de téléphone pour WhatsApp
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return null
  
  // Nettoyer le numéro
  let cleanPhone = phone.replace(/[^\d+]/g, '')
  
  // Ajouter l'indicatif français si manquant
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '+33' + cleanPhone.substring(1)
  } else if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+33' + cleanPhone
  }
  
  return cleanPhone
}

/**
 * Valider un numéro WhatsApp
 */
export const isValidWhatsAppNumber = (phone) => {
  const formatted = formatPhoneNumber(phone)
  if (!formatted) return false
  
  // Vérification basique du format international
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  return phoneRegex.test(formatted)
}

/**
 * Simuler l'envoi d'un message WhatsApp
 */
const simulateWhatsAppAPI = async (to, templateName, parameters) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simuler différents scénarios
      const random = Math.random()
      
      if (random < 0.05) { // 5% d'échec
        reject(new Error('Numéro WhatsApp invalide ou non joignable'))
      } else if (random < 0.1) { // 5% d'échec réseau
        reject(new Error('Erreur réseau temporaire'))
      } else {
        // Succès
        resolve({
          messaging_product: 'whatsapp',
          to: to,
          message_id: `wamid.${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'sent',
          timestamp: Date.now()
        })
      }
    }, Math.random() * 2000 + 500) // 0.5 à 2.5 secondes
  })
}

/**
 * Envoyer un rappel de rendez-vous
 */
export const sendAppointmentReminder = async (appointment, patient, doctor, reminderType = '24h') => {
  try {
    // Vérifier le numéro de téléphone
    const phoneNumber = formatPhoneNumber(patient.phone)
    if (!isValidWhatsAppNumber(phoneNumber)) {
      throw new Error('Numéro de téléphone invalide pour WhatsApp')
    }

    // Sélectionner le template
    let templateName
    switch (reminderType) {
      case '24h':
        templateName = 'appointment_reminder_24h'
        break
      case '2h':
        templateName = 'appointment_reminder_2h'
        break
      default:
        templateName = 'appointment_reminder_24h'
    }

    // Préparer les paramètres du template
    const appointmentDate = new Date(appointment.start).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const appointmentTime = new Date(appointment.start).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const parameters = [
      patient.prenom,
      appointmentDate,
      appointmentTime,
      doctor.name || 'Dr. ' + doctor.nom,
      'Cabinet médical - 123 Rue de la Santé, 75000 Paris'
    ]

    // Simuler l'envoi
    const result = await simulateWhatsAppAPI(phoneNumber, templateName, parameters)

    // Log pour debug
    console.log('📱 WhatsApp envoyé:', {
      to: phoneNumber,
      template: templateName,
      parameters,
      result
    })

    return {
      success: true,
      messageId: result.message_id,
      to: phoneNumber,
      template: templateName,
      sentAt: new Date().toISOString(),
      cost: 0.045 // Coût simulé en EUR
    }

  } catch (error) {
    console.error('❌ Erreur envoi WhatsApp:', error)
    
    return {
      success: false,
      error: error.message,
      to: phoneNumber,
      template: templateName,
      attemptedAt: new Date().toISOString()
    }
  }
}

/**
 * Envoyer une confirmation de rendez-vous
 */
export const sendAppointmentConfirmation = async (appointment, patient, doctor) => {
  try {
    const phoneNumber = formatPhoneNumber(patient.phone)
    if (!isValidWhatsAppNumber(phoneNumber)) {
      throw new Error('Numéro de téléphone invalide pour WhatsApp')
    }

    const appointmentDate = new Date(appointment.start).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const appointmentTime = new Date(appointment.start).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const parameters = [
      patient.prenom,
      appointmentDate,
      appointmentTime,
      doctor.name || 'Dr. ' + doctor.nom,
      'Cabinet médical - 123 Rue de la Santé, 75000 Paris'
    ]

    const result = await simulateWhatsAppAPI(phoneNumber, 'appointment_confirmation', parameters)

    return {
      success: true,
      messageId: result.message_id,
      to: phoneNumber,
      template: 'appointment_confirmation',
      sentAt: new Date().toISOString(),
      cost: 0.045
    }

  } catch (error) {
    console.error('❌ Erreur confirmation WhatsApp:', error)
    
    return {
      success: false,
      error: error.message,
      to: phoneNumber,
      template: 'appointment_confirmation',
      attemptedAt: new Date().toISOString()
    }
  }
}

/**
 * Envoyer un avis d'annulation
 */
export const sendAppointmentCancellation = async (appointment, patient, doctor) => {
  try {
    const phoneNumber = formatPhoneNumber(patient.phone)
    if (!isValidWhatsAppNumber(phoneNumber)) {
      throw new Error('Numéro de téléphone invalide pour WhatsApp')
    }

    const appointmentDate = new Date(appointment.start).toLocaleDateString('fr-FR')
    const appointmentTime = new Date(appointment.start).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const parameters = [
      patient.prenom,
      appointmentDate,
      appointmentTime,
      doctor.name || 'Dr. ' + doctor.nom,
      '01 23 45 67 89' // Numéro du cabinet
    ]

    const result = await simulateWhatsAppAPI(phoneNumber, 'appointment_cancelled', parameters)

    return {
      success: true,
      messageId: result.message_id,
      to: phoneNumber,
      template: 'appointment_cancelled',
      sentAt: new Date().toISOString(),
      cost: 0.045
    }

  } catch (error) {
    console.error('❌ Erreur annulation WhatsApp:', error)
    
    return {
      success: false,
      error: error.message,
      to: phoneNumber,
      template: 'appointment_cancelled',
      attemptedAt: new Date().toISOString()
    }
  }
}

/**
 * Obtenir les statistiques des messages WhatsApp
 */
export const getWhatsAppStats = () => {
  // Simuler des statistiques
  return {
    totalSent: 156,
    totalDelivered: 152,
    totalRead: 134,
    totalReplied: 45,
    totalCost: 7.02,
    deliveryRate: 97.4,
    readRate: 88.2,
    replyRate: 33.6,
    lastMonth: {
      sent: 89,
      delivered: 87,
      cost: 4.01
    }
  }
}

/**
 * Vérifier le statut de configuration WhatsApp
 */
export const getWhatsAppStatus = () => {
  return {
    ...WHATSAPP_CONFIG,
    status: 'active',
    lastCheck: new Date().toISOString(),
    templatesApproved: Object.keys(MESSAGE_TEMPLATES).length,
    phoneNumberStatus: 'verified',
    businessVerified: true
  }
}

export default {
  sendAppointmentReminder,
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  getWhatsAppStats,
  getWhatsAppStatus,
  formatPhoneNumber,
  isValidWhatsAppNumber,
  MESSAGE_TEMPLATES
}