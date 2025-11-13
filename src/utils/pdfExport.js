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

/**
 * Generate PDF directly from prescription data (no DOM needed)
 */
export const generatePrescriptionPDF = async (prescriptionData) => {
  try {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    let y = margin;

    const { template, patient, medicaments = [], observations = '' } = prescriptionData;

    // Header
    if (template.clinicName) {
      doc.setFontSize(18);
      doc.setTextColor(template.headerColor || '#1e40af');
      doc.text(template.clinicName, margin, y);
      y += 8;
    }
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(template.doctorName || '', margin, y);
    y += 6;
    doc.setFontSize(11);
    doc.text(template.specialty || '', margin, y);
    y += 6;
    if (template.address) {
      doc.text(`📍 ${template.address}`, margin, y);
      y += 5;
    }
    if (template.phone) {
      doc.text(`📞 ${template.phone}`, margin, y);
      y += 5;
    }
    if (template.email) {
      doc.text(`✉️ ${template.email}`, margin, y);
      y += 5;
    }

    // Logo (if any)
    if (template.logo) {
      try {
        doc.addImage(template.logo, 'PNG', 170, margin, 25, 25);
      } catch (e) {}
    }

    y += 8;
    doc.setDrawColor(template.headerColor || '#1e40af');
    doc.setLineWidth(1);
    doc.line(margin, y, 190, y);
    y += 6;

    // Patient Info
    if (template.showPatientName && patient?.fullName) {
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Patient: ${patient.fullName}`, margin, y);
      y += 6;
      let info = [];
      if (template.showPatientAge && patient.age) info.push(`Âge: ${patient.age}`);
      if (template.showPatientGender && patient.gender) info.push(`Sexe: ${patient.gender}`);
      if (template.showPatientDateOfBirth && patient.dateOfBirth) info.push(`Né(e): ${patient.dateOfBirth}`);
      if (info.length) {
        doc.setFontSize(10);
        doc.text(info.join(' | '), margin, y);
        y += 6;
      }
    }

    // Date
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    y += 8;

    // Prescription Symbol
    doc.setFontSize(22);
    doc.setTextColor(template.headerColor || '#1e40af');
    doc.text('℞', margin, y);
    y += 10;

    // Medications
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    if (!medicaments.length) {
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text('Aucun médicament ajouté', margin, y);
      y += 8;
    } else {
      medicaments.forEach((med, idx) => {
        doc.setFontSize(12);
        doc.setTextColor(template.accentColor || '#3b82f6');
        doc.text(`${idx + 1}. ${med.nom} ${med.dosage} (${med.forme})`, margin, y);
        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Posologie: ${med.frequence}`, margin + 4, y);
        y += 5;
        doc.text(`Durée: ${med.duree}`, margin + 4, y);
        y += 5;
        doc.text(`Prise: ${med.momentPrise}`, margin + 4, y);
        y += 5;
        if (med.instructions) {
          doc.setFont('helvetica', 'italic');
          doc.text(`Instructions: ${med.instructions}`, margin + 8, y);
          doc.setFont('helvetica', 'normal');
          y += 5;
        }
        y += 2;
      });
    }

    // Observations
    if (observations) {
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.setFillColor(254, 243, 199); // #fef3c7
      doc.rect(margin, y, 170, 12, 'F');
      doc.text('💡 Observations:', margin + 2, y + 5);
      doc.setFontSize(10);
      doc.text(observations, margin + 2, y + 10);
      y += 16;
    }

    // Footer
    y += 10;
    doc.setDrawColor(template.headerColor || '#1e40af');
    doc.setLineWidth(1);
    doc.line(margin, y, 190, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`, margin, y);
    doc.text('Signature et cachet', 160, y);
    y += 18;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(template.doctorName || '', 160, y);
    doc.setFontSize(10);
    doc.text(template.specialty || '', 160, y + 5);

    // Footer Note
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Cette ordonnance est valable 3 mois à compter de sa date d'émission", 105, 285, { align: 'center' });

    // Save PDF
    const patientName = patient?.fullName || 'Patient';
    const date = new Date().toISOString().split('T')[0];
    const filename = `Ordonnance_${patientName.replace(/\s+/g, '_')}_${date}.pdf`;
    doc.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: error.message };
  }
}
