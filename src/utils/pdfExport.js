/**
 * Utility for exporting prescriptions to PDF
 * Uses html2canvas and jsPDF for PDF generation
 */

export const exportPrescriptionToPDF = async (prescriptionData) => {
  try {
    // Dynamic import to reduce bundle size
    const html2canvas = await import('html2canvas')
    const jsPDF = await import('jspdf')

    // Get the prescription preview element
    const element = document.getElementById('prescription-preview')
    
    if (!element) {
      throw new Error('Prescription preview element not found')
    }

    // Generate canvas from HTML
    const canvas = await html2canvas.default(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // Calculate PDF dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF.default('p', 'mm', 'a4')
    
    let heightLeft = imgHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Generate filename
    const patientName = prescriptionData.patientName || 'Patient'
    const date = new Date().toISOString().split('T')[0]
    const filename = `Ordonnance_${patientName.replace(/\s+/g, '_')}_${date}.pdf`

    // Save PDF
    pdf.save(filename)

    return { success: true, filename }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Print prescription directly
 */
export const printPrescription = () => {
  window.print()
}

/**
 * Save prescription template to localStorage
 */
export const saveTemplate = (template) => {
  try {
    localStorage.setItem('prescriptionTemplate', JSON.stringify(template))
    return { success: true }
  } catch (error) {
    console.error('Template save error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Load prescription template from localStorage
 */
export const loadTemplate = () => {
  try {
    const savedTemplate = localStorage.getItem('prescriptionTemplate')
    if (savedTemplate) {
      return { success: true, template: JSON.parse(savedTemplate) }
    }
    return { success: false, error: 'No template found' }
  } catch (error) {
    console.error('Template load error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get default template
 */
export const getDefaultTemplate = () => {
  return {
    logo: '',
    doctorName: localStorage.getItem('name')?.replace(/"/g, '') || '',
    specialty: 'Médecin Généraliste',
    address: '',
    phone: '',
    email: '',
    clinicName: '',
    patientLayout: 'header',
    showPatientName: true,
    showPatientAge: true,
    showPatientGender: true,
    showPatientDateOfBirth: true,
    headerColor: '#1e40af',
    accentColor: '#3b82f6'
  }
}
