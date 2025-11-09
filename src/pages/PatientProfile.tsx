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
  AlertTriangle
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Constantes Vitales</h2>
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
    </div>
  );
};

export default PatientProfile;
