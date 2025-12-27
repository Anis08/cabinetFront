import React from 'react'
import { Trash2 } from 'lucide-react'

const PrescriptionPreview = ({ template, patient, medicaments, observations, onRemoveMed }) => {
  const getPatientAge = () => {
    if (!patient?.dateOfBirth) return null
    return new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
  }

  const getPatientInfo = () => {
    const parts = []
    if (template.showPatientAge && getPatientAge()) {
      parts.push(`${getPatientAge()} ans`)
    }
    if (template.showPatientGender && patient?.gender) {
      parts.push(patient.gender)
    }
    if (template.showPatientDateOfBirth && patient?.dateOfBirth) {
      parts.push(`Né(e) le ${new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}`)
    }
    return parts.join(' • ')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto" id="prescription-preview">
      {/* Header with Logo and Doctor Info */}
      <div className="border-b-2 pb-4 mb-6" style={{ borderColor: template.headerColor }}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {template.clinicName && (
              <h2 className="text-2xl font-bold mb-2" style={{ color: template.headerColor }}>
                {template.clinicName}
              </h2>
            )}
            <h3 className="text-xl font-bold text-gray-800">
              {template.doctorName}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{template.specialty}</p>
            
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              {template.address && (
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{template.address}</span>
                </p>
              )}
              {template.phone && (
                <p className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{template.phone}</span>
                </p>
              )}
              {template.email && (
                <p className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>{template.email}</span>
                </p>
              )}
            </div>
          </div>

          {template.logo && (
            <div className="ml-4">
              <img 
                src={template.logo} 
                alt="Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Patient Info - Header Layout */}
      {template.patientLayout === 'header' && template.showPatientName && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium text-gray-700">Patient: </span>
              <span className="font-semibold text-gray-900">{patient?.fullName}</span>
            </p>
            {getPatientInfo() && (
              <p className="text-gray-600">{getPatientInfo()}</p>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Date: </span>
          <span className="font-semibold text-gray-800">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </p>
      </div>

      {/* Patient Info - Body Layout */}
      {template.patientLayout === 'body' && template.showPatientName && (
        <div className="mb-6 p-4 rounded-lg border-2" style={{ borderColor: template.accentColor, backgroundColor: `${template.accentColor}10` }}>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium text-gray-700">Patient: </span>
              <span className="font-bold text-gray-900">{patient?.fullName}</span>
            </p>
            {getPatientInfo() && (
              <p className="text-gray-600">{getPatientInfo()}</p>
            )}
          </div>
        </div>
      )}

      {/* Prescription Symbol */}
      <div className="mb-4">
        <span className="text-4xl font-serif" style={{ color: template.headerColor }}>℞</span>
      </div>

      {/* Medications List */}
      <div className="mb-6 space-y-4">
        {medicaments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-400 italic">Aucun médicament ajouté</p>
            <p className="text-xs text-gray-400 mt-2">Ajoutez des médicaments depuis le formulaire</p>
          </div>
        ) : (
          medicaments.map((med, index) => (
            <div 
              key={med.id} 
              className="relative border-l-4 pl-4 py-2 hover:bg-gray-50 transition-colors rounded-r-lg"
              style={{ borderColor: template.accentColor }}
            >
              {onRemoveMed && (
                <button
                  onClick={() => onRemoveMed(med.id)}
                  className="absolute -right-2 -top-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md z-10"
                  title="Supprimer ce médicament"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              
              <div className="pr-6">
                <p className="font-semibold text-gray-900 text-base">
                  {index + 1}. {med.nom} {med.dosage}
                  <span className="ml-2 text-sm font-normal text-gray-600">({med.forme})</span>
                </p>
                
                <div className="mt-2 space-y-1 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Posologie:</span> {med.frequence}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Durée:</span> {med.duree}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Prise:</span> {med.momentPrise}
                  </p>
                  {med.instructions && (
                    <p className="text-gray-600 italic mt-1 pl-4 border-l-2 border-gray-300">
                      {med.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Observations */}
      {observations && (
        <div className="mb-6 p-4 rounded-lg border-2" style={{ 
          borderColor: template.accentColor,
          backgroundColor: '#fef3c7'
        }}>
          <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span>💡</span>
            Observations:
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{observations}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 pt-4 mt-8" style={{ borderColor: template.headerColor }}>
        <div className="flex justify-between items-end">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Date d'émission:</p>
            <p>{new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Signature et cachet</p>
            <div className="mt-12 pt-2 border-t border-gray-400">
              <p className="font-bold text-gray-800">{template.doctorName}</p>
              <p className="text-xs text-gray-600">{template.specialty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Cette ordonnance est valable 3 mois à compter de sa date d'émission
        </p>
      </div>
    </div>
  )
}

export default PrescriptionPreview
