import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Eye, Edit, Flag, Filter, X, ChevronDown } from 'lucide-react'
import { baseURL } from "../config"
import { useAuth } from '../store/AuthProvider'
import { useData } from '../store/DataProvider' 
import PatientsList from '../components/Patients/PatientsList'
import { useNavigate } from "react-router-dom";


const PatientsSimple = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    gender: '',
    ageMin: '',
    ageMax: '',
    dateCreationStart: '',
    dateCreationEnd: '',
    maladie: '',
    wilaya: '',
    phoneNumber: ''
  })
  
  const { logout, refresh } = useAuth();
  const { patients, setPatients, averageAge, newPatientsThisMonth, patientsViewedThisWeek, 
    setAverageAge, setNewPatientsThisMonth, setPatientsViewedThisWeek } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);
  const [newPatientFormData, setNewPatientFormData] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    poids: '',
    taille: '',
    dateOfBirth: '',
    bio: '',
    maladieChronique: ''
  });

  // Données mockées simples
  const mockPatients = [
    {
      id: 1,
      nom: 'Dubois',
      prenom: 'Marie',
      age: 45,
      phone: '06 12 34 56 78',
      maladie: 'Hypertension',
      derniere_visite: '2025-08-20'
    },
    {
      id: 2,
      nom: 'Martin',
      prenom: 'Jean',
      age: 32,
      phone: '06 87 65 43 21',
      maladie: 'Diabète',
      derniere_visite: '2025-08-22'
    },
    {
      id: 3,
      nom: 'Bernard',
      prenom: 'Sophie',
      age: 58,
      phone: '06 55 44 33 22',
      maladie: 'Migraine',
      derniere_visite: '2025-08-21'
    },
    {
      id: 4,
      nom: 'Moreau',
      prenom: 'Pierre',
      age: 67,
      phone: '06 11 22 33 44',
      maladie: 'Arthrose',
      derniere_visite: '2025-08-19'
    }
  ]

  useEffect(() => {
    const getPatients = async () => {
      if(patients) return;
      try {
      let response = await fetch(`${baseURL}/medecin/list-patients`, {
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


          response = await fetch(`${baseURL}/medecin/list-patients`, {
            method: 'GET',            
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          });

        }

        if (response.status === 404) {

          alert('Aucun patient trouvé.');
          return;
        }



        if (response.status === 500) {

          alert('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.');
          return;
        }
      }

      const data = await response.json();

      setPatients(data.patients);
      setAverageAge(data.averageAge);
      setNewPatientsThisMonth(data.newPatientsThisMonth);
      setPatientsViewedThisWeek(data.patientsViewedThisWeek);
    }
    catch (error) {
      return { error: 'Une erreur est survenue lors de la création du patient.' }
    }
    }

    getPatients();
  }, [])

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Advanced filtering logic
  const filteredPatients = patients ? patients.filter(patient => {
    // Search term filter (name)
    const matchesSearch = patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Gender filter
    const matchesGender = !filters.gender || patient.gender === filters.gender
    
    // Age filter
    const age = calculateAge(patient.dateOfBirth)
    const matchesAgeMin = !filters.ageMin || age >= parseInt(filters.ageMin)
    const matchesAgeMax = !filters.ageMax || age <= parseInt(filters.ageMax)
    
    // Date creation filter
    const createdAt = patient.createdAt ? new Date(patient.createdAt) : null
    const matchesDateStart = !filters.dateCreationStart || !createdAt || 
      createdAt >= new Date(filters.dateCreationStart)
    const matchesDateEnd = !filters.dateCreationEnd || !createdAt || 
      createdAt <= new Date(filters.dateCreationEnd + 'T23:59:59')
    
    // Maladie filter
    const matchesMaladie = !filters.maladie || 
      (patient.maladieChronique && patient.maladieChronique.toLowerCase().includes(filters.maladie.toLowerCase()))
    
    // Wilaya filter
    const matchesWilaya = !filters.wilaya || 
      (patient.address && patient.address.toLowerCase().includes(filters.wilaya.toLowerCase()))
    
    // Phone number filter
    const matchesPhone = !filters.phoneNumber || 
      (patient.phoneNumber && patient.phoneNumber.includes(filters.phoneNumber))
    
    return matchesSearch && matchesGender && matchesAgeMin && matchesAgeMax && 
           matchesDateStart && matchesDateEnd && matchesMaladie && matchesWilaya && matchesPhone
  }) : []

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      gender: '',
      ageMin: '',
      ageMax: '',
      dateCreationStart: '',
      dateCreationEnd: '',
      maladie: '',
      wilaya: '',
      phoneNumber: ''
    })
    setSearchTerm('')
  }

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm !== ''

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPatientFormData((prev) => ({ ...prev, [name]: value }));
  };

  const NewPatient = async () => {
    setIsOpen(false);
    const patientAge = new Date().getFullYear() - new Date(newPatientFormData.dateOfBirth).getFullYear();
    setNewPatientFormData({
    fullName: '',
    phoneNumber: '',
    gender: '',
    poids: '',
    taille: '',
    dateOfBirth: '',
    bio: '',
    maladieChronique: ''
  })
    const { fullName, phoneNumber, gender, poids, taille, dateOfBirth, bio, maladieChronique } = newPatientFormData;
    if (!fullName || !phoneNumber || !gender || !dateOfBirth || !bio || !maladieChronique) {
      return { error: 'Tous les champs sont obligatoires.' }
    }

    try {
      let response = await fetch(`${baseURL}/medecin/create-patient`, {
        method: 'POST',
        body: JSON.stringify({
          fullName, phoneNumber, gender, poids, taille, dateOfBirth, bio, maladieChronique
        }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json",
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


          response = await fetch(`${baseURL}/medecin/create-patient`, {
            method: 'POST',
            body: JSON.stringify({
              fullName, phoneNumber, gender, poids, taille, dateOfBirth, bio, maladieChronique
            }),
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              "Content-Type": "application/json",
            },
            credentials: 'include',
          });

        }

        if (response.status === 400) {

          alert('Requete invalide');
          return;
        }

        if (response.status === 409) {

          alert('Un patient avec ce numéro de téléphone existe dejà.');
          return;
        }



        if (response.status === 500) {

          alert('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.');
          return;
        }
      }

      const data = await response.json();

      setPatients(prev => [...prev, data.patient]);
      setAverageAge((prevAge) => {
        const totalAge = prevAge * patients.length + patientAge;
        return Math.round(totalAge / (patients.length + 1));
      });
      setNewPatientsThisMonth((prevCount) => {
        return prevCount + 1 ;
      });
    }
    catch (error) {
      return { error: 'Une erreur est survenue lors de la création du patient.' }
    }

  }

  return (
    <>
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
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Patients
              </h1>
              <p className="text-gray-600 mt-1">Gestion des patients du cabinet</p>
            </div>

            <button onClick={() => setIsOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau patient
            </button>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total patients</p>
                <p className="text-2xl font-semibold text-gray-900">{patients?.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Vus cette semaine</p>
                <p className="text-2xl font-semibold text-gray-900">{patientsViewedThisWeek}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Âge moyen</p>
                <p className="text-2xl font-semibold text-gray-900">{averageAge}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Nouveaux ce mois</p>
                <p className="text-2xl font-semibold text-gray-900">{newPatientsThisMonth}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche et Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4"
        >
          {/* Search and Filter Toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filtres
              {hasActiveFilters && (
                <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <X className="h-5 w-5" />
                Réinitialiser
              </button>
            )}
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sexe
                    </label>
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({...filters, gender: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tous</option>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge (Min)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 18"
                      value={filters.ageMin}
                      onChange={(e) => setFilters({...filters, ageMin: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge (Max)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 65"
                      value={filters.ageMax}
                      onChange={(e) => setFilters({...filters, ageMax: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="120"
                    />
                  </div>

                  {/* Maladie Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maladie chronique
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Diabète"
                      value={filters.maladie}
                      onChange={(e) => setFilters({...filters, maladie: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Date Creation Start */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date création (début)
                    </label>
                    <input
                      type="date"
                      value={filters.dateCreationStart}
                      onChange={(e) => setFilters({...filters, dateCreationStart: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Date Creation End */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date création (fin)
                    </label>
                    <input
                      type="date"
                      value={filters.dateCreationEnd}
                      onChange={(e) => setFilters({...filters, dateCreationEnd: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Wilaya Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wilaya
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Alger"
                      value={filters.wilaya}
                      onChange={(e) => setFilters({...filters, wilaya: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Phone Number Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 0555"
                      value={filters.phoneNumber}
                      onChange={(e) => setFilters({...filters, phoneNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <Filter className="h-4 w-4" />
                        <span className="font-medium">
                          {filteredPatients.length} patient(s) trouvé(s) sur {patients?.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Liste des patients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Liste des patients ({filteredPatients.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {patients ? filteredPatients.map((patient, index) => (
              <PatientsList key={patient.id} patient={patient} index={index} navigate={() => navigate(`/home/patient-profile/${patient.id}`)} />
            )) : null}
          </div>
        </motion.div>

        {/* Statut fonctionnalité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Module Patients - Version Simplifiée
              </h4>
              <p className="text-sm text-blue-800 mt-1">
                ✅ Navigation fonctionnelle • 📊 Données d'exemple • 🔍 Recherche active
              </p>
              <p className="text-xs text-blue-700 mt-2">
                La version complète inclut : profils étendus, upload de fichiers, onglets organisés,
                intégration avec la file d'attente et bien plus !
              </p>
            </div>
          </div>
        </motion.div>
      </div>


      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={dialogRef}
              tabIndex={-1}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 z-10 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 top-0 bg-white dark:bg-slate-800 pb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Enter Information
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={e => {
                e.preventDefault();
                NewPatient();
              }} className="space-y-3">
                <input
                  name="fullName"
                  type="text"
                  placeholder="Full name"
                  value={newPatientFormData.fullName}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  name="phoneNumber"
                  type="tel"
                  placeholder="Phone number"
                  maxLength={10}
                  value={newPatientFormData.phoneNumber}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3"
                  required
                />
                <select
                  name="gender"
                  value={newPatientFormData.gender}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3"
                >
                  <option value="">Select gender</option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
                <input
                  name="poids"
                  type="number"
                  placeholder="Poids (kg)"
                  value={newPatientFormData.poids}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3"
                />
                <input
                  name="taille"
                  type="number"
                  placeholder="Taille (cm)"
                  value={newPatientFormData.taille}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3"
                />
                <input
                  name="dateOfBirth"
                  type="date"
                  value={newPatientFormData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3"
                  required
                />
                <input
                  name="maladieChronique"
                  type="text"
                  placeholder="Maladie chronique"
                  value={newPatientFormData.maladieChronique}
                  onChange={handleChange}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <textarea
                  name="bio"
                  placeholder="Bio"
                  value={newPatientFormData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 px-3 min-h-[80px] resize-none"
                />

                <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white dark:bg-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  )
}

export default PatientsSimple