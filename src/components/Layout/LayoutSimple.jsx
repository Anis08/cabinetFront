import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart,
  LayoutDashboard, 
  Users, 
  Clock, 
  History, 
  BarChart3,
  Euro,
  Calendar,
  Settings,
  User,
  Monitor,
  FileText,
  Pill,
  Inbox,
  ClipboardEdit
} from 'lucide-react'

const LayoutSimple = ({ children }) => {
  const location = useLocation()
  const [ isOpen, setIsOpen ] = useState(false)

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/home/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/home/dashboard'
    },
    {
      name: 'Patients',
      href: '/home/patients',
      icon: Users,
      current: location.pathname === '/home/patients'
    },
    {
      name: 'File d\'attente',
      href: '/home/queue',
      icon: Clock,
      current: location.pathname === '/home/queue'
    },
    {
      name: 'Saisie Consultation',
      href: '/home/consultation-input',
      icon: ClipboardEdit,
      current: location.pathname === '/home/consultation-input'
    },
    {
      name: 'Historique',
      href: '/home/history',
      icon: History,
      current: location.pathname === '/home/history'
    },
    {
      name: 'Statistiques',
      href: '/home/statistics',
      icon: BarChart3,
      current: location.pathname === '/home/statistics'
    },
    {
      name: 'Comptabilité',
      href: '/home/billing',
      icon: Euro,
      current: location.pathname === '/home/billing'
    },
    {
      name: 'Calendrier',
      href: '/home/calendar',
      icon: Calendar,
      current: location.pathname === '/home/calendar'
    },
    {
      name: 'Ordonnances',
      href: '/home/ordonnances',
      icon: FileText,
      current: location.pathname === '/home/ordonnances'
    },
    {
      name: 'Médicaments',
      href: '/home/medicaments',
      icon: Pill,
      current: location.pathname === '/home/medicaments'
    },
    {
      name: 'Demandes Médicaments',
      href: '/home/medication-requests',
      icon: Inbox,
      current: location.pathname === '/home/medication-requests'
    },
    {
      name: 'Publicités',
      href: '/home/ads-management',
      icon: Monitor,
      current: location.pathname === '/home/ads-management'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div 
        className={`${isOpen ? 'w-64' : 'w-0'} overflow-hidden duration-300 transition-all flex lg:w-64 lg:flex-col`}
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 text-nowrap">Cabinet Médical</h1>
                <p className="text-xs text-gray-500 text-nowrap">Version 2.0</p>
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-nowrap group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Dr. {JSON.parse(localStorage.getItem('name'))}</p>
                <p className="text-xs text-gray-500">Médecin</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header 
          className="bg-white shadow-sm border-b border-gray-200"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-4">
                <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Cabinet ouvert</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  <Heart className="h-4 w-4" />
                  <span>Application v2.0 Active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default LayoutSimple