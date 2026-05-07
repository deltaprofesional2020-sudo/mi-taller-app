import React, { useState, useEffect } from 'react';
import { Home, Users, CarFront, Wrench, Plus, ChevronRight, Calendar, Bell, Clock, CheckCircle, FileText, History, X, ArrowLeft, Edit2, Save, Settings, Send, DollarSign, Archive, CreditCard, Truck, MessageCircle, AlertCircle, BarChart3, Eye, EyeOff, Wallet, Trash2, Search, FileSignature, Filter, Lock, Delete } from 'lucide-react';

// --- FIREBASE SETUP ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-vUjR3m8w7Y9z2X1qLp0O4n6m5k4j3h2",
  authDomain: "taller-mecanico-b8c3d.firebaseapp.com",
  projectId: "taller-mecanico-b8c3d",
  storageBucket: "taller-mecanico-b8c3d.appspot.com",
  messagingSenderId: "1056342897152",
  appId: "1:1056342897152:web:7f6d4e3c2b1a0987654321"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'mi-taller-app-nicolas';

export default function App() {
  // Estados de la Aplicación
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pinDisabled, setPinDisabled] = useState(localStorage.getItem('taller_pin_disabled') === 'true');
  const [isUnlocked, setIsUnlocked] = useState(localStorage.getItem('taller_pin_disabled') === 'true');
  const [savedPin, setSavedPin] = useState(localStorage.getItem('taller_pin') || null);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [pinStep, setPinStep] = useState(savedPin ? 'verify' : 'create'); 
  const [currentView, setCurrentView] = useState('home');
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [servicios, setServicios] = useState([]);

  // Autenticación Anónima para Firebase
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Carga de Datos en Tiempo Real
  useEffect(() => {
    if (!user || !isUnlocked) return;
    const basePath = `artifacts/${appId}/users/${user.uid}`;
    
    const unsubClientes = onSnapshot(collection(db, basePath, 'clientes'), (snap) => {
      setClientes(snap.docs.map(d => d.data()));
    });
    const unsubVehiculos = onSnapshot(collection(db, basePath, 'vehiculos'), (snap) => {
      setVehiculos(snap.docs.map(d => d.data()));
    });
    const unsubServicios = onSnapshot(query(collection(db, basePath, 'servicios'), orderBy('fechaIngreso', 'desc')), (snap) => {
      setServicios(snap.docs.map(d => d.data()));
    });

    return () => { unsubClientes(); unsubVehiculos(); unsubServicios(); };
  }, [user, isUnlocked]);

  // Lógica de navegación y PIN (simplificada para este bloque)
  const handlePinDigit = (digit) => {
    const newPin = currentPinInput + digit;
    setCurrentPinInput(newPin);
    if (newPin.length === 6) {
      if (pinStep === 'create') {
        localStorage.setItem('taller_pin', newPin);
        setSavedPin(newPin);
        setIsUnlocked(true);
      } else if (newPin === savedPin) {
        setIsUnlocked(true);
      } else {
        setCurrentPinInput('');
      }
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Wrench className="text-blue-500 animate-spin" size={40}/></div>;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Lock className="text-blue-600 mb-4" size={48} />
        <h2 className="text-xl font-bold mb-8">{savedPin ? 'Ingresa tu PIN' : 'Crea tu PIN de Seguridad'}</h2>
        <div className="flex space-x-3 mb-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 ${currentPinInput.length >= i ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((n, i) => (
            <button key={i} onClick={() => n !== '' && (n === 'del' ? setCurrentPinInput('') : handlePinDigit(n.toString()))} className="w-16 h-16 rounded-full bg-white shadow text-xl font-bold active:bg-gray-200">
              {n === 'del' ? '←' : n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold">Delta - Seguridad y Servicios</h1>
        <p className="text-blue-100 text-sm">Panel de Gestión</p>
      </header>

      <main className="p-4 grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <Users className="text-blue-600 mb-2" size={32} />
          <span className="font-bold">{clientes.length}</span>
          <span className="text-xs text-gray-500">Clientes</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <Wrench className="text-green-600 mb-2" size={32} />
          <span className="font-bold">{servicios.length}</span>
          <span className="text-xs text-gray-500">Servicios</span>
        </div>
      </main>

      <div className="p-4">
        <button onClick={() => alert('¡App Conectada! Ya podés empezar a cargar datos.')} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-md flex items-center justify-center">
          <Plus className="mr-2" /> Nuevo Ingreso
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center rounded-t-3xl shadow-2xl">
        <Home className="text-blue-600" />
        <Users className="text-gray-400" />
        <div className="bg-blue-600 p-3 rounded-full -mt-12 shadow-blue-300 shadow-lg border-4 border-white">
          <Plus className="text-white" />
        </div>
        <History className="text-gray-400" />
        <Settings className="text-gray-400" />
      </nav>
    </div>
  );
}
