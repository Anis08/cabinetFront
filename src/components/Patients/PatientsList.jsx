import { motion } from "framer-motion";
import { Eye, Edit} from "lucide-react"

const PatientsList = ( { patient, index, navigate }) => {

  function getAgeFromDate(dateString) {
  const birthDate = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

  return (
    <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {patient.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {patient.fullName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="text-nowrap">{getAgeFromDate(patient.dateOfBirth)} ans</span>
                        <span>{patient.phoneNumber}</span>
                        <span className="text-blue-600">{patient.maladieChronique}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      Dernière visite: {patient.rendezVous.length > 0 ? new Date(patient.rendezVous[0].date).toLocaleDateString('fr-FR') : 'Pas encore'}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button onClick={navigate}
                       title={null} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button title={null} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
  )
}

export default PatientsList;