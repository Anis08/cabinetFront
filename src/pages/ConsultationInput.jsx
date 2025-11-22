import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Clock,
  Activity,
  Heart,
  Scale,
  Droplet,
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { baseURL } from '../config';
import { useAuth } from '../store/AuthProvider';
import { useData } from '../store/DataProvider';

const ConsultationInput = () => {
  const { logout, refresh } = useAuth();
  const { todayAppointments, setTodayAppointments } = useData();
  
  // État pour le patient en consultation
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Formulaire de constantes vitales et notes
  const [consultationForm, setConsultationForm] = useState({
    // Constantes vitales
    paSystolique: '',
    paDiastolique: '',
    poids: '',
    imc: '',
    pcm: '',
    pulse: '',
    // Informations de consultation
    note: '',
    paye: ''
  });

  // Récupérer le patient en consultation en temps réel
  useEffect(() => {
    const fetchCurrentPatient = async () => {
      if (!todayAppointments) {
        await loadTodayAppointments();
        return;
      }
      
      // Trouver le patient en consultation (state: 'In consultation')
      const inConsultation = todayAppointments.find(
        (apt) => apt.state === 'In consultation'
      );
      
      if (inConsultation) {
        setCurrentPatient(inConsultation);
        setErrorMessage('');
      } else {
        setCurrentPatient(null);
        setErrorMessage('Aucun patient en consultation actuellement');
      }
    };

    fetchCurrentPatient();

    // Polling toutes les 5 secondes pour mettre à jour
    const interval = setInterval(fetchCurrentPatient, 5000);

    return () => clearInterval(interval);
  }, [todayAppointments]);

  // Charger les rendez-vous du jour
  const loadTodayAppointments = async () => {
    setLoading(true);
    try {
      let response = await fetch(`${baseURL}/medecin/today-appointments`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        if (response.status === 401) {
          const refreshResponse = await refresh();
          if (!refreshResponse) {
            logout();
            return;
          }
          response = await fetch(`${baseURL}/medecin/today-appointments`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setTodayAppointments(data.todayAppointments);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      setErrorMessage('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  // Calculer l'IMC automatiquement
  useEffect(() => {
    const { poids } = consultationForm;
    const taille = currentPatient?.patient?.taille;
    
    if (poids && taille && poids > 0 && taille > 0) {
      const tailleM = taille / 100; // Convertir cm en m
      const imc = (parseFloat(poids) / (tailleM * tailleM)).toFixed(1);
      setConsultationForm(prev => ({
        ...prev,
        imc: imc
      }));
    }
  }, [consultationForm.poids, currentPatient?.patient?.taille]);

  // Gérer les changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConsultationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumettre les données de consultation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPatient) {
      setErrorMessage('Aucun patient en consultation');
      return;
    }

    // Validation: au moins le paiement doit être renseigné
    if (!consultationForm.paye || isNaN(Number(consultationForm.paye))) {
      setErrorMessage('Le montant payé est obligatoire et doit être un nombre valide');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const requestData = {
        rendezVousId: currentPatient.id,
        paye: Number(consultationForm.paye),
        note: consultationForm.note || null,
        poids: consultationForm.poids ? parseFloat(consultationForm.poids) : null,
        pcm: consultationForm.pcm ? parseFloat(consultationForm.pcm) : null,
        imc: consultationForm.imc ? parseFloat(consultationForm.imc) : null,
        pulse: consultationForm.pulse ? parseInt(consultationForm.pulse) : null,
        paSystolique: consultationForm.paSystolique ? parseFloat(consultationForm.paSystolique) : null,
        paDiastolique: consultationForm.paDiastolique ? parseFloat(consultationForm.paDiastolique) : null,
        prochainRdv: null
      };

      let response = await fetch(`${baseURL}/medecin/finish-consultation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return;
        }
        if (response.status === 401) {
          const refreshResponse = await refresh();
          if (!refreshResponse) {
            logout();
            return;
          }
          response = await fetch(`${baseURL}/medecin/finish-consultation`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestData),
          });
        }

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde');
        }
      }

      const data = await response.json();
      
      // Mise à jour de la liste des rendez-vous
      setTodayAppointments(prev =>
        prev.map(apt =>
          apt.id === currentPatient.id
            ? { ...apt, state: 'Completed' }
            : apt
        )
      );

      // Réinitialiser le formulaire
      setConsultationForm({
        paSystolique: '',
        paDiastolique: '',
        poids: '',
        imc: '',
        pcm: '',
        pulse: '',
        note: '',
        paye: ''
      });

      setSuccessMessage('✅ Consultation enregistrée avec succès !');
      setCurrentPatient(null);

      // Masquer le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Erreur:', error);
      setErrorMessage('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Calculer le temps écoulé depuis le début de la consultation
  const getConsultationDuration = () => {
    if (!currentPatient?.startTime) return 'N/A';
    
    const start = new Date(currentPatient.startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    return `${diffMins} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                Saisie Consultation
              </h1>
              <p className="text-gray-600 mt-1">
                Interface rapide pour enregistrer les informations de consultation
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {new Date().toLocaleTimeString('fr-FR')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Messages d'alerte */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Informations du patient en consultation */}
        {currentPatient ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
          >
            {/* En-tête patient */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {currentPatient.patient.fullName}
                    </h2>
                    <p className="text-blue-100">
                      {currentPatient.patient.age} ans • {currentPatient.patient.gender}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Durée consultation</p>
                  <p className="text-2xl font-bold">{getConsultationDuration()}</p>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Téléphone</p>
                  <p className="font-medium text-gray-900">{currentPatient.patient.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Taille</p>
                  <p className="font-medium text-gray-900">
                    {currentPatient.patient.taille ? `${currentPatient.patient.taille} cm` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Maladie chronique</p>
                  <p className="font-medium text-gray-900">
                    {currentPatient.patient.maladieChronique || 'Aucune'}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Constantes Vitales */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Constantes Vitales
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pression Artérielle */}
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Pression Artérielle (mmHg)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        name="paSystolique"
                        value={consultationForm.paSystolique}
                        onChange={handleInputChange}
                        placeholder="Systolique"
                        step="0.1"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        name="paDiastolique"
                        value={consultationForm.paDiastolique}
                        onChange={handleInputChange}
                        placeholder="Diastolique"
                        step="0.1"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Rythme Cardiaque */}
                  <div className="bg-pink-50 border border-pink-100 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-pink-500" />
                      Rythme Cardiaque (bpm)
                    </label>
                    <input
                      type="number"
                      name="pulse"
                      value={consultationForm.pulse}
                      onChange={handleInputChange}
                      placeholder="Ex: 72"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Poids */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      name="poids"
                      value={consultationForm.poids}
                      onChange={handleInputChange}
                      placeholder="Ex: 70.5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* IMC (auto-calculé) */}
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-500" />
                      IMC (kg/m²) {consultationForm.imc && '✓ Auto-calculé'}
                    </label>
                    <input
                      type="number"
                      name="imc"
                      value={consultationForm.imc}
                      onChange={handleInputChange}
                      placeholder="Auto ou manuel"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50"
                    />
                  </div>

                  {/* PCM */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-500" />
                      PCM (kg)
                    </label>
                    <input
                      type="number"
                      name="pcm"
                      value={consultationForm.pcm}
                      onChange={handleInputChange}
                      placeholder="Ex: 65"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Notes médicales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Notes médicales
                </label>
                <textarea
                  name="note"
                  value={consultationForm.note}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Observations, diagnostic, recommandations..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Paiement (obligatoire) */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-green-500" />
                  Montant payé (DA) *
                </label>
                <input
                  type="number"
                  name="paye"
                  value={consultationForm.paye}
                  onChange={handleInputChange}
                  placeholder="Ex: 2000"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                />
                <p className="text-xs text-gray-500 mt-1">* Champ obligatoire</p>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setConsultationForm({
                      paSystolique: '',
                      paDiastolique: '',
                      poids: '',
                      imc: '',
                      pcm: '',
                      pulse: '',
                      note: '',
                      paye: ''
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Enregistrer la consultation
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aucun patient en consultation
            </h3>
            <p className="text-gray-600">
              Commencez une consultation depuis la file d'attente pour saisir les informations ici.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ConsultationInput;
