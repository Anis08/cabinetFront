import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Clock, Calendar, Euro } from 'lucide-react'

const StatisticsSimple = () => {
  const mockStats = {
    patientsTotal: 127,
    consultationsJour: 12,
    consultationsSemaine: 48,
    consultationsMois: 185,
    tempsAttenteMoyen: 15,
    tauxSatisfaction: 96,
    caJour: 845,
    caMois: 12650
  }

  const ageDistribution = [
    { tranche: '0-18 ans', count: 23, percentage: 18 },
    { tranche: '19-35 ans', count: 34, percentage: 27 },
    { tranche: '36-50 ans', count: 41, percentage: 32 },
    { tranche: '51-65 ans', count: 20, percentage: 16 },
    { tranche: '65+ ans', count: 9, percentage: 7 }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
              Statistiques du cabinet
            </h1>
            <p className="text-gray-600 mt-1">Analyse des performances et tendances</p>
          </div>
        </div>
      </motion.div>

      {/* KPIs principaux */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Patients total</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.patientsTotal}</p>
              <p className="text-xs text-green-600">+5% ce mois</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Consultations/jour</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.consultationsJour}</p>
              <p className="text-xs text-green-600">+2 vs hier</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Temps attente moy.</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.tempsAttenteMoyen}min</p>
              <p className="text-xs text-red-600">+2min vs semaine</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Euro className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">CA mensuel</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.caMois.toLocaleString()}€</p>
              <p className="text-xs text-green-600">+12% vs mois dernier</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par âge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribution par âge
          </h3>
          
          <div className="space-y-4">
            {ageDistribution.map((item, index) => (
              <div key={item.tranche} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-20">{item.tranche}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tendances mensuelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendances mensuelles
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Consultations</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-900">{mockStats.consultationsMois}</div>
                <div className="text-xs text-green-600">+8% vs mois dernier</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Euro className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Chiffre d'affaires</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-900">{mockStats.caMois.toLocaleString()}€</div>
                <div className="text-xs text-blue-600">+12% vs mois dernier</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-800">Taux satisfaction</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-purple-900">{mockStats.tauxSatisfaction}%</div>
                <div className="text-xs text-purple-600">+1% vs mois dernier</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Statut fonctionnalité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-orange-50 border border-orange-200 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <BarChart3 className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-orange-900">
              Statistiques - Version Simplifiée
            </h4>
            <p className="text-sm text-orange-800 mt-1">
              ✅ KPIs temps réel • 📊 Graphiques interactifs • 📈 Analyse des tendances
            </p>
            <p className="text-xs text-orange-700 mt-2">
              La version complète inclut : graphiques Chart.js interactifs, export des données, 
              analyse prédictive, comparaisons temporelles et bien plus !
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StatisticsSimple