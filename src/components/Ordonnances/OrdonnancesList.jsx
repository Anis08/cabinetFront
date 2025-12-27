import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Eye, Download, Calendar, Pill } from 'lucide-react'

const OrdonnancesList = ({ ordonnances, onView, onDownload }) => {
  if (!ordonnances || ordonnances.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucune ordonnance disponible</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {ordonnances.map((ordonnance, index) => (
        <motion.div
          key={ordonnance._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Ordonnance #{ordonnance.numero || ordonnance._id?.slice(-6)}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(ordonnance.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medications Preview */}
              <div className="ml-12 space-y-1">
                {ordonnance.medicaments?.slice(0, 3).map((med, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <Pill className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {med.nom} {med.dosage} - {med.frequence}
                    </span>
                  </div>
                ))}
                {ordonnance.medicaments?.length > 3 && (
                  <p className="text-xs text-gray-500 ml-5">
                    +{ordonnance.medicaments.length - 3} autre(s) médicament(s)
                  </p>
                )}
              </div>

              {/* Observations */}
              {ordonnance.observations && (
                <div className="ml-12 mt-2 text-sm text-gray-600 italic">
                  {ordonnance.observations.slice(0, 100)}
                  {ordonnance.observations.length > 100 && '...'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onView(ordonnance)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Voir l'ordonnance"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDownload(ordonnance)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Télécharger PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default OrdonnancesList
