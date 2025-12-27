import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Euro, TrendingUp, FileText, DollarSign } from 'lucide-react'
import { baseURL } from "../config"
import { useAuth } from '../store/AuthProvider'
import { useData } from '../store/DataProvider'

const BillingSimple = () => {


  const { completedAppointments, setCompletedAppointments, averagePaid, caDay, caWeek, setAveragePaid, setCaDay, setCaWeek } = useData();
  const { logout, refresh } = useAuth();


  const mockInvoices = [
    {
      id: 1,
      numero: 'FAC-2025-001',
      patient: 'Marie Dubois',
      date: '2025-08-22',
      montant: 65,
      statut: 'paye'
    },
    {
      id: 2,
      numero: 'FAC-2025-002',
      patient: 'Jean Martin',
      date: '2025-08-22',
      montant: 75,
      statut: 'paye'
    },
    {
      id: 3,
      numero: 'FAC-2025-003',
      patient: 'Sophie Bernard',
      date: '2025-08-21',
      montant: 55,
      statut: 'impaye'
    }
  ]


  useEffect(() => {
    const getCompletedAppointments = async () => {
      if (completedAppointments) return;
      try {
        let response = await fetch(`${baseURL}/medecin/completed-appointments`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status == 403) {
            logout();
            return
          }
          if (response.status == 401) {
            const refreshResponse = await refresh();
            if (!refreshResponse) {
              logout();
              return
            }


            response = await fetch(`${baseURL}/medecin/completed-appointments`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              credentials: 'include',
            });

          }

          if (response.status === 404) {

            alert('Aucun rendez-vous trouvé.');
            return;
          }



          if (response.status === 500) {

            alert('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.');
            return;
          }
        }

        const data = await response.json();

        setCompletedAppointments(data.completedApointments);
        setAveragePaid(data.averagePaid);
        setCaDay(data.todayRevenue);
        setCaWeek(data.monthRevenue);
      }
      catch (error) {
        return { error: 'Une erreur est survenue lors de la création du patient.' }
      }
    }

    getCompletedAppointments();
  }, [])

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
              <Euro className="h-6 w-6 mr-2 text-blue-600" />
              Comptabilité & Facturation
            </h1>
            <p className="text-gray-600 mt-1">Gestion financière du cabinet</p>
          </div>
        </div>
      </motion.div>

      {/* KPIs Financiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Euro className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">CA Jour</p>
              <p className="text-2xl font-semibold text-gray-900">{caDay}DA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">CA Mois</p>
              <p className="text-2xl font-semibold text-gray-900">{caWeek}DA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Impayés</p>
              <p className="text-2xl font-semibold text-gray-900">tetbedel</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Panier moyen</p>
              <p className="text-2xl font-semibold text-gray-900">{averagePaid}DA</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Liste des factures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Factures récentes ({completedAppointments?.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {completedAppointments && completedAppointments.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="px-6 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Fac-{new Date(invoice.date).getFullYear()}-{String(invoice.id).padStart(3, '0')}
                    </h4>
                    <p className="text-sm text-gray-600">{invoice.patient.fullName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </span>
                  {!!invoice.paid && <span className="text-lg font-semibold text-gray-900">
                    {invoice.paid}DA
                  </span>}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.paid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {invoice.paid ? 'Payé' : 'Impayé'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-start space-x-3">
          <Euro className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-900">
              Comptabilité - Version Simplifiée
            </h4>
            <p className="text-sm text-green-800 mt-1">
              ✅ KPIs financiers • 💰 Facturation • 📊 Statistiques temps réel
            </p>
            <p className="text-xs text-green-700 mt-2">
              La version complète inclut : création de factures, workflow médecin intégré,
              export multi-formats, calculs automatiques et bien plus !
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default BillingSimple