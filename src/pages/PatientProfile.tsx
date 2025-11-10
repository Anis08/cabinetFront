import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import {
  Heart,
  Scale,
  Activity,
  TrendingUp,
  TrendingDown,
  Upload,
  FileText,
  Calendar,
  User,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Clock,
  Droplet,
  Thermometer,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  History,
  X,
  Eye
} from 'lucide-react';
import BiologicalDataSection from '../components/Patients/BiologicalDataSection';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { baseURL } from "../config"
import { useAuth } from '../store/AuthProvider'







// ============= TYPES =============
interface VitalSign {
  label: string;
  value: string;
  unit: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface BiologicalData {
  test: string;
  value: number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'warning' | 'danger';
  date: string;
}

// ============= DONNÉES SIMULÉES =============
const patientData = {
  id: "PAT-2024-001",
  firstName: "Marie",
  lastName: "DUBOIS",
  photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  age: 54,
  gender: "Féminin",
  mainPathology: "Hypertension artérielle",
  lastVisit: "2024-11-01",
  nextVisit: "2024-12-15",
  overallStatus: "warning" as const,
  doctor: "Dr. Martin LEROY"
};



const weightHistory = [
  { date: "Jan", poids: 75.2 },
  { date: "Fév", poids: 74.8 },
  { date: "Mar", poids: 74.1 },
  { date: "Avr", poids: 73.5 },
  { date: "Mai", poids: 73.8 },
  { date: "Juin", poids: 73.2 },
  { date: "Juil", poids: 72.9 },
  { date: "Août", poids: 72.5 },
];

const heartRateHistory = [
  { date: "Jan", bpm: 82 },
  { date: "Fév", bpm: 80 },
  { date: "Mar", bpm: 79 },
  { date: "Avr", bpm: 81 },
  { date: "Mai", bpm: 78 },
  { date: "Juin", bpm: 77 },
  { date: "Juil", bpm: 79 },
  { date: "Août", bpm: 78 },
];

const bloodPressureHistory = [
  { date: "Jan", systolique: 150, diastolique: 95 },
  { date: "Fév", systolique: 148, diastolique: 94 },
  { date: "Mar", systolique: 147, diastolique: 93 },
  { date: "Avr", systolique: 146, diastolique: 92 },
  { date: "Mai", systolique: 145, diastolique: 93 },
  { date: "Juin", systolique: 144, diastolique: 91 },
  { date: "Juil", systolique: 146, diastolique: 92 },
  { date: "Août", systolique: 145, diastolique: 92 },
];

const biologicalTests: BiologicalData[] = [
  {
    test: "Glycémie à jeun",
    value: 5.8,
    unit: "mmol/L",
    normalRange: "3.9 - 5.5",
    status: "warning",
    date: "2024-11-01"
  },
  {
    test: "Cholestérol total",
    value: 6.2,
    unit: "mmol/L",
    normalRange: "< 5.2",
    status: "danger",
    date: "2024-11-01"
  },
  {
    test: "HDL Cholestérol",
    value: 1.4,
    unit: "mmol/L",
    normalRange: "> 1.0",
    status: "normal",
    date: "2024-11-01"
  },
  {
    test: "LDL Cholestérol",
    value: 4.1,
    unit: "mmol/L",
    normalRange: "< 3.4",
    status: "danger",
    date: "2024-11-01"
  },
  {
    test: "Triglycérides",
    value: 1.8,
    unit: "mmol/L",
    normalRange: "< 1.7",
    status: "warning",
    date: "2024-11-01"
  },
  {
    test: "Hémoglobine",
    value: 13.2,
    unit: "g/dL",
    normalRange: "12.0 - 16.0",
    status: "normal",
    date: "2024-11-01"
  },
  {
    test: "Créatinine",
    value: 82,
    unit: "μmol/L",
    normalRange: "45 - 90",
    status: "normal",
    date: "2024-11-01"
  },
  {
    test: "TSH",
    value: 2.4,
    unit: "mUI/L",
    normalRange: "0.4 - 4.0",
    status: "normal",
    date: "2024-11-01"
  }
];


// ============= COMPOSANTS =============

// Card Component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Button Component
const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
}> = ({ children, variant = 'primary', className = '', onClick }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "border-2 border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-500"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Badge Component
const Badge: React.FC<{ status: 'normal' | 'warning' | 'danger' }> = ({ status }) => {
  const styles = {
    normal: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" />, label: 'Stable' },
    warning: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <AlertTriangle className="w-4 h-4" />, label: 'Surveillance' },
    danger: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4" />, label: 'Attention' }
  };

  const style = styles[status];

  return (
    <div className={`${style.bg} ${style.text} px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium`}>
      {style.icon}
      {style.label}
    </div>
  );
};

// Vital Sign Card Component
const VitalSignCard: React.FC<{ vital: VitalSign }> = ({ vital }) => {
  const isPositive = vital.change > 0;
  const changeColor = isPositive ? 'text-red-500' : 'text-green-500';
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${vital.color === 'text-red-500' ? 'from-red-50 to-red-100' : vital.color === 'text-blue-500' ? 'from-blue-50 to-blue-100' : vital.color === 'text-purple-500' ? 'from-purple-50 to-purple-100' : vital.color === 'text-indigo-500' ? 'from-indigo-50 to-indigo-100' : 'from-pink-50 to-pink-100'}`}>
              <div className={vital.color}>{vital.icon}</div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{vital.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {vital.value} <span className="text-sm font-normal text-gray-500">{vital.unit}</span>
              </p>
            </div>
          </div>
          {/*vital.change !== 0 && (
            <div className={`flex items-center gap-1 ${changeColor} text-sm font-semibold`}>
              <ChangeIcon className="w-4 h-4" />
              {Math.abs(vital.change)}%
            </div>
          )*/}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
const PatientProfile: React.FC = () => {

  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { logout, refresh } = useAuth();


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



  useEffect(() => {
    const getPatient = async () => {
      if (patient) return;
      try {
        let response = await fetch(`${baseURL}/medecin/profile-patient/${patientId}`, {
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


            response = await fetch(`${baseURL}/medecin/profile-patient/${patientId}`, {
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
        setPatient(data.patient);
        setNextAppointment(data.nextAppointment);


      }
      catch (error) {
        return { error: 'Une erreur est survenue lors de la création du patient.' }
      }
    }

    getPatient();
  }, [])


  const vitalSigns: VitalSign[] = [
    {
      label: "Pression Artérielle",
      value: (patient?.rendezVous[0]?.paSystolique && patient?.rendezVous[0]?.paDiastolique) ? `${patient?.rendezVous[0]?.paSystolique}/${patient?.rendezVous[0]?.paDiastolique}` : '-',
      unit: "mmHg",
      change: 3.2,
      icon: <Heart className="w-5 h-5" />,
      color: "text-red-500"
    },
    {
      label: "Poids",
      value: patient?.rendezVous[0]?.poids || '-',
      unit: "kg",
      change: -1.8,
      icon: <Scale className="w-5 h-5" />,
      color: "text-blue-500"
    },
    {
      label: "IMC",
      value: patient?.rendezVous[0]?.imc || '-',
      unit: "kg/m²",
      change: -0.5,
      icon: <Activity className="w-5 h-5" />,
      color: "text-purple-500"
    },
    {
      label: "PCM",
      value: patient?.rendezVous[0]?.pcm || '-',
      unit: "kg",
      change: 0,
      icon: <Scale className="w-5 h-5" />,
      color: "text-indigo-500"
    },
    {
      label: "Rythme Cardiaque",
      value: patient?.rendezVous[0]?.pulse || '-',
      unit: "bpm",
      change: 2.5,
      icon: <Activity className="w-5 h-5" />,
      color: "text-pink-500"
    }
  ];




  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      alert(`Fichier "${file.name}" sélectionné avec succès !`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">

      <div className=" p-8">
        {/* Patient Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-32"></div>
          <CardContent className="relative pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 ">
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">
                      {patient?.fullName}
                    </h1>
                    <p className="text-gray-500 mb-3">{getAgeFromDate(patient?.dateOfBirth)} ans • {patient?.gender}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{patient?.maladieChronique}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline">
                      <FileText className="w-4 h-4" />
                      Dossier complet
                    </Button>
                    <Button variant="primary">
                      <Calendar className="w-4 h-4" />
                      Nouvelle consultation
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Médecin traitant</p>
                    <p className="font-semibold text-gray-800">Dr. {JSON.parse(localStorage.getItem('name'))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dernière consultation</p>
                    <p className="font-semibold text-gray-800">{patient?.rendezVous.length > 0 ? new Date(patient?.rendezVous[0].date).toLocaleDateString('fr-FR') : 'Pas encore'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Prochain rendez-vous</p>
                    <p className="font-semibold text-gray-800">{new Date(nextAppointment?.date).toLocaleDateString('fr-FR') || 'Pas encore'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Constantes Vitales</h2>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              <History className="w-4 h-4" />
              <span>Voir l'Historique</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {vitalSigns.map((vital, index) => (
              <VitalSignCard key={index} vital={vital} />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weight Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-500" />
                Évolution du Poids (Kg)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={patient?.rendezVous ? [...patient.rendezVous].reverse() : []} >
                  <defs>
                    <linearGradient id="colorPoids" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" 
                  tickFormatter={(date) => {
                      const d = new Date(date);
                      const parts = d.toLocaleDateString('fr-FR').split('/');
                      parts[2] = parts[2].slice(-2); // Keep last 2 digits of year
                      return parts.join('/');
                    }}/>
                  <YAxis stroke="#6b7280" domain={([min, max]) => [Math.ceil(min - 5), Math.ceil(max + 5)]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelFormatter={(date) => {
                      const d = new Date(date);
                      return d.toLocaleDateString('fr-FR')
                    }}
                  />
                  <Area type="monotone" dataKey="poids" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPoids)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heart Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-500" />
                Rythme Cardiaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={patient?.rendezVous ? [...patient.rendezVous].reverse() : []} >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280"
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      const parts = d.toLocaleDateString('fr-FR').split('/');
                      parts[2] = parts[2].slice(-2); // Keep last 2 digits of year
                      return parts.join('/');
                    }}
                  />
                  <YAxis stroke="#6b7280" domain={([min, max]) => [Math.ceil(min - 5), Math.ceil(max + 5)]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelFormatter={(date) => {
                      const d = new Date(date);
                      return d.toLocaleDateString('fr-FR')
                    }}
                  />
                  <Line type="monotone" dataKey="pulse" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Blood Pressure Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Pression Artérielle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={patient?.rendezVous ? [...patient.rendezVous].reverse() : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280"
                  tickFormatter={(date) => {
                      const d = new Date(date);
                      const parts = d.toLocaleDateString('fr-FR').split('/');
                      parts[2] = parts[2].slice(-2); // Keep last 2 digits of year
                      return parts.join('/');
                    }} />
                  <YAxis stroke="#6b7280" domain={[80, 160]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelFormatter={(date) => {
                      const d = new Date(date);
                      return d.toLocaleDateString('fr-FR')
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="paSystolique" stroke="#ef4444" strokeWidth={2} name="Systolique" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="paDiastolique" stroke="#f97316" strokeWidth={2} name="Diastolique" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Biological Data Section - New Component */}
        <BiologicalDataSection patientId={patientId} />
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowHistoryModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <History className="w-6 h-6 mr-3" />
                Historique des Constantes Vitales
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {patient?.rendezVous && patient.rendezVous.length > 0 ? (
                <div className="space-y-4">
                  {[...patient.rendezVous].reverse().map((consultation, index) => {
                    const hasVitals = consultation.paSystolique || consultation.paDiastolique || 
                                     consultation.pulse || consultation.poids || 
                                     consultation.imc || consultation.pcm;

                    if (!hasVitals) return null;

                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                      >
                        {/* Date Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {new Date(consultation.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(consultation.date).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          {index === 0 && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                              Dernière consultation
                            </span>
                          )}
                        </div>

                        {/* Vital Signs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Blood Pressure */}
                          {(consultation.paSystolique || consultation.paDiastolique) && (
                            <div className="bg-white rounded-lg p-4 border border-red-100">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-red-50 rounded-lg">
                                  <Heart className="w-5 h-5 text-red-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Pression Artérielle</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {consultation.paSystolique}/{consultation.paDiastolique}
                                <span className="text-sm font-normal text-gray-500 ml-2">mmHg</span>
                              </p>
                            </div>
                          )}

                          {/* Heart Rate */}
                          {consultation.pulse && (
                            <div className="bg-white rounded-lg p-4 border border-pink-100">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-pink-50 rounded-lg">
                                  <Activity className="w-5 h-5 text-pink-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Rythme Cardiaque</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {consultation.pulse}
                                <span className="text-sm font-normal text-gray-500 ml-2">bpm</span>
                              </p>
                            </div>
                          )}

                          {/* Weight */}
                          {consultation.poids && (
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <Scale className="w-5 h-5 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Poids</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {consultation.poids}
                                <span className="text-sm font-normal text-gray-500 ml-2">kg</span>
                              </p>
                            </div>
                          )}

                          {/* BMI */}
                          {consultation.imc && (
                            <div className="bg-white rounded-lg p-4 border border-purple-100">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                  <Activity className="w-5 h-5 text-purple-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">IMC</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {consultation.imc}
                                <span className="text-sm font-normal text-gray-500 ml-2">kg/m²</span>
                              </p>
                            </div>
                          )}

                          {/* PCM */}
                          {consultation.pcm && (
                            <div className="bg-white rounded-lg p-4 border border-indigo-100">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                  <Scale className="w-5 h-5 text-indigo-500" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">PCM</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">
                                {consultation.pcm}
                                <span className="text-sm font-normal text-gray-500 ml-2">kg</span>
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Note if available */}
                        {consultation.note && (
                          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Note: </span>
                              {consultation.note}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Aucun historique disponible
                  </h3>
                  <p className="text-gray-500">
                    Les constantes vitales des consultations terminées apparaîtront ici.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
