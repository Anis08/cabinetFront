import React from 'react'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from 'framer-motion'



// Import simple des pages essentielles
import LayoutSimple from './components/Layout/LayoutSimple'
import DashboardSimple from './pages/DashboardSimple'
import PatientsSimple from './pages/PatientsSimple'
import QueueSimple from './pages/QueueSimple'
import CalendarSimple from './pages/CalendarSimple'
import HistorySimple from './pages/HistorySimple'
import BillingSimple from './pages/BillingSimple'
import StatisticsSimple from './pages/StatisticsSimple'
import StatisticsAdvanced from './pages/StatisticsAdvanced'
import SignUp from './pages/signup';
import Login from './pages/login';
import AuthProvider from './store/AuthProvider';
import ProtectedRoute from './wrappers/ProtectedRoute';
import LoggedReirect from './wrappers/LoggedRedirect';
import DataProvider from './store/DataProvider';
import PatientProfile from './pages/PatientProfile';
import PublicWaitingLine from './pages/PublicWaitingLine';
import AdsManagement from './pages/AdsManagement';

// Page de test simple
const TestPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center mb-6">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">🏥 Cabinet Médical React</h1>
        <p className="text-xl text-gray-600 mb-6">Application v2.0 - Toutes fonctionnalités implémentées !</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Fonctionnalités v2</h3>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>• Profils patients étendus</li>
              <li>• Calendrier des rendez-vous</li>
              <li>• Auto-refresh temps réel</li>
              <li>• Système RBAC complet</li>
              <li>• Rappels WhatsApp</li>
              <li>• Module comptabilité</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">🚀 Technologies</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• React 18 + Hooks</li>
              <li>• Vite + Hot Reload</li>
              <li>• Tailwind CSS</li>
              <li>• Framer Motion</li>
              <li>• React Router</li>
              <li>• React Query</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔧 Si vous voyez cette page</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>L'application React fonctionne ! Quelques imports peuvent nécessiter des ajustements.</p>
            <div className="bg-yellow-100 rounded p-3 mt-3">
              <p className="font-medium">Solutions :</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Vérifiez la console pour les erreurs d'import</li>
                <li>Redémarrez avec <code className="bg-yellow-200 px-1 rounded">npm run dev</code></li>
                <li>Testez les pages individuellement</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Aller au Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  </div>
)

const queryClient = new QueryClient();


function AppSimple() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public route - No authentication required */}
          <Route path="/waiting-line" element={<PublicWaitingLine />} />
          
          <Route
            path="*"
            element={
              <AuthProvider>
                <Routes>
                  {/* Route de test */}
                  <Route path="/test" element={<TestPage />} />

                  {/* Parent route for all /home/* pages */}
                  <Route
                    path="/home/*"
                    element={
                      <ProtectedRoute>
                        <DataProvider>
                          <LayoutSimple>
                            {/* This will render the child routes below */}
                            <Routes>
                              <Route path="" element={<DashboardSimple />} />
                              <Route path="dashboard" element={<DashboardSimple />} />
                              <Route path="patients" element={<PatientsSimple />} />
                              <Route path="queue" element={<QueueSimple />} />
                              <Route path="calendar" element={<CalendarSimple />} />
                              <Route path="history" element={<HistorySimple />} />
                              <Route path="statistics" element={<StatisticsSimple />} />
                              <Route path="statistics-advanced" element={<StatisticsAdvanced />} />
                              <Route path="billing" element={<BillingSimple />} />
                              <Route path="ads-management" element={<AdsManagement />} />
                              <Route path="patient-profile/:patientId" element={<PatientProfile />} />
                              <Route path="*" element={<Navigate to="/home/dashboard" replace />} />
                            </Routes>
                          </LayoutSimple>
                        </DataProvider>
                      </ProtectedRoute>
                    }
                  />

                  <Route path='/signup' element={
                    <LoggedReirect>
                      <SignUp />
                    </LoggedReirect>
                  } />

                  <Route path='/login' element={
                    <LoggedReirect>
                      <Login />
                    </LoggedReirect>
                  } />

                  {/* Fallback vers dashboard */}
                  <Route path="*" element={<Navigate to="/home/dashboard" replace />} />
                </Routes>
              </AuthProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default AppSimple





