import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Flame, Cloud, X, Calendar, DollarSign, Loader2, CheckCircle2, Save } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// --- ⚠️ IMPORTANTE: PEGA AQUÍ TUS DATOS DE FIREBASE ---
// Ve a tu consola de Firebase > Configuración del proyecto > General
// y copia los valores del objeto "firebaseConfig" aquí:
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

// --- INICIALIZACIÓN ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// ID único para guardar los datos en la base de datos
const appId = 'imperio-infernal-app-v1'; 

// --- COMPONENTE MODAL DE CARGA ---
const EntryModal = ({ isOpen, onClose, onSave, theme, title }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [periodType, setPeriodType] = useState('week'); 
  const [weekNumber, setWeekNumber] = useState(1);
  const [inputMode, setInputMode] = useState('daily'); 
  
  const [dailyValues, setDailyValues] = useState({
    Lunes: '', Martes: '', Miércoles: '', Jueves: '', Viernes: '', Sábado: '', Domingo: ''
  });
  
  const [totalValue, setTotalValue] = useState('');

  if (!isOpen) return null;

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const calculateCurrentTotal = () => {
    if (inputMode === 'total') {
      return parseFloat(totalValue) || 0;
    }
    return Object.values(dailyValues).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  };

  const handleSave = () => {
    const amount = calculateCurrentTotal();
    if (amount > 0) {
      const monthName = months[selectedMonth];
      let label = '';
      
      if (periodType === 'month') {
        label = `Mes Completo: ${monthName}`;
      } else {
        label = `${monthName} - Semana ${weekNumber}`;
      }

      onSave({ amount, label, details: inputMode === 'daily' ? dailyValues : null });
      
      setDailyValues({ Lunes: '', Martes: '', Miércoles: '', Jueves: '', Viernes: '', Sábado: '', Domingo: '' });
      setTotalValue('');
      onClose();
    }
  };

  const isBoss = theme === 'boss';
  const bgClass = isBoss ? 'bg-slate-900 border-red-800 text-red-100' : 'bg-white border-sky-200 text-slate-800';
  const headerClass = isBoss ? 'text-orange-500' : 'text-sky-600';
  const buttonClass = isBoss ? 'bg-orange-700 hover:bg-orange-600 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white';
  const inputClass = isBoss 
    ? 'bg-red-950/50 border-red-800 text-red-100 focus:border-orange-500' 
    : 'bg-white border-sky-200 text-slate-700 focus:border-sky-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-2xl border-2 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${bgClass}`}>
        <div className={`p-4 border-b flex justify-between items-center ${isBoss ? 'border-red-900 bg-red-950/30' : 'border-sky-100 bg-sky-50'}`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${headerClass}`}>
            {isBoss ? <Flame className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 transition-colors">
            <X className="w-6 h-6 opacity-60" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase opacity-70 mb-1">Mes</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className={`w-full p-2 rounded border outline-none ${inputClass}`}>
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase opacity-70 mb-1">Periodo</label>
              <div className="flex gap-2">
                <select value={periodType} onChange={(e) => setPeriodType(e.target.value)} className={`flex-1 p-2 rounded border outline-none ${inputClass}`}>
                  <option value="week">Semana</option>
                  <option value="month">Mes Entero</option>
                </select>
                {periodType === 'week' && (
                  <select value={weekNumber} onChange={(e) => setWeekNumber(Number(e.target.value))} className={`w-20 p-2 rounded border outline-none ${inputClass}`}>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mb-6 p-1 bg-black/10 rounded-lg">
             <button onClick={() => setInputMode('daily')} className={`flex-1 py-1.5 px-3 rounded-md text-sm font-bold transition-all ${inputMode === 'daily' ? (isBoss ? 'bg-orange-600 text-white shadow' : 'bg-sky-500 text-white shadow') : 'opacity-60 hover:opacity-100'}`}>Día por Día</button>
             <button onClick={() => setInputMode('total')} className={`flex-1 py-1.5 px-3 rounded-md text-sm font-bold transition-all ${inputMode === 'total' ? (isBoss ? 'bg-orange-600 text-white shadow' : 'bg-sky-500 text-white shadow') : 'opacity-60 hover:opacity-100'}`}>Monto Total</button>
          </div>
          {inputMode === 'total' ? (
             <div className="mb-6">
                <label className="block text-sm font-bold opacity-80 mb-2">Monto Total del Periodo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 font-bold text-lg">$</span>
                  <input type="number" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} className={`w-full pl-8 pr-4 py-3 text-xl font-bold rounded-lg border outline-none ${inputClass}`} placeholder="0" autoFocus />
                </div>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.keys(dailyValues).map((day) => (
                    <div key={day} className={day === 'Domingo' ? 'col-span-2' : ''}>
                        <label className="block text-xs font-bold opacity-60 mb-1">{day}</label>
                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50 text-xs">$</span>
                            <input type="number" value={dailyValues[day]} onChange={(e) => setDailyValues({...dailyValues, [day]: e.target.value})} className={`w-full pl-5 pr-2 py-1.5 text-sm rounded border outline-none ${inputClass}`} placeholder="0" />
                        </div>
                    </div>
                ))}
            </div>
          )}
          <div className={`p-4 rounded-xl flex justify-between items-center ${isBoss ? 'bg-orange-900/20 border border-orange-900/50' : 'bg-sky-50 border border-sky-100'}`}>
            <span className="text-sm font-medium opacity-80">Total a Cargar:</span>
            <span className={`text-2xl font-black ${isBoss ? 'text-orange-500' : 'text-sky-600'}`}>
                ${new Intl.NumberFormat('es-AR').format(calculateCurrentTotal())}
            </span>
          </div>
        </div>
        <div className={`p-4 border-t flex gap-3 ${isBoss ? 'border-red-900 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg font-bold border border-transparent hover:bg-black/5 opacity-70 hover:opacity-100 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={calculateCurrentTotal() <= 0} className={`flex-[2] py-2.5 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttonClass}`}>Confirmar Carga</button>
        </div>
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
const EarningsCalculator = () => {
  // --- ESTADOS ---
  const [user, setUser] = useState(null);
  const [bossEntries, setBossEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  // --- EFECTO 1: AUTENTICACIÓN ---
  useEffect(() => {
    // Intentar inicio de sesión anónimo estándar
    signInAnonymously(auth).catch((error) => {
      console.error("Error en autenticación anónima:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // --- EFECTO 2: SINCRONIZACIÓN CON FIRESTORE ---
  useEffect(() => {
    if (!user) return;

    // Referencia al documento único donde guardaremos todo
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'financials', 'data');

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBossEntries(data.bossEntries || []);
        setEmployees(data.employees || []);
      } else {
        // Si es la primera vez, inicializamos vacío
        setBossEntries([]);
        setEmployees([]);
      }
      setLoading(false);
      setSaving(false); // Cuando llega el snapshot, significa que se guardó
    }, (error) => {
        console.error("Error al leer datos (posible falta de permisos o configuración):", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- FUNCIÓN DE GUARDADO (Helper) ---
  const saveToFirestore = async (newBossEntries, newEmployees) => {
    if (!user) return;
    setSaving(true);
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'financials', 'data');
    
    try {
        await setDoc(docRef, {
            bossEntries: newBossEntries !== undefined ? newBossEntries : bossEntries,
            employees: newEmployees !== undefined ? newEmployees : employees
        }, { merge: true });
    } catch (e) {
        console.error("Error al guardar:", e);
        setSaving(false);
    }
  };

  // --- FUNCIÓN DE GUARDADO MANUAL (Botón "Guardar Todo") ---
  const handleManualSave = async () => {
    if (!user) return;
    setSaving(true);
    setManualSaveSuccess(false);
    
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'financials', 'data');
    try {
        await setDoc(docRef, {
            bossEntries: bossEntries,
            employees: employees
        }, { merge: true });
        
        setSaving(false);
        setManualSaveSuccess(true);
        setTimeout(() => setManualSaveSuccess(false), 3000);
    } catch (e) {
        console.error("Error al guardar manual:", e);
        setSaving(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  // --- CÁLCULOS ---
  const bossTotalGenerated = bossEntries.reduce((acc, entry) => acc + entry.amount, 0);

  const totalFromEmployees = employees.reduce((acc, emp) => {
    const totalGenerated = emp.entries.reduce((sum, entry) => sum + entry.amount, 0);
    const bossShare = totalGenerated * ((100 - emp.retentionPercent) / 100);
    return acc + bossShare;
  }, 0);

  const totalBossEarnings = bossTotalGenerated + totalFromEmployees;

  // --- GESTIÓN DE DATOS ---

  const handleBossSave = (entryData) => {
    const newEntry = { id: Date.now(), ...entryData };
    const newBossEntries = [newEntry, ...bossEntries];
    setBossEntries(newBossEntries); 
    saveToFirestore(newBossEntries, undefined);
  };

  const removeBossEntry = (entryId) => {
    const newBossEntries = bossEntries.filter(entry => entry.id !== entryId);
    setBossEntries(newBossEntries);
    saveToFirestore(newBossEntries, undefined);
  };

  const addEmployee = () => {
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    const newEmployee = { 
      id: newId, 
      name: `Ángel Trabajador ${newId}`, 
      entries: [], 
      retentionPercent: 55, 
      isWife: false 
    };
    const newEmployees = [...employees, newEmployee];
    setEmployees(newEmployees);
    saveToFirestore(undefined, newEmployees);
  };

  const removeEmployee = (id) => {
    const newEmployees = employees.filter(e => e.id !== id);
    setEmployees(newEmployees);
    saveToFirestore(undefined, newEmployees);
  };

  const updateEmployee = (id, field, value) => {
    const newEmployees = employees.map(e => {
      if (e.id === id) {
        if (field === 'isWife') {
            return { ...e, isWife: value, retentionPercent: value ? 0 : 55 };
        }
        return { ...e, [field]: value };
      }
      return e;
    });
    setEmployees(newEmployees);
    saveToFirestore(undefined, newEmployees);
  };

  const handleEmployeeSave = (empId, entryData) => {
    const newEmployees = employees.map(emp => {
      if (emp.id === empId) {
        const newEntry = { id: Date.now(), ...entryData };
        return { ...emp, entries: [newEntry, ...emp.entries] };
      }
      return emp;
    });
    setEmployees(newEmployees);
    saveToFirestore(undefined, newEmployees);
  };

  const removeEmployeeEntry = (empId, entryId) => {
    const newEmployees = employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, entries: emp.entries.filter(entry => entry.id !== entryId) };
      }
      return emp;
    });
    setEmployees(newEmployees);
    saveToFirestore(undefined, newEmployees);
  };

  // --- RENDER ---
  if (loading) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-500">
              <Flame className="w-12 h-12 animate-bounce mb-4" />
              <p className="font-bold text-xl animate-pulse">Abriendo las Puertas del Infierno...</p>
              <p className="text-sm text-red-800 mt-2">Conectando con el servidor...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 p-4 md:p-8 bg-gradient-to-b from-orange-900 via-red-950 to-black relative overflow-hidden">
      
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-600 rounded-full blur-[120px]"></div>
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600 rounded-full blur-[120px]"></div>
      </div>

      {/* Indicador de Estado de Guardado */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {manualSaveSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-green-500 text-white shadow-lg animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">¡Guardado Exitoso!</span>
            </div>
        )}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border transition-all ${saving ? 'bg-yellow-900/50 border-yellow-700 text-yellow-500' : 'bg-black/30 border-white/10 text-slate-300'}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-wider">{saving ? 'Sincronizando...' : 'En Línea'}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-orange-500 mb-2 flex items-center justify-center gap-3 drop-shadow-md">
            <Flame className="w-10 h-10 text-orange-600 fill-orange-500 animate-pulse" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
              IMPERIO INFERNAL
            </span>
            <Flame className="w-10 h-10 text-orange-600 fill-orange-500 animate-pulse" />
          </h1>
          <p className="text-red-200/80 italic mb-4">
            "Sistema de Tributos con Memoria Eterna"
          </p>

          <button 
            onClick={handleManualSave}
            disabled={saving}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-700 to-red-700 text-white rounded-full font-bold shadow-[0_0_20px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_rgba(234,88,12,0.8)] hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className={`w-5 h-5 ${saving ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
            {saving ? 'GUARDANDO EN EL SERVIDOR...' : 'GUARDAR TODO EL PROGRESO'}
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40"></div>
          </button>
        </header>

        {/* Resumen Superior - EL JEFE (DIABLO) */}
        <div className="flex justify-center mb-16 relative">
          <div className="bg-gradient-to-br from-gray-900 to-red-950 border-4 border-red-700 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)] p-6 w-full max-w-md relative">
            
            <div className="absolute -top-6 -left-4 text-6xl rotate-[-20deg]">😈</div>
            <div className="absolute -top-6 -right-4 text-6xl rotate-[20deg] transform scale-x-[-1]">😈</div>

            <div className="flex items-center justify-between mb-4 border-b border-red-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-900/50 p-3 rounded-full border border-red-600">
                    <span className="text-4xl">🔱</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-100">EL DIABLO (Tú)</h2>
                  <span className="text-xs text-orange-400 uppercase tracking-wider font-semibold">Tributo Acumulado</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-orange-500 drop-shadow-sm">
                  {formatMoney(totalBossEarnings)}
                </div>
                <div className="text-sm text-red-300">total en caja</div>
              </div>
            </div>

            <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-red-900/50">
              <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-red-200">
                    Historial de Ingresos
                    </label>
                    <button 
                        onClick={() => setActiveModal({ type: 'boss', id: null })}
                        className="bg-orange-700 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 shadow-md border border-orange-500"
                    >
                        <Plus className="w-4 h-4" /> Cargar Nuevo Ingreso
                    </button>
                </div>

                <div className="max-h-40 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                    {bossEntries.length === 0 && (
                        <div className="text-center py-4 border border-dashed border-red-900/50 rounded bg-red-950/20">
                            <p className="text-xs text-red-500/50">Sin registros guardados.</p>
                        </div>
                    )}
                    {bossEntries.map((entry) => (
                        <div key={entry.id} className="flex justify-between items-center bg-red-900/20 px-3 py-2 rounded border border-red-900/30 text-sm group hover:bg-red-900/30 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-red-200 font-bold">{entry.label}</span>
                                {entry.details && <span className="text-[10px] text-red-400 opacity-70">Carga detallada</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-orange-400 font-mono font-bold">{formatMoney(entry.amount)}</span>
                                <button onClick={() => removeBossEntry(entry.id)} className="text-red-500 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between text-xs text-red-400 mt-3 pt-2 border-t border-red-900/50">
                  <span>Tu producción: {formatMoney(bossTotalGenerated)}</span>
                  <span>De ángeles: {formatMoney(totalFromEmployees)}</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-[-1]">
              <div className="h-16 w-2 bg-gradient-to-b from-red-600 to-yellow-400 shadow-[0_0_10px_rgba(255,165,0,0.8)]"></div>
            </div>
          </div>
        </div>

        {/* Controles de Empleados */}
        <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto px-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-orange-200">
            <Cloud className="w-5 h-5 text-sky-300" />
            Legión Celestial ({employees.length})
          </h3>
          <button
            onClick={addEmployee}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(14,165,233,0.5)] font-bold border border-sky-400"
          >
            <Plus className="w-4 h-4" />
            Invocar Ángel
          </button>
        </div>

        {/* Grilla de Empleados */}
        <div className="relative pt-8 pb-12 min-h-[200px]">
            {employees.length === 0 && (
                <div className="text-center text-red-300/50 py-10 border-2 border-dashed border-red-900 rounded-xl bg-black/20">
                    <p className="text-lg">El infierno está vacío...</p>
                    <p className="text-sm">Invoca ángeles para comenzar. Todo se guardará automáticamente.</p>
                </div>
            )}

            {employees.length > 1 && (
                 <div className="absolute top-0 left-4 right-4 h-8 border-t-2 border-l-2 border-r-2 border-yellow-500/50 rounded-t-3xl -z-0 shadow-[0_-5px_10px_rgba(255,215,0,0.2)]"></div>
            )}
             {employees.length === 1 && (
                 <div className="absolute top-0 left-1/2 h-8 border-l-2 border-yellow-500/50 -z-0"></div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {employees.map((emp) => {
              const totalGenerated = emp.entries.reduce((sum, e) => sum + e.amount, 0);
              const employeeKeeps = totalGenerated * (emp.retentionPercent / 100);
              const bossGets = totalGenerated - employeeKeeps;

              return (
                <div key={emp.id} className={`flex flex-col h-full relative bg-gradient-to-b from-white to-sky-50 rounded-xl p-5 border-2 transition-all hover:scale-[1.01] duration-300 ${emp.isWife ? 'border-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.4)]' : 'border-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.3)]'}`}>
                  
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 border-4 border-yellow-400 rounded-[50%] opacity-80 shadow-[0_0_10px_rgba(255,215,0,0.8)] z-0"></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-t from-sky-300 to-yellow-400"></div>
                  
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{emp.isWife ? '💘' : '😇'}</span>
                        <input
                            type="text"
                            value={emp.name}
                            onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                            className="font-bold text-lg text-slate-800 bg-transparent border-b border-transparent hover:border-sky-300 focus:border-sky-500 focus:outline-none w-full"
                            placeholder="Nombre..."
                        />
                      </div>
                      
                      <label className={`flex items-center gap-1 cursor-pointer select-none text-xs px-2 py-1 rounded transition-colors w-fit ${emp.isWife ? 'bg-pink-100 text-pink-600' : 'bg-sky-100 text-sky-600 hover:bg-sky-200'}`}>
                            <input 
                                type="checkbox" 
                                checked={emp.isWife} 
                                onChange={(e) => updateEmployee(emp.id, 'isWife', e.target.checked)}
                                className={`rounded focus:ring-offset-0 ${emp.isWife ? 'text-pink-500 focus:ring-pink-500' : 'text-sky-500 focus:ring-sky-500'}`}
                            />
                            {emp.isWife ? <span className="font-bold">Esposa (100% para ti)</span> : <span>¿Es tu Esposa?</span>}
                      </label>
                    </div>
                    <button onClick={() => removeEmployee(emp.id)} className="text-slate-300 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-4 bg-white/50 rounded-lg p-2 mb-4">
                    <button 
                        onClick={() => setActiveModal({ type: 'employee', id: emp.id })}
                        className="w-full bg-sky-100 hover:bg-sky-200 text-sky-700 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 border border-sky-200 text-sm"
                    >
                        <Calendar className="w-4 h-4" /> Cargar Semana / Mes
                    </button>

                    <div className="bg-sky-50/50 rounded border border-sky-100 h-32 overflow-y-auto p-1 custom-scrollbar">
                        {emp.entries.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-sky-300 opacity-60">
                                <Plus className="w-6 h-6 mb-1" />
                                <span className="text-xs">Sin cargas</span>
                            </div>
                        )}
                        {emp.entries.map((entry) => (
                            <div key={entry.id} className="flex justify-between items-center bg-white px-2 py-2 mb-1 rounded border border-sky-100 shadow-sm text-xs group">
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold text-slate-700 truncate pr-2">{entry.label}</span>
                                    {entry.details && <span className="text-[9px] text-slate-400">Detallada</span>}
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-sky-700 font-mono font-bold">{formatMoney(entry.amount)}</span>
                                    <button onClick={() => removeEmployeeEntry(emp.id, entry.id)} className="text-red-300 hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-sky-100 pt-2">
                         <label className="text-xs font-bold text-sky-600 uppercase">
                            % Que se queda:
                        </label>
                        <div className="relative w-20">
                            <input
                            type="number"
                            min="0"
                            max="100"
                            value={emp.retentionPercent}
                            onChange={(e) => updateEmployee(emp.id, 'retentionPercent', Number(e.target.value))}
                            className="w-full pl-2 pr-5 py-1 text-xs border border-sky-200 rounded text-right font-bold text-sky-800"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-400 text-xs">%</span>
                        </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 px-2">
                        <span>Generado Total:</span>
                        <span className="font-bold text-slate-700">{formatMoney(totalGenerated)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 px-2">
                        <span>Gana Empleado:</span>
                        <span className="font-bold text-sky-600">{formatMoney(employeeKeeps)}</span>
                    </div>

                    <div className={`mt-2 pt-3 border-t-2 border-dashed ${emp.isWife ? 'border-pink-200 bg-pink-50/30' : 'border-sky-200 bg-sky-50/30'} -mx-5 -mb-5 px-5 pb-5 rounded-b-xl`}>
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="bg-orange-100 p-1.5 rounded-full animate-bounce">
                                <Flame className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="font-medium text-orange-800">Tributo para Ti:</span>
                        </div>
                        <div className="text-xl font-black text-orange-600 drop-shadow-sm">
                            {formatMoney(bossGets)}
                        </div>
                        </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-red-900/40 font-serif italic pb-8">
          * Presiona "Guardar Todo el Progreso" antes de salir para asegurar tus cambios.
        </div>

      </div>

      <EntryModal 
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        theme={activeModal?.type === 'boss' ? 'boss' : 'angel'}
        title={activeModal?.type === 'boss' ? 'Cargar Ingresos del Jefe' : 'Cargar Ingresos del Ángel'}
        onSave={(data) => {
            if (activeModal.type === 'boss') {
                handleBossSave(data);
            } else {
                handleEmployeeSave(activeModal.id, data);
            }
        }}
      />

    </div>
  );
};

export default EarningsCalculator;
