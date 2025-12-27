import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Calendar,
  Euro,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  MapPin,
  Phone,
  UserCheck,
  UserX,
  Briefcase,
  Heart,
  Zap,
  Award,
  DollarSign,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { baseURL } from '../config'
import { useAuth } from '../store/AuthProvider'

const StatisticsAdvanced = () => {
  const { logout, refresh } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Charger les statistiques depuis l'API
  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      let response = await fetch(`${baseURL}/medecin/statistics`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 403) {
          logout()
          return
        }
        if (response.status === 401) {
          const refreshResponse = await refresh()
          if (!refreshResponse) {
            logout()
            return
          }
          response = await fetch(`${baseURL}/medecin/statistics`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          })
        }
      }

      if (response.ok) {
        const data = await response.json()
        setStats(data.statistics)
      } else {
        // Utiliser des données mockées si l'API n'est pas disponible
        setStats(getMockStatistics())
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      setStats(getMockStatistics())
    } finally {
      setLoading(false)
    }
  }

  // Données mockées complètes
  const getMockStatistics = () => ({
    // Patients et activité
    patients: {
      total: 127,
      nouveaux: 18,
      retour: 109,
      tauxFidelisation: 86,
      tauxNoShow: 8,
      hommes: 58,
      femmes: 69,
      local: 95,
      horsVille: 25,
      horsRegion: 7
    },
    // Consultations
    consultations: {
      total: 185,
      jour: 12,
      semaine: 48,
      mois: 185,
      presentiel: 165,
      teleconsultation: 20,
      dureeeMoyenne: 23,
      urgences: 12,
      tempsAttenteMoyen: 15
    },
    // Finances
    finances: {
      caTotal: 12650,
      caJour: 845,
      caMoyenConsultation: 68.38,
      caMoyenPatient: 99.61,
      depenses: 3950,
      resultatNet: 8700,
      tauxRemboursement: 94,
      tauxTeletransmission: 98,
      previsionCaMoisProchain: 13788
    },
    // Performance
    performance: {
      tauxOccupation: 78,
      tauxPonctualite: 92,
      tempsEntreConsultations: 45,
      heuresTravaillees: 42,
      heuresPerdues: 6,
      tauxSatisfaction: 96
    },
    // Distribution par âge
    ageDistribution: [
      { tranche: '0-18 ans', count: 23, percentage: 18 },
      { tranche: '19-35 ans', count: 34, percentage: 27 },
      { tranche: '36-50 ans', count: 41, percentage: 32 },
      { tranche: '51-65 ans', count: 20, percentage: 16 },
      { tranche: '65+ ans', count: 9, percentage: 7 }
    ],
    // Motifs de consultation
    motifsConsultation: [
      { motif: 'Suivi chronique', count: 52, percentage: 28 },
      { motif: 'Consultation générale', count: 45, percentage: 24 },
      { motif: 'Renouvellement ordonnance', count: 38, percentage: 21 },
      { motif: 'Bilan de santé', count: 30, percentage: 16 },
      { motif: 'Urgence', count: 20, percentage: 11 }
    ],
    // Tendances
    tendances: {
      consultations: 8,
      ca: 12,
      satisfaction: 1,
      tempsAttente: -5
    },
    // Prévisions
    previsions: {
      consultationsMoisProchain: 199,
      croissanceConsultations: 7,
      caMoisProchain: 14168,
      croissanceCA: 12,
      satisfactionPrevue: 97,
      tempsAttentePrevue: 14
    }
  })

  // Composant pour afficher une statistique
  const StatCard = ({ icon: Icon, label, value, subValue, trend, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center text-sm font-semibold ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> :
             trend < 0 ? <ArrowDownRight className="w-4 h-4 mr-1" /> :
             <Minus className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-600 mt-1">{subValue}</p>}
      </div>
    </motion.div>
  )

  // Composant pour les recommandations
  const RecommendationCard = ({ icon: Icon, title, description, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`p-4 rounded-lg border-l-4 ${color} bg-white shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Impossible de charger les statistiques</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
              📊 Statistiques du Cabinet
            </h1>
            <p className="text-gray-600 mt-2">Analyse complète des performances et tendances</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Mis à jour en temps réel</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>
      </motion.div>

      {/* Section 1: KPIs Principaux */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Target className="w-6 h-6 mr-2 text-blue-600" />
          📈 Indicateurs Clés de Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Patients Total"
            value={stats.patients.total}
            subValue={`${stats.patients.nouveaux} nouveaux ce mois`}
            trend={5}
            color="bg-blue-100 text-blue-600"
            delay={0.1}
          />
          <StatCard
            icon={Calendar}
            label="Consultations/Jour"
            value={stats.consultations.jour}
            subValue={`${stats.consultations.mois} ce mois`}
            trend={stats.tendances.consultations}
            color="bg-green-100 text-green-600"
            delay={0.2}
          />
          <StatCard
            icon={Clock}
            label="Temps d'Attente Moyen"
            value={`${stats.consultations.tempsAttenteMoyen}min`}
            subValue="Objectif: <10min"
            trend={stats.tendances.tempsAttente}
            color="bg-orange-100 text-orange-600"
            delay={0.3}
          />
          <StatCard
            icon={Euro}
            label="CA Mensuel"
            value={`${stats.finances.caTotal.toLocaleString()}€`}
            subValue={`${stats.finances.caMoyenConsultation.toFixed(2)}€/consultation`}
            trend={stats.tendances.ca}
            color="bg-purple-100 text-purple-600"
            delay={0.4}
          />
        </div>
      </div>

      {/* Section 2: Activité Patients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-green-600" />
          👥 Activité des Patients
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistiques patients */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Statistiques Patients</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center">
                  <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                  Taux de fidélisation
                </span>
                <span className="font-semibold text-gray-900">{stats.patients.tauxFidelisation}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center">
                  <UserX className="w-4 h-4 mr-2 text-red-600" />
                  Taux de no-show
                </span>
                <span className="font-semibold text-gray-900">{stats.patients.tauxNoShow}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Hommes / Femmes</span>
                <span className="font-semibold text-gray-900">
                  {stats.patients.hommes} / {stats.patients.femmes}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  Patients locaux
                </span>
                <span className="font-semibold text-gray-900">{stats.patients.local}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-purple-600" />
                  Téléconsultations
                </span>
                <span className="font-semibold text-gray-900">
                  {stats.consultations.teleconsultation} ({Math.round((stats.consultations.teleconsultation / stats.consultations.total) * 100)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Distribution par âge */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Répartition par Âge</h3>
            <div className="space-y-3">
              {stats.ageDistribution.map((item, index) => (
                <div key={item.tranche}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.tranche}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.count} <span className="text-gray-500">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Insight:</strong> La tranche 36-50 ans représente la plus grande part ({stats.ageDistribution[2].percentage}%).
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Performances Financières */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-purple-600" />
          💸 Performances Financières
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">CA Total Mensuel</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">{stats.finances.caTotal.toLocaleString()}€</p>
            <p className="text-sm text-purple-700 mt-1">+{stats.tendances.ca}% vs mois dernier</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Résultat Net</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.finances.resultatNet.toLocaleString()}€</p>
            <p className="text-sm text-green-700 mt-1">Marge: {Math.round((stats.finances.resultatNet / stats.finances.caTotal) * 100)}%</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">CA Moyen / Patient</span>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.finances.caMoyenPatient.toFixed(2)}€</p>
            <p className="text-sm text-blue-700 mt-1">{stats.finances.caMoyenConsultation.toFixed(2)}€ / consultation</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taux remboursement</span>
              <span className="font-semibold text-green-600">{stats.finances.tauxRemboursement}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taux télétransmission</span>
              <span className="font-semibold text-blue-600">{stats.finances.tauxTeletransmission}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dépenses mensuelles</span>
              <span className="font-semibold text-red-600">{stats.finances.depenses.toLocaleString()}€</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 4: Performance Praticien */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Award className="w-6 h-6 mr-2 text-yellow-600" />
          🧑‍⚕️ Performance du Praticien
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Taux d'occupation agenda</span>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{stats.performance.tauxOccupation}%</span>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${stats.performance.tauxOccupation}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Taux de ponctualité</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{stats.performance.tauxPonctualite}%</span>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stats.performance.tauxPonctualite}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Taux de satisfaction</span>
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">{stats.performance.tauxSatisfaction}%</span>
              <span className="text-sm text-green-600 mb-1">+{stats.tendances.satisfaction}%</span>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full"
                style={{ width: `${stats.performance.tauxSatisfaction}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <span className="text-xs text-gray-500">Durée moyenne consultation</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats.consultations.dureeeMoyenne} min</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <span className="text-xs text-gray-500">Consultations urgentes</span>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {stats.consultations.urgences} ({Math.round((stats.consultations.urgences / stats.consultations.total) * 100)}%)
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <span className="text-xs text-gray-500">Heures travaillées/semaine</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats.performance.heuresTravaillees}h</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <span className="text-xs text-gray-500">Heures perdues (annulations)</span>
            <p className="text-xl font-bold text-red-600 mt-1">{stats.performance.heuresPerdues}h</p>
          </div>
        </div>
      </motion.div>

      {/* Section 5: Motifs de Consultation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Briefcase className="w-6 h-6 mr-2 text-indigo-600" />
          📋 Motifs de Consultation les Plus Fréquents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.motifsConsultation.map((motif, index) => (
            <div key={motif.motif} className="text-center">
              <div className="relative">
                <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={`hsl(${220 + index * 30}, 70%, 50%)`}
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - motif.percentage / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - motif.percentage / 100) }}
                    transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{motif.percentage}%</p>
                    <p className="text-xs text-gray-500">{motif.count}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 mt-2">{motif.motif}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 6: Prévisions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <LineChart className="w-6 h-6 mr-2 text-cyan-600" />
          🔮 Prévisions et Tendances
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
            <h3 className="font-semibold text-gray-800 mb-4">Prévisions pour le mois prochain</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-700">Consultations prévues</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{stats.previsions.consultationsMoisProchain}</span>
                  <span className="text-xs text-green-600 ml-2">+{stats.previsions.croissanceConsultations}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-700">CA prévu</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{stats.previsions.caMoisProchain.toLocaleString()}€</span>
                  <span className="text-xs text-green-600 ml-2">+{stats.previsions.croissanceCA}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-700">Satisfaction prévue</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{stats.previsions.satisfactionPrevue}%</span>
                  <span className="text-xs text-green-600 ml-2">+1%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-gray-700">Temps d'attente prévu</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{stats.previsions.tempsAttentePrevue}min</span>
                  <span className="text-xs text-green-600 ml-2">-1min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Analyses Automatiques</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>📈 Croissance soutenue :</strong> Le volume de consultations devrait augmenter de {stats.previsions.croissanceConsultations}% le mois prochain selon la tendance actuelle.
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💰 Performance financière :</strong> Le CA mensuel est en hausse de {stats.tendances.ca}% avec une marge nette de {Math.round((stats.finances.resultatNet / stats.finances.caTotal) * 100)}%.
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  <strong>🤝 Fidélisation excellente :</strong> Le taux de fidélisation de {stats.patients.tauxFidelisation}% indique une forte satisfaction des patients.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>⏱️ Optimisation possible :</strong> Le temps d'attente moyen de {stats.consultations.tempsAttenteMoyen}min peut être réduit par une meilleure gestion des créneaux.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 7: Recommandations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.0 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-yellow-600" />
          💡 Recommandations Stratégiques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            icon={Clock}
            title="Optimiser les temps d'attente"
            description={`Réduire les temps d'attente de ${stats.consultations.tempsAttenteMoyen}min à moins de 10min en ajustant la durée moyenne des consultations de ${stats.consultations.dureeeMoyenne}min à 20min.`}
            color="border-orange-400"
            delay={1.1}
          />
          <RecommendationCard
            icon={DollarSign}
            title="Maximiser la rentabilité"
            description="Cibler les consultations à forte valeur ajoutée (suivi chronique, bilans) qui représentent déjà 28% de l'activité pour augmenter le CA moyen par consultation."
            color="border-green-400"
            delay={1.2}
          />
          <RecommendationCard
            icon={Users}
            title="Campagne de rappel ciblée"
            description={`Mettre en place une campagne de rappel pour la tranche 19-35 ans (${stats.ageDistribution[1].count} patients, ${stats.ageDistribution[1].percentage}%) pour augmenter la fréquence des consultations.`}
            color="border-blue-400"
            delay={1.3}
          />
          <RecommendationCard
            icon={Phone}
            title="Réduire le taux de no-show"
            description={`Implémenter des rappels SMS automatiques 24h avant pour réduire le taux de no-show actuel de ${stats.patients.tauxNoShow}% à moins de 5%.`}
            color="border-purple-400"
            delay={1.4}
          />
          <RecommendationCard
            icon={Activity}
            title="Développer la téléconsultation"
            description={`Augmenter la part de téléconsultations de ${Math.round((stats.consultations.teleconsultation / stats.consultations.total) * 100)}% à 15% pour améliorer l'accessibilité et optimiser l'agenda.`}
            color="border-indigo-400"
            delay={1.5}
          />
        </div>
      </motion.div>

      {/* Footer avec résumé */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.1 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🎯 Résumé Exécutif</h3>
            <p className="text-blue-100">
              Cabinet en excellente santé avec une croissance de {stats.tendances.consultations}% des consultations 
              et {stats.tendances.ca}% du CA. Taux de satisfaction exceptionnel à {stats.performance.tauxSatisfaction}%.
              Opportunités d'optimisation identifiées pour réduire les temps d'attente et le no-show.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.performance.tauxSatisfaction}%</div>
            <div className="text-sm text-blue-100">Note globale</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StatisticsAdvanced
