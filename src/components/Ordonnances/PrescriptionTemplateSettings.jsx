import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Upload, Save, RotateCcw, Image as ImageIcon, Eye, EyeOff } from 'lucide-react'

const PrescriptionTemplateSettings = ({ template, onSave, onClose }) => {
  const [settings, setSettings] = useState({
    // Logo
    logo: template?.logo || '',
    
    // En-tête médecin
    doctorName: template?.doctorName || localStorage.getItem('name')?.replace(/"/g, '') || '',
    specialty: template?.specialty || 'Médecin Généraliste',
    address: template?.address || '',
    phone: template?.phone || '',
    email: template?.email || '',
    clinicName: template?.clinicName || '',
    
    // Disposition des champs patient
    patientLayout: template?.patientLayout || 'header', // 'header' ou 'body'
    
    // Visibilité des champs
    showPatientName: template?.showPatientName !== false,
    showPatientAge: template?.showPatientAge !== false,
    showPatientGender: template?.showPatientGender !== false,
    showPatientDateOfBirth: template?.showPatientDateOfBirth !== false,
    
    // Style
    headerColor: template?.headerColor || '#1e40af',
    accentColor: template?.accentColor || '#3b82f6'
  })

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    // Sauvegarder comme template par défaut
    localStorage.setItem('prescriptionTemplate', JSON.stringify(settings))
    onSave(settings)
    alert('Modèle d\'ordonnance enregistré avec succès!')
  }

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser le modèle par défaut?')) {
      localStorage.removeItem('prescriptionTemplate')
      setSettings({
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
      })
      alert('Modèle réinitialisé!')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Paramètres d'ordonnance
        </h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      {/* Logo Upload */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo de la clinique / cabinet
        </label>
        <div className="flex items-center gap-4">
          {settings.logo ? (
            <div className="relative w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden">
              <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
              <button
                onClick={() => setSettings({ ...settings, logo: '' })}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4" />
            {settings.logo ? 'Changer le logo' : 'Uploader un logo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Format recommandé: PNG ou JPG, max 2MB
        </p>
      </div>

      {/* Informations de l'en-tête */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-4">Informations de l'en-tête</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du médecin
            </label>
            <input
              type="text"
              value={settings.doctorName}
              onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
              placeholder="Dr. Nom Prénom"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spécialité
            </label>
            <input
              type="text"
              value={settings.specialty}
              onChange={(e) => setSettings({ ...settings, specialty: e.target.value })}
              placeholder="Médecin Généraliste"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la clinique / cabinet (optionnel)
            </label>
            <input
              type="text"
              value={settings.clinicName}
              onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
              placeholder="Cabinet Médical Al-Shifa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="123 Rue de la Santé, Alger"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+213 555 123 456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="medecin@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mise en page des informations patient */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-4">Disposition des informations patient</h4>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position du bloc patient
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setSettings({ ...settings, patientLayout: 'header' })}
              className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                settings.patientLayout === 'header'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-sm font-medium">En-tête</div>
              <div className="text-xs text-gray-600 mt-1">Après les infos médecin</div>
            </button>
            <button
              onClick={() => setSettings({ ...settings, patientLayout: 'body' })}
              className={`flex-1 p-3 border-2 rounded-lg transition-colors ${
                settings.patientLayout === 'body'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-sm font-medium">Corps</div>
              <div className="text-xs text-gray-600 mt-1">Avant la prescription</div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Champs à afficher
          </label>
          
          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPatientName}
              onChange={(e) => setSettings({ ...settings, showPatientName: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 flex-1">
              {settings.showPatientName ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Nom complet</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPatientAge}
              onChange={(e) => setSettings({ ...settings, showPatientAge: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 flex-1">
              {settings.showPatientAge ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Âge</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPatientGender}
              onChange={(e) => setSettings({ ...settings, showPatientGender: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 flex-1">
              {settings.showPatientGender ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Sexe</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showPatientDateOfBirth}
              onChange={(e) => setSettings({ ...settings, showPatientDateOfBirth: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 flex-1">
              {settings.showPatientDateOfBirth ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm">Date de naissance</span>
            </div>
          </label>
        </div>
      </div>

      {/* Couleurs */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-4">Couleurs du thème</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de l'en-tête
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.headerColor}
                onChange={(e) => setSettings({ ...settings, headerColor: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.headerColor}
                onChange={(e) => setSettings({ ...settings, headerColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur d'accent
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Save className="w-5 h-5" />
        Enregistrer comme modèle par défaut
      </button>
    </div>
  )
}

export default PrescriptionTemplateSettings
