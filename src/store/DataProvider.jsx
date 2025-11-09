import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ModuleContext = createContext();

export const useData = () => {
  const context = useContext(ModuleContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default function DataProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ completedAppointments, setCompletedAppointments ] = useState(null);
  const [patients, setPatients] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState(null);
  const [ averagePaid, setAveragePaid ] = useState(null);
  const [ caDay, setCaDay ] = useState(null);
  const [ caWeek, setCaWeek ] = useState(null);
  const [ averageAge, setAverageAge ] = useState(null);
  const [ newPatientsThisMonth, setNewPatientsThisMonth ] = useState(null);
  const [ patientsViewedThisWeek, setPatientsViewedThisWeek ] = useState(null);

  return (
    <ModuleContext.Provider value={{ loading, userInfo, patients, todayAppointments, completedAppointments, averagePaid, caDay, caWeek, averageAge, newPatientsThisMonth, patientsViewedThisWeek, setAverageAge, setNewPatientsThisMonth, setPatientsViewedThisWeek, setAveragePaid, setCaDay, setCaWeek, setCompletedAppointments, setTodayAppointments, setPatients, setUserInfo, setLoading }}>
      {children}
    </ModuleContext.Provider>
  );
}
