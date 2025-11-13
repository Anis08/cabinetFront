import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
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
  Eye,
  Download,
  Plus,
  Trash2,
  FileImage,
  Edit,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  CalendarX,
  TrendingUp as TrendingUpIcon,
  UserCog,
  Save,
  Mail,
  Phone,
  MapPin,
  StickyNote
} from 'lucide-react';
import BiologicalDataSection from '../components/Patients/BiologicalDataSection';
import OrdonnanceEditor from '../components/Ordonnances/OrdonnanceEditor';
import ComplementaryExamsSection from '../components/ComplementaryExams/ComplementaryExamsSection';
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

interface ExamFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadDate: string;
}

interface ComplementaryExam {
  id: string;
  type: string;
  description: string;
  date: string;
  files: ExamFile[];
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
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { logout, refresh } = useAuth();

  // Edit Patient States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: '',
    maladieChronique: ''
  });

  // Examens Complémentaires States
  const [showExamModal, setShowExamModal] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<ExamFile | null>(null);
  const [exams, setExams] = useState<ComplementaryExam[]>([]);
  const [currentExam, setCurrentExam] = useState<ComplementaryExam | null>(null);
  const [examForm, setExamForm] = useState({
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [expandedExams, setExpandedExams] = useState<{[key: string]: boolean}>({});

  // Ordonnances States
  const [showOrdonnanceEditor, setShowOrdonnanceEditor] = useState(false);
  const [ordonnances, setOrdonnances] = useState<any[]>([]); // Will be fetched from API
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false);
  const [selectedOrdonnance, setSelectedOrdonnance] = useState<any>(null);

  // Edit Note States
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const examTypes = [
    'Échographie rénale',
    'Scanner/IRM',
    'ECBU',
    'Biopsie rénale',
    "Bilan d'imagerie vasculaire"
  ];


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

  // Calculate consultation statistics
  const getConsultationStats = () => {
    if (!patient?.rendezVous) {
      return {
        total: 0,
        completed: 0,
        missed: 0
      };
    }

    const completed = patient.rendezVous.filter(rdv => rdv.status === 'Completed').length;
    const missed = patient.rendezVous.filter(rdv => rdv.status === 'Cancelled').length;
    
    return {
      total: patient.rendezVous.length,
      completed: completed,
      missed: missed
    };
  };

  // Open edit modal with patient data
  const handleOpenEditModal = () => {
    if (patient) {
      setEditForm({
        fullName: patient.fullName || '',
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
        gender: patient.gender || '',
        phoneNumber: patient.phoneNumber || '',
        email: patient.email || '',
        address: patient.address || '',
        maladieChronique: patient.maladieChronique || ''
      });
      setShowEditModal(true);
    }
  };

  // Update patient information
  const handleUpdatePatient = async () => {
    try {
      let response = await fetch(`${baseURL}/medecin/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
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
          response = await fetch(`${baseURL}/medecin/patients/${patientId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(editForm),
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        // Preserve existing patient data (especially rendezVous) while updating new fields
        setPatient(prevPatient => ({
          ...prevPatient,
          ...data.patient,
          rendezVous: prevPatient?.rendezVous || []
        }));
        setShowEditModal(false);
        alert('Informations du patient mises à jour avec succès !');
      } else {
        alert('Erreur lors de la mise à jour du patient.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la mise à jour.');
    }
  };

  // Delete patient
  const handleDeletePatient = async () => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le patient ${patient?.fullName} ?\n\nCette action est irréversible et supprimera toutes les données associées (consultations, examens, etc.).`
    );

    if (!confirmDelete) return;

    try {
      let response = await fetch(`${baseURL}/medecin/patients/${patientId}`, {
        method: 'DELETE',
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
          response = await fetch(`${baseURL}/medecin/patients/${patientId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          });
        }
      }

      if (response.ok) {
        alert('Patient supprimé avec succès.');
        navigate('/home/patients'); // Redirect to patients list
      } else {
        alert('Erreur lors de la suppression du patient.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la suppression.');
    }
  };



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

          // Check response status after potential token refresh
          if (!response.ok) {
            if (response.status === 404) {
              alert('Aucun patient trouvé.');
              return;
            }

            if (response.status === 500) {
              alert('Le serveur a rencontré une erreur. Veuillez réessayer plus tard.');
              return;
            }

            // Handle any other error status
            alert(`Erreur ${response.status}: Impossible de charger les données du patient.`);
            return;
          }
        }

        const data = await response.json();
        setPatient(data.patient);
        setNextAppointment(data.nextAppointment);
        setOrdonnances(data.ordonnances || []);
        setExams(data.exams || []);

      }
      catch (error) {
        console.error('Erreur lors du chargement du patient:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          alert('Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 4000.');
        } else {
          alert('Une erreur inattendue est survenue lors du chargement du patient.');
        }
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

  // Exam Management Functions
  const toggleExamExpansion = (examId: string) => {
    setExpandedExams(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };

  const handleAddExam = () => {
    setCurrentExam(null);
    setExamForm({
      type: examTypes[0],
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowExamModal(true);
  };

  const handleEditExam = (exam: ComplementaryExam) => {
    setCurrentExam(exam);
    setExamForm({
      type: exam.type,
      description: exam.description,
      date: exam.date
    });
    setShowExamModal(true);
  };

  const handleSaveExam = async () => {
    if (!examForm.type || !examForm.description || !examForm.date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (currentExam) {
      // Update existing exam
      try {
        const response = await fetch(`${baseURL}/medecin/complementary-exams/${currentExam.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            type: examForm.type,
            description: examForm.description,
            date: examForm.date,
          }),
        });

        const data = await response.json();

        if (response.ok && data.exam) {
          setExams(exams.map(exam =>
            exam.id === currentExam.id
              ? { ...data.exam }
              : exam
          ));
          alert('Examen complémentaire mis à jour avec succès !');
        } else {
          alert(data.message || 'Erreur lors de la mise à jour de l\'examen.');
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'examen:', error);
        alert('Une erreur est survenue lors de la mise à jour de l\'examen.');
      }
    } else {
      // Add new exam via backend
      try {
        const response = await fetch(`${baseURL}/medecin/complementary-exams/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            patientId: patient.id,
            type: examForm.type,
            description: examForm.description,
            date: examForm.date,
          }),
        });

        const data = await response.json();

        if (response.ok && data.exam) {
          setExams([...exams, { ...data.exam, files: data.exam.files || [] }]);
          alert('Examen complémentaire ajouté avec succès !');
        } else {
          alert(data.message || 'Erreur lors de l\'ajout de l\'examen.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'examen:', error);
        alert('Une erreur est survenue lors de l\'ajout de l\'examen.');
      }
    }

    setShowExamModal(false);
    setCurrentExam(null);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) return;

    try {
      const response = await fetch(`${baseURL}/medecin/complementary-exams/${examId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setExams(exams.filter(exam => exam.id !== examId));
        alert('Examen complémentaire supprimé avec succès !');
      } else {
        alert(data.message || 'Erreur lors de la suppression de l\'examen.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'examen:', error);
      alert('Une erreur est survenue lors de la suppression de l\'examen.');
    }
  };

  const handleFileUploadForExam = async (examId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/dicom'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.dcm')) {
      alert('Type de fichier non supporté. Veuillez uploader un PDF, une image (JPG, PNG) ou un fichier DICOM.');
      return;
    }

    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseURL}/medecin/complementary-exams/${examId}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.file) {
        

        setExams(exams.map(exam =>
          exam.id === examId
            ? { ...exam, files: [...exam.files, data.file] }
            : exam
        ));

        alert('Fichier uploadé avec succès !');
      } else {
        alert(data.message || 'Erreur lors de l\'upload du fichier.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      alert('Une erreur est survenue lors de l\'upload du fichier.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (examId: string, fileId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;

    try {
      const response = await fetch(`${baseURL}/medecin/complementary-exams/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setExams(exams.map(exam =>
          exam.id === examId
            ? { ...exam, files: exam.files.filter(f => f.id !== fileId) }
            : exam
        ));
        alert('Fichier supprimé avec succès !');
      } else {
        alert(data.message || 'Erreur lors de la suppression du fichier.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      alert('Une erreur est survenue lors de la suppression du fichier.');
    }
  };

  const handlePreviewFile = (file: ExamFile) => {
    const link = document.createElement('a');
    link.href = `https://drive.google.com/file/d/${file.fileUrl}/view`;
    link.download =  file.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFile = (file: ExamFile) => {
    const link = document.createElement('a');
    link.href = `https://drive.google.com/file/d/${file.fileUrl}/view`;
    link.download =  file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Edit Note Functions
  const handleStartEditNote = (rdv: any) => {
    setEditingNoteId(rdv._id || rdv.id);
    setEditNoteText(rdv.note || '');
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  const handleSaveNote = async (rendezVousId: string) => {
    if (!editNoteText.trim()) {
      alert('La note ne peut pas être vide');
      return;
    }

    setSavingNote(true);
    try {
      let response = await fetch(`${baseURL}/medecin/rendez-vous/${rendezVousId}/note`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ note: editNoteText }),
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
          response = await fetch(`${baseURL}/medecin/rendez-vous/${rendezVousId}/note`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ note: editNoteText }),
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        // Update the patient state with the new note
        setPatient(prevPatient => {
          if (!prevPatient) return prevPatient;
          return {
            ...prevPatient,
            rendezVous: prevPatient.rendezVous.map(rdv => 
              (rdv._id || rdv.id) === rendezVousId 
                ? { ...rdv, note: editNoteText }
                : rdv
            )
          };
        });
        setEditingNoteId(null);
        setEditNoteText('');
        alert('Note modifiée avec succès !');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de la modification de la note.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la modification de la note.');
    } finally {
      setSavingNote(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  // Ordonnance Management Functions
  const handleViewOrdonnance = (ordonnance: any) => {
    setSelectedOrdonnance(ordonnance);
    setShowOrdonnanceModal(true);
  };

  const handleDownloadOrdonnancePDF = async (ordonnance: any) => {
    try {
      // Utiliser l'utilitaire d'export PDF existant
      const { exportPrescriptionToPDF, generatePrescriptionPDF } = await import('../utils/pdfExport');
      
      const prescriptionData = {
        patientId: patient._id || patient.id,
        patientName: patient.fullName,
        date: ordonnance.date || new Date().toISOString(),
        medicaments: ordonnance.medicaments,
        observations: ordonnance.observations || ordonnance.note || '',
        template: ordonnance.template || {}
      };

      const result = await generatePrescriptionPDF(prescriptionData);
      
      if (result.success) {
        alert(`PDF téléchargé avec succès: ${result.filename}`);
      } else {
        alert(`Erreur lors du téléchargement: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
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
                    <div className="flex items-center gap-4 flex-wrap mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{patient?.maladieChronique || 'Non renseigné'}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">{patient?.email || 'Non renseigné'}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{patient?.phoneNumber || 'Non renseigné'}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="font-medium">{patient?.address || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleOpenEditModal}>
                      <UserCog className="w-4 h-4" />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDeletePatient}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
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

        {/* Consultation Statistics */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Consultations */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <CalendarCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Total Consultations</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {getConsultationStats().total}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Consultations */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Consultations Terminées</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {getConsultationStats().completed}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Missed Appointments */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                      <CalendarX className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-1">Rendez-vous Manqués</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {getConsultationStats().missed}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        // Find systolique and diastolique
                        const systolique = payload.find(p => p.dataKey === 'paSystolique');
                        const diastolique = payload.find(p => p.dataKey === 'paDiastolique');
                        return (
                          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>
                              {new Date(label).toLocaleDateString('fr-FR')}
                            </div>
                            {systolique && (
                              <div style={{ color: '#ef4444', fontWeight: 500 }}>
                                Systolique: {systolique.value} mmHg
                              </div>
                            )}
                            {diastolique && (
                              <div style={{ color: '#f97316', fontWeight: 500 }}>
                                Diastolique: {diastolique.value} mmHg
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
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

        {/* Biological Data Section - Purple Theme with Tables */}
        <BiologicalDataSection patientId={patientId} />

        {/* Spacing between sections */}
        <div className="mb-12"></div>

        {/* Notes des Rendez-vous Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header with Green gradient */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Notes des Rendez-vous</h3>
            </div>

            {/* Content Area */}
            {patient?.rendezVous && patient.rendezVous.filter(rdv => rdv.note && rdv.note.trim() !== '').length > 0 ? (
              <div className="divide-y divide-gray-200">
                {[...patient.rendezVous]
                  .filter(rdv => rdv.note && rdv.note.trim() !== '')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((rdv, index) => (
                    <div key={rdv._id || index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Date and Status */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-700">
                                {new Date(rdv.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            {rdv.status && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rdv.status === 'Terminé' 
                                  ? 'bg-green-100 text-green-700'
                                  : rdv.status === 'En cours'
                                  ? 'bg-blue-100 text-blue-700'
                                  : rdv.status === 'En attente'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {rdv.status}
                              </span>
                            )}
                          </div>

                          {/* Note Content */}
                          {editingNoteId === (rdv._id || rdv.id) ? (
                            <div className="space-y-3">
                              <textarea
                                value={editNoteText}
                                onChange={(e) => setEditNoteText(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                placeholder="Modifier la note..."
                                disabled={savingNote}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveNote(rdv._id || rdv.id)}
                                  disabled={savingNote}
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  <Save className="w-4 h-4" />
                                  {savingNote ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                                <button
                                  onClick={handleCancelEditNote}
                                  disabled={savingNote}
                                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {rdv.note}
                              </p>
                            </div>
                          )}

                          {/* Vital Signs if available */}
                          {(rdv.poids || rdv.paSystolique || rdv.pulse) && (
                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                              {rdv.poids && (
                                <div className="flex items-center gap-1">
                                  <Scale className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{rdv.poids} kg</span>
                                </div>
                              )}
                              {rdv.paSystolique && rdv.paDiastolique && (
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{rdv.paSystolique}/{rdv.paDiastolique} mmHg</span>
                                </div>
                              )}
                              {rdv.pulse && (
                                <div className="flex items-center gap-1">
                                  <Activity className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{rdv.pulse} bpm</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Edit Button */}
                        {!editingNoteId && (
                          <button
                            onClick={() => handleStartEditNote(rdv)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0"
                            title="Modifier la note"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune note disponible pour les rendez-vous</p>
              </div>
            )}
          </div>
        </div>

        {/* Spacing between sections */}
        <div className="mb-12"></div>

        {/* Ordonnances Médicales Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header with Purple gradient */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800">Ordonnances Médicales</h3>
              </div>
              <button
                onClick={() => setShowOrdonnanceEditor(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle ordonnance
              </button>
            </div>

            {/* Content Area */}
            {ordonnances && ordonnances.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {ordonnances.map((ord, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-700">
                              {new Date(ord.dateCreation).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {ord.medicaments?.map((med: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <div className="w-1 h-1 rounded-full bg-purple-500 mt-2"></div>
                              <div>
                                <span className="font-medium text-gray-800">
                                  {med.medicament.nom} {med.dosage}
                                </span>
                                <span className="text-gray-600"> - {med.posologie}</span>
                                {med.duree && <span className="text-gray-500"> pendant {med.duree}</span>}
                              </div>
                            </div>
                          ))}
                        </div>

                        {ord.note && (
                          <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                            <p className="text-sm text-gray-700">{ord.note}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrdonnance(ord)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir l'ordonnance"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadOrdonnancePDF(ord)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune ordonnance disponible</p>
                <button
                  onClick={() => setShowOrdonnanceEditor(true)}
                  className="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Créer la première ordonnance
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Spacing between sections */}
        <div className="mb-12"></div>

        {/* NEW: Examens Complémentaires Section - Modern Component-based Design with API Integration */}
        <ComplementaryExamsSection patientId={patientId} />

        {/* OLD: Examens Complémentaires Section - Simple Design (TO BE REMOVED) */}
        {/* Kept temporarily for reference - can be safely deleted after testing new component */}
        {false && (<div>
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Simple Header with Orange gradient */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Examens Complémentaires</h3>
              </div>
              <button
                onClick={handleAddExam}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvel examen
              </button>
            </div>

            {/* Content Area with Accordion */}
            {exams.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {exams.map((exam) => (
                  <div key={exam.id} className="bg-white">
                    {/* Exam Header (always visible) */}
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Toggle button */}
                        <button
                          onClick={() => toggleExamExpansion(exam.id)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title={expandedExams[exam.id] ? "Masquer les détails" : "Afficher les détails"}
                        >
                          {expandedExams[exam.id] ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>

                        {/* Exam info */}
                        <div className="flex items-center gap-3 flex-1">
                          <h4 className="font-semibold text-gray-800">{exam.type}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(exam.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditExam(exam)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content (conditional) */}
                    {expandedExams[exam.id] && (
                      <div className="px-6 pb-6">
                        {/* Description */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Description:</p>
                          <p className="text-sm text-gray-600">{exam.description}</p>
                        </div>

                        {/* Files Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700 flex items-center">
                              <FileImage className="w-4 h-4 mr-2 text-orange-500" />
                              Fichiers associés ({exam.files.length})
                            </h4>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                                onChange={(e) => handleFileUploadForExam(exam.id, e)}
                                disabled={uploadingFile}
                              />
                              <span className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                <Upload className="w-4 h-4" />
                                <span>{uploadingFile ? 'Upload...' : 'Ajouter'}</span>
                              </span>
                            </label>
                          </div>

                          {exam.files.length > 0 ? (
                            <div className="overflow-x-auto bg-gray-50 rounded-lg">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fichier</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Taille</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {exam.files.map((file) => (
                                    <tr key={file.id} className="border-b border-gray-100 hover:bg-white transition-colors">
                                      <td className="py-3 px-4 text-sm">
                                        <div className="flex items-center gap-2">
                                          {getFileIcon(file?.fileType)}
                                          <span className="font-medium text-gray-800 truncate" title={file.fileName}>
                                            {file?.fileName}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-600">
                                        {formatFileSize(file?.fileSize)}
                                      </td>
                                      <td className="py-3 px-4 text-sm text-gray-600">
                                        {new Date(file.uploadDate).toLocaleDateString('fr-FR')}
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handlePreviewFile(file)}
                                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                                            title="Voir"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDownloadFile(file)}
                                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                            title="Télécharger"
                                          >
                                            <Download className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteFile(exam.id, file.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Supprimer"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">Aucun fichier associé</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <FileImage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Aucun examen complémentaire</p>
                <p className="text-sm">Cliquez sur "Nouvel examen" pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Exam Modal - Simple Design */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowExamModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Simple Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                {currentExam ? 'Modifier l\'examen' : 'Nouvel examen complémentaire'}
              </h3>
              <button
                onClick={() => setShowExamModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Simple Modal Content */}
            <div className="p-6 space-y-6">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type d'examen *
                </label>
                <select
                  value={examForm.type}
                  onChange={(e) => setExamForm({ ...examForm, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  {examTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date de l'examen *
                </label>
                <input
                  type="date"
                  value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description / Résultats *
                </label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez les résultats de l'examen, observations importantes, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <p className="text-sm text-gray-500 italic">
                * Champs obligatoires. Vous pourrez ajouter des fichiers après la création de l'examen.
              </p>
            </div>

            {/* Simple Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 px-6 pb-6 border-t border-gray-200">
              <button
                onClick={() => setShowExamModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveExam}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {currentExam ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal - Simple Design */}
      {showFilePreview && selectedPreviewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowFilePreview(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Simple Modal Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center truncate">
                <Eye className="w-5 h-5 mr-3 text-orange-500" />
                <span className="truncate">{selectedPreviewFile.fileName}</span>
              </h2>
              <button
                onClick={() => setShowFilePreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedPreviewFile.fileType.includes('image') ? (
                <img
                  src={`https://drive.google.com/uc?id=${selectedPreviewFile.fileUrl}`}
                  alt={selectedPreviewFile.fileName}
                  className="w-full h-auto rounded-lg"
                />
              ) : selectedPreviewFile.fileType.includes('pdf') ? (
                <iframe
                  src={selectedPreviewFile.fileUrl}
                  className="w-full h-[600px] rounded-lg border"
                  title={selectedPreviewFile.fileName}
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Aperçu non disponible pour ce type de fichier
                  </p>
                  <button
                    onClick={() => handleDownloadFile(selectedPreviewFile)}
                    className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Download className="w-5 h-5" />
                    <span>Télécharger le fichier</span>
                  </button>
                </div>
              )}
            </div>

            {/* Simple Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Taille:</span> {formatFileSize(selectedPreviewFile.size)} •{' '}
                <span className="font-semibold">Date:</span> {new Date(selectedPreviewFile.uploadDate).toLocaleDateString('fr-FR')}
              </div>
              <button
                onClick={() => handleDownloadFile(selectedPreviewFile)}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Télécharger</span>
              </button>
            </div>
          </div>
        </div>
      )}
        </div>)}
        {/* END OLD CODE - Can be deleted after testing */}

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

      {/* Edit Patient Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <UserCog className="w-6 h-6 text-blue-600" />
                Modifier les informations du patient
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Prénom NOM"
                />
              </div>

              {/* Date of Birth and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sexe *
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                  </select>
                </div>
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Adresse complète"
                />
              </div>

              {/* Chronic Disease */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maladie chronique
                </label>
                <input
                  type="text"
                  value={editForm.maladieChronique}
                  onChange={(e) => setEditForm({ ...editForm, maladieChronique: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Hypertension artérielle, Diabète..."
                />
              </div>

              <p className="text-sm text-gray-500 italic">
                * Champs obligatoires
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 px-6 pb-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdatePatient}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ordonnance View Modal */}
      {showOrdonnanceModal && selectedOrdonnance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowOrdonnanceModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Ordonnance #{selectedOrdonnance.numero || selectedOrdonnance._id?.slice(-6)}
              </h2>
              <button
                onClick={() => setShowOrdonnanceModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Patient Info */}
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Patient</h3>
                <p className="text-gray-700 font-medium">{patient?.fullName}</p>
                <p className="text-sm text-gray-600">
                  {patient?.dateOfBirth && `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} ans`}
                  {patient?.gender && ` • ${patient.gender}`}
                </p>
              </div>

              {/* Date et Médecin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Date de prescription</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedOrdonnance.date || selectedOrdonnance.dateCreation).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Médecin prescripteur</p>
                  <p className="font-semibold text-gray-800">
                    Dr. {JSON.parse(localStorage.getItem('name') || '""')}
                  </p>
                </div>
              </div>

              {/* Médicaments */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  💊 Médicaments prescrits
                </h3>
                <div className="space-y-4">
                  {selectedOrdonnance.medicaments?.map((med: any, idx: number) => (
                    <div key={idx} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {med.medicament.nom} {med.dosage}
                          </h4>
                          <p className="text-sm text-gray-600">{med.forme}</p>
                        </div>
                        <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-bold rounded-full">
                          #{idx + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-700">
                            Posologie: <span className="text-gray-900">{med.posologie}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-gray-700">
                            Durée: <span className="text-gray-900">{med.duree}</span>
                          </span>
                        </div>
                      </div>

                      {med.momentPrise && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-700">Moment: </span>
                          <span className="text-gray-900">{med.momentPrise}</span>
                        </div>
                      )}

                      {med.instructions && (
                        <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Instructions: </span>
                            {med.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observations */}
              {(selectedOrdonnance.note) && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">📝 Observations</h3>
                  <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedOrdonnance.note}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <button
                onClick={() => setShowOrdonnanceModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => handleDownloadOrdonnancePDF(selectedOrdonnance)}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ordonnance Editor Modal */}
      {showOrdonnanceEditor && patient && (
        <OrdonnanceEditor
          isOpen={showOrdonnanceEditor}
          onClose={() => setShowOrdonnanceEditor(false)}
          patient={patient}
          onSave={(ordonnance) => {
            // Add to ordonnances list
            setOrdonnances([ordonnance, ...ordonnances])
            setShowOrdonnanceEditor(false)
            alert('Ordonnance créée avec succès!')
          }}
        />
      )}
    </div>
  );
};

export default PatientProfile;
