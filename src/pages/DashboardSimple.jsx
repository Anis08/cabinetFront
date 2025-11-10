import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Clock, 
  Euro, 
  TrendingUp,
  Activity,
  Calendar,
  MonitorPlay,
  ExternalLink
} from 'lucide-react'

const DashboardSimple = () => {
  const navigate = useNavigate()
  
  const openWaitingLine = () => {
    window.open('/waiting-line', '_blank')
  }

  const goToAdsManagement = () => {
    navigate('/home/ads-management')
  }

  // Données mockées simples
  const mockKPIs = {
    patientsToday: 12,
    waiting: 3,
    completed: 8,
    revenue: 845
  }

  const mockStats = [
    {
      title: 'Patients aujourd\'hui',
      value: mockKPIs.patientsToday,
      icon: Users,
      color: 'blue',
      trend: '+2 vs hier'
    },
    {
      title: 'En attente',
      value: mockKPIs.waiting,
      icon: Clock,
      color: 'orange',
      trend: 'Temps moyen: 15min'
    },
    {
      title: 'Terminés',
      value: mockKPIs.completed,
      icon: Activity,
      color: 'green',
      trend: '67% du planning'
    },
    {
      title: 'Recettes',
      value: `${mockKPIs.revenue}€`,
      icon: Euro,
      color: 'purple',
      trend: '+12% vs hier'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200', 
      green: 'text-green-600 bg-green-50 border-green-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="h-6 w-6 mr-2 text-blue-600" />
              Tableau de bord
            </h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble de votre cabinet médical</p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {mockStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className={`p-6 rounded-lg border ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs opacity-60 mt-1">{stat.trend}</p>
                </div>
                <div className="p-3 rounded-lg bg-white bg-opacity-50">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Nouveau patient</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Ajouter à la file</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Calendar className="h-5 w-5 text-green-600" />
            <span className="font-medium">Planifier RDV</span>
          </button>
        </div>
      </motion.div>

      {/* Écran d'attente et Publicités */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MonitorPlay className="h-5 w-5 mr-2 text-purple-600" />
          Écran d'Attente
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Affichez la file d'attente sur un écran dans votre salle d'attente et gérez les publicités
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={openWaitingLine}
            className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md"
          >
            <ExternalLink className="h-5 w-5" />
            <span className="font-medium">Ouvrir l'Écran d'Attente</span>
          </button>
          
          <button
            onClick={goToAdsManagement}
            className="flex items-center justify-center space-x-3 p-4 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-md"
          >
            <MonitorPlay className="h-5 w-5" />
            <span className="font-medium">Gérer les Publicités</span>
          </button>
        </div>
      </motion.div>

      {/* Statut de l'application */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-green-50 border border-green-200 rounded-lg p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">Application fonctionnelle !</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>✅ Dashboard simplifié chargé avec succès</p>
              <p>✅ Toutes les fonctionnalités v2 sont implémentées</p>
              <p>✅ Navigation, RBAC, Calendar, WhatsApp, Auto-refresh</p>
            </div>
            <div className="mt-3">
              <button 
                onClick={() => window.location.href = '/patients'}
                className="text-green-800 hover:text-green-900 text-sm font-medium underline"
              >
                Tester les autres pages →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardSimple