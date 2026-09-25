import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Activity, 
  DollarSign, 
  Layers, 
  Percent, 
  ArrowUpRight, 
  Cpu, 
  Database, 
  PieChart, 
  Zap, 
  Gauge, 
  Sliders, 
  ShieldCheck, 
  Award, 
  Flame,
  Sun,
  Moon,
  Layers3,
  GitBranch,
  Scale,
  LineChart,
  Clock,
  Sparkle,
  SlidersHorizontal,
  LayoutDashboard,
  Check,
  Target,
  FileSpreadsheet,
  Info,
  Crown
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

// Preset stock market scenarios for 1-click testing
const SCENARIO_PRESETS = [
  {
    name: 'Reliance Benchmark',
    icon: '📊',
    colorDark: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
    colorLight: 'from-cyan-50 to-blue-50 border-cyan-200 text-cyan-800',
    data: {
      prev_close: 1345.35,
      open_price: 1348.0,
      low_price: 1346.0,
      close_price: 1363.85,
      vwap: 1362.98,
      volume: 9055300.0,
      turnover: 32.34,
      deliverable_volume: 2687211.0,
      percent_deliverable: 29.68
    }
  },
  {
    name: 'Bullish Rally',
    icon: '🚀',
    colorDark: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    colorLight: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800',
    data: {
      prev_close: 2420.0,
      open_price: 2435.0,
      low_price: 2430.0,
      close_price: 2490.5,
      vwap: 2478.2,
      volume: 18500000.0,
      turnover: 45.8,
      deliverable_volume: 8900000.0,
      percent_deliverable: 48.1
    }
  },
  {
    name: 'High Volatility Day',
    icon: '⚡',
    colorDark: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
    colorLight: 'from-purple-50 to-pink-50 border-purple-200 text-purple-800',
    data: {
      prev_close: 1890.0,
      open_price: 1910.0,
      low_price: 1875.0,
      close_price: 1965.0,
      vwap: 1940.5,
      volume: 24100000.0,
      turnover: 62.4,
      deliverable_volume: 11200000.0,
      percent_deliverable: 46.5
    }
  },
  {
    name: 'Consolidation Phase',
    icon: '🐻',
    colorDark: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
    colorLight: 'from-amber-50 to-orange-50 border-amber-200 text-amber-800',
    data: {
      prev_close: 850.25,
      open_price: 852.0,
      low_price: 848.5,
      close_price: 854.75,
      vwap: 852.1,
      volume: 3200000.0,
      turnover: 12.1,
      deliverable_volume: 1450000.0,
      percent_deliverable: 45.3
    }
  }
];

const INITIAL_FORM = SCENARIO_PRESETS[0].data;
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export default function App() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedModel, setSelectedModel] = useState('linear'); // 'linear' | 'polynomial' | 'svr' | 'all'
  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ connected: false, message: 'Checking...' });
  const [prediction, setPrediction] = useState(null);
  const [actualHigh, setActualHigh] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [modelWeights, setModelWeights] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('predictor'); // 'predictor' | 'analytics' | 'stats' | 'about'
  const [chartView, setChartView] = useState('bar'); // 'bar' | 'line' | 'radar'
  
  // Theme state (persisted in localStorage)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('stock_app_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('stock_app_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    checkHealth();
    fetchStats();
    fetchWeights();
    fetchMetrics();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) {
        setBackendStatus({ connected: true, message: 'FastAPI Connected' });
      } else {
        setBackendStatus({ connected: false, message: 'API Offline' });
      }
    } catch (err) {
      setBackendStatus({ connected: false, message: 'Backend Disconnected' });
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchWeights = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/model-weights`);
      if (res.ok) {
        const data = await res.json();
        setModelWeights(data);
      }
    } catch (err) {
      console.error('Failed to load model weights:', err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/model-metrics`);
      if (res.ok) {
        const data = await res.json();
        setModelMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load model metrics:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value) || 0
    }));
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        model_type: selectedModel
      };
      const res = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPrediction(data);
      } else {
        setError(data.detail || 'Failed to generate prediction');
      }
    } catch (err) {
      setError('Could not connect to FastAPI server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setSampleLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sample`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data.sample);
        setActualHigh(data.actual_high);
        
        // Auto trigger prediction on sample load
        const payload = {
          ...data.sample,
          model_type: selectedModel
        };
        const predRes = await fetch(`${API_BASE_URL}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const predData = await predRes.json();
        if (predRes.ok && predData.success) {
          setPrediction(predData);
        }
      } else {
        setError('Failed to fetch sample data');
      }
    } catch (err) {
      setError('Connection error while fetching sample data');
    } finally {
      setSampleLoading(false);
    }
  };

  const applyPreset = (presetData) => {
    setFormData(presetData);
    setActualHigh(null);
    setPrediction(null);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setPrediction(null);
    setActualHigh(null);
    setError(null);
  };

  // Helper detection functions for real-time format indicator
  const turnoverFormat = formData.turnover > 6.0 ? 'Raw Value (Log1p Auto-Applied)' : 'Scaled Log Value';
  const percentDelivFormat = formData.percent_deliverable > 1.0 ? 'Percentage (Auto /100)' : 'Ratio (0 - 1.0)';

  // Dynamic Chart Data & Styling
  const labelsList = ['Prev Close', 'Open Price', 'Low Price', 'Close Price', 'VWAP', 'Linear Pred', 'Poly Pred', 'SVR Pred', 'AdaBoost Pred', 'RF Pred'];
  const dataValues = prediction ? [
    formData.prev_close,
    formData.open_price,
    formData.low_price,
    formData.close_price,
    formData.vwap,
    prediction.all_models?.linear || 0,
    prediction.all_models?.polynomial || 0,
    prediction.all_models?.svr || 0,
    prediction.all_models?.adaboost || 0,
    prediction.all_models?.random_forest || 0
  ] : [];

  const barChartData = prediction ? {
    labels: labelsList,
    datasets: [
      {
        label: 'Price Spectrum (₹)',
        data: dataValues,
        backgroundColor: [
          darkMode ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.6)',
          darkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.65)',
          darkMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(220, 38, 38, 0.65)',
          darkMode ? 'rgba(34, 197, 94, 0.5)' : 'rgba(22, 163, 74, 0.65)',
          darkMode ? 'rgba(168, 85, 247, 0.5)' : 'rgba(147, 51, 234, 0.65)',
          'rgba(6, 182, 212, 0.85)',
          'rgba(168, 85, 247, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(239, 68, 68, 0.85)',
          'rgba(34, 197, 94, 0.85)'
        ],
        borderColor: [
          '#94a3b8',
          '#3b82f6',
          '#ef4444',
          '#22c55e',
          '#a855f7',
          '#06b6d4',
          '#a855f7',
          '#f59e0b',
          '#ef4444',
          '#22c55e'
        ],
        borderWidth: 2,
        borderRadius: 10,
      }
    ]
  } : null;

  const lineChartData = prediction ? {
    labels: labelsList,
    datasets: [
      {
        label: 'Price Trajectory (₹)',
        data: dataValues,
        fill: true,
        backgroundColor: darkMode ? 'rgba(6, 182, 212, 0.15)' : 'rgba(14, 165, 233, 0.15)',
        borderColor: darkMode ? '#06b6d4' : '#0284c7',
        borderWidth: 3,
        tension: 0.35,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#fff',
        pointRadius: 5
      }
    ]
  } : null;

  const radarChartData = prediction ? {
    labels: ['Prev Close', 'Open', 'Low', 'Close', 'VWAP', 'Linear', 'Poly', 'SVR', 'AdaBoost', 'RF'],
    datasets: [
      {
        label: 'Multi-Model Spectrum',
        data: dataValues,
        backgroundColor: darkMode ? 'rgba(6, 182, 212, 0.25)' : 'rgba(14, 165, 233, 0.25)',
        borderColor: darkMode ? '#06b6d4' : '#0284c7',
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#06b6d4'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ₹${context.raw ? context.raw.toLocaleString('en-IN') : 0}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: darkMode ? '#9ca3af' : '#475569', font: { family: 'monospace' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: darkMode ? '#9ca3af' : '#475569' }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        angleLines: { color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
        grid: { color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
        pointLabels: { color: darkMode ? '#9ca3af' : '#475569', font: { size: 11 } },
        ticks: { display: false }
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black ${
      darkMode ? 'bg-[#070a12] text-gray-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Background Ambient Gradients */}
      {darkMode ? (
        <>
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-600/20 to-blue-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" />
          <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/20 to-pink-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '3s' }} />
          <div className="absolute -bottom-20 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/15 to-teal-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '5s' }} />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-200/40 to-blue-200/30 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute top-1/2 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-[160px] pointer-events-none" />
        </>
      )}

      {/* TOP NAVIGATION BAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl transition-colors duration-300 border-b ${
        darkMode 
          ? 'bg-[#070a12]/85 border-white/10 shadow-2xl' 
          : 'bg-white/85 border-slate-200/80 shadow-md'
      }`}>
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('predictor')}>
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                  darkMode ? 'bg-[#0b0f1a] border-white/10 text-cyan-400' : 'bg-white border-slate-200 text-cyan-600'
                }`}>
                  <TrendingUp className="w-6 h-6 transform group-hover:scale-110 transition duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-black tracking-tight bg-clip-text text-transparent ${
                  darkMode 
                    ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400' 
                    : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600'
                }`}>
                  StockPredict <span className="text-cyan-500 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">PRO</span>
                </span>
                <span className={`text-[10px] font-medium tracking-widest uppercase ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Multi-Model High Price Engine
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`hidden md:flex items-center gap-2 p-1.5 rounded-2xl border transition-colors ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <button 
                onClick={() => setActiveTab('predictor')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'predictor'
                    ? darkMode
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                      : 'bg-white text-cyan-700 border border-slate-300 shadow'
                    : darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-500" /> Trading Terminal
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? darkMode
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                      : 'bg-white text-cyan-700 border border-slate-300 shadow'
                    : darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Gauge className="w-4 h-4 text-purple-500" /> Model Weights
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'stats'
                    ? darkMode
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                      : 'bg-white text-cyan-700 border border-slate-300 shadow'
                    : darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-500" /> Dataset Stats
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'about'
                    ? darkMode
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg'
                      : 'bg-white text-cyan-700 border border-slate-300 shadow'
                    : darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Cpu className="w-4 h-4 text-amber-500" /> Model Evaluation & Metrics
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 sm:px-3.5 sm:py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-yellow-300 hover:bg-white/10' 
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun className="w-4 h-4 text-yellow-400 animate-spin-slow" /> : <Moon className="w-4 h-4 text-slate-700" />}
                <span className="text-xs font-bold hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
              </button>

              <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendStatus.connected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${backendStatus.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </span>
                <span className={backendStatus.connected ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                  {backendStatus.connected ? 'FastAPI Online' : 'Offline'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* FULL-WIDTH MAIN CONTAINER */}
      <main className="flex-grow w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-16 relative z-10 space-y-6">

        {/* ERROR DISPLAY ALERT */}
        {error && (
          <div className="w-full mb-2 p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 text-sm flex items-center justify-between shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:underline text-xs font-bold">Dismiss</button>
          </div>
        )}

        {/* TAB 1: PREDICTOR ENGINE DASHBOARD */}
        {activeTab === 'predictor' && (
          <div className="space-y-6">
            
            {/* HERO HEADER STRIP */}
            <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-colors ${
              darkMode ? 'dark-glass-card border-white/10' : 'light-glass-card border-slate-200 shadow-md'
            }`}>
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Multi-Model Stock Peak Price AI Engine
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Stock High Price <span className={`bg-clip-text text-transparent ${
                    darkMode ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400' : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600'
                  }`}>Prediction Dashboard</span>
                </h1>
              </div>

              {/* STATS STRIP */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs font-mono">
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
                  darkMode ? 'bg-[#0b0f1a] border-cyan-500/30 text-cyan-300' : 'bg-white border-cyan-200 text-cyan-800'
                }`}>
                  <Zap className="w-4 h-4 text-cyan-500" /> 3 ML Models Active
                </div>
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
                  darkMode ? 'bg-[#0b0f1a] border-purple-500/30 text-purple-300' : 'bg-white border-purple-200 text-purple-800'
                }`}>
                  <Clock className="w-4 h-4 text-purple-500" /> Live REST API
                </div>
                <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
                  darkMode ? 'bg-[#0b0f1a] border-emerald-500/30 text-emerald-300' : 'bg-white border-emerald-200 text-emerald-800'
                }`}>
                  <Database className="w-4 h-4 text-emerald-500" /> 4,151 Training Rows
                </div>
              </div>
            </div>

            {/* FULL-WIDTH 3-COLUMN DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* COLUMN 1: CONTROLS & MARKET PRESETS (3 COLS) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* 1. Algorithm Selection */}
                <div className={`rounded-3xl p-5 border space-y-3 ${darkMode ? 'dark-glass-card border-white/10' : 'light-glass-card border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                      <Layers3 className="w-4 h-4 text-cyan-500" /> ML Algorithm
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Linear */}
                    <button
                      type="button"
                      onClick={() => setSelectedModel('linear')}
                      className={`w-full p-3 rounded-2xl border transition-all duration-200 text-left flex items-center justify-between ${
                        selectedModel === 'linear'
                          ? darkMode
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500'
                            : 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold ring-1 ring-cyan-400'
                          : darkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-cyan-500" />
                        <div>
                          <div className="text-xs font-bold">Linear Regression</div>
                          <div className="text-[10px] opacity-75 font-mono">Standard Linear</div>
                        </div>
                      </div>
                    </button>

                    {/* Polynomial */}
                    <button
                      type="button"
                      onClick={() => setSelectedModel('polynomial')}
                      className={`w-full p-3 rounded-2xl border transition-all duration-200 text-left flex items-center justify-between ${
                        selectedModel === 'polynomial'
                          ? darkMode
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 text-purple-300 shadow-md ring-1 ring-purple-500'
                            : 'bg-purple-50 border-purple-500 text-purple-900 font-bold ring-1 ring-purple-400'
                          : darkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <GitBranch className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="text-xs font-bold">Polynomial (Deg 2)</div>
                          <div className="text-[10px] opacity-75 font-mono">Degree 2 Curve</div>
                        </div>
                      </div>
                    </button>

                    {/* SVR */}
                    <button
                      type="button"
                      onClick={() => setSelectedModel('svr')}
                      className={`w-full p-3 rounded-2xl border transition-all duration-200 text-left flex items-center justify-between ${
                        selectedModel === 'svr'
                          ? darkMode
                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                            : 'bg-amber-50 border-amber-500 text-amber-900 font-bold ring-1 ring-amber-400'
                          : darkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Cpu className="w-4 h-4 text-amber-500" />
                        <div>
                          <div className="text-xs font-bold">Support Vector (SVR)</div>
                          <div className="text-[10px] opacity-75 font-mono">RBF Kernel</div>
                        </div>
                      </div>
                    </button>

                    {/* AdaBoost */}
                    <button
                      type="button"
                      onClick={() => setSelectedModel('adaboost')}
                      className={`w-full p-3 rounded-2xl border transition-all duration-200 text-left flex items-center justify-between ${
                        selectedModel === 'adaboost'
                          ? darkMode
                            ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500 text-red-300 shadow-md ring-1 ring-red-500'
                            : 'bg-red-50 border-red-500 text-red-900 font-bold ring-1 ring-red-400'
                          : darkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Flame className="w-4 h-4 text-red-500" />
                        <div>
                          <div className="text-xs font-bold">AdaBoost Regressor</div>
                          <div className="text-[10px] opacity-75 font-mono">Ensemble Method</div>
                        </div>
                      </div>
                    </button>

                    {/* Random Forest */}
                    <button
                      type="button"
                      onClick={() => setSelectedModel('random_forest')}
                      className={`w-full p-3 rounded-2xl border transition-all duration-200 text-left flex items-center justify-between ${
                        selectedModel === 'random_forest'
                          ? darkMode
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500 text-green-300 shadow-md ring-1 ring-green-500'
                            : 'bg-green-50 border-green-500 text-green-900 font-bold ring-1 ring-green-400'
                          : darkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-xs font-bold">Random Forest</div>
                          <div className="text-[10px] opacity-75 font-mono">Tree Ensemble</div>
                        </div>
                      </div>
                    </button>

                    {/* Compare All */}
                    <button
                      type="button"
                      onClick={() => setSelectedModel('all')}
                      className={`w-full p-3 rounded-2xl border transition-all duration-200 text-left flex items-center justify-between ${
                        selectedModel === 'all'
                          ? darkMode
                            ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500 text-emerald-300 shadow-lg ring-2 ring-emerald-500'
                            : 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400'
                          : darkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Scale className="w-4 h-4 text-emerald-500" />
                        <div>
                          <div className="text-xs font-bold">Multi-Model Compare</div>
                          <div className="text-[10px] opacity-75 font-mono">Side-by-Side Mode</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Quick Presets */}
                <div className={`rounded-3xl p-5 border space-y-3 ${darkMode ? 'dark-glass-card border-white/10' : 'light-glass-card border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                      <Sliders className="w-4 h-4 text-purple-500" /> Quick Scenarios
                    </span>
                  </div>

                  <div className="space-y-2">
                    {SCENARIO_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset.data)}
                        className={`w-full p-3 rounded-2xl border bg-gradient-to-r text-left transition-all duration-200 hover:scale-[1.02] ${
                          darkMode ? preset.colorDark : preset.colorLight
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{preset.icon}</span>
                          <span className="text-[9px] font-mono opacity-75">Open ₹{preset.data.open_price}</span>
                        </div>
                        <div className={`text-xs font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* COLUMN 2: FINANCIAL FEATURE INPUT MATRIX (5 COLS) */}
              <div className={`lg:col-span-5 rounded-3xl p-6 sm:p-7 relative border ${darkMode ? 'dark-glass-card border-white/10' : 'light-glass-card border-slate-200 shadow-md'}`}>
                
                <div className={`flex items-center justify-between mb-6 pb-4 border-b ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
                      darkMode ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                    }`}>
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Stock Market Indicators</h2>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>9 Core Inputs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      disabled={sampleLoading}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                        darkMode 
                          ? 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-300' 
                          : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${sampleLoading ? 'animate-spin' : ''}`} />
                      <span>{sampleLoading ? 'Loading...' : 'Sample'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        darkMode ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePredict} className="space-y-6">
                  
                  {/* GROUP A: PRICE METRICS */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${darkMode ? 'bg-[#0b0f1a]/80 border-white/5' : 'bg-slate-50/80 border-slate-200'}`}>
                    <div className="text-xs font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-2 border-b pb-2 border-white/5">
                      <DollarSign className="w-4 h-4 text-cyan-500" /> Price Benchmarks
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Prev Close */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          Prev Close
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="prev_close"
                          value={formData.prev_close}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="1345.35"
                        />
                      </div>

                      {/* Open Price */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          Open Price
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="open_price"
                          value={formData.open_price}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="1348.00"
                        />
                      </div>

                      {/* Low Price */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          Low Price
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="low_price"
                          value={formData.low_price}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="1346.00"
                        />
                      </div>

                      {/* Close Price */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          Close Price
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="close_price"
                          value={formData.close_price}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="1363.85"
                        />
                      </div>

                      {/* VWAP */}
                      <div className="sm:col-span-2">
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          VWAP (Volume Weighted Average Price)
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="vwap"
                          value={formData.vwap}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="1362.98"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GROUP B: VOLUME & MARKET INDICATORS */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 ${darkMode ? 'bg-[#0b0f1a]/80 border-white/5' : 'bg-slate-50/80 border-slate-200'}`}>
                    <div className="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center gap-2 border-b pb-2 border-white/5">
                      <Layers className="w-4 h-4 text-purple-500" /> Volume & Delivery Metrics
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

                      {/* Volume */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          Volume
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="volume"
                          value={formData.volume}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="9055300"
                        />
                      </div>

                      {/* Turnover */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          Turnover
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="turnover"
                          value={formData.turnover}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="32.34"
                        />
                        <div className="mt-1 text-[9px] text-cyan-500 font-bold font-mono">
                          • {turnoverFormat}
                        </div>
                      </div>

                      {/* Deliverable Volume */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          Deliv Volume
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="deliverable_volume"
                          value={formData.deliverable_volume}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="2687211"
                        />
                      </div>

                      {/* % Deliverable */}
                      <div>
                        <label className={`block text-xs font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                          % Deliverable
                        </label>
                        <input
                          type="number"
                          step="any"
                          name="percent_deliverable"
                          value={formData.percent_deliverable}
                          onChange={handleInputChange}
                          required
                          className={`w-full border rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all ${
                            darkMode ? 'bg-[#070a12] border-gray-700/80 text-white' : 'bg-white border-slate-300 text-slate-900 font-semibold'
                          }`}
                          placeholder="29.68"
                        />
                        <div className="mt-1 text-[9px] text-purple-500 font-bold font-mono">
                          • {percentDelivFormat}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-xl shadow-cyan-500/20 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Executing Models...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                          <span>Calculate High Price Prediction</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>

              {/* COLUMN 3: PREDICTION RESULT & VISUAL CHARTS (4 COLS) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* PREDICTION RESULT BOX */}
                <div className={`rounded-3xl p-6 relative overflow-hidden border ${
                  selectedModel === 'all'
                    ? darkMode ? 'dark-glass-card border-emerald-500/60 ring-2 ring-emerald-500/30' : 'light-glass-card border-emerald-400 ring-2 ring-emerald-400 shadow-xl'
                    : darkMode ? 'dark-glass-card border-cyan-500/40' : 'light-glass-card border-cyan-300 shadow-xl'
                }`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {selectedModel === 'all' ? (
                        <Crown className="w-4 h-4 text-emerald-400 animate-pulse" />
                      ) : (
                        <Flame className="w-4 h-4 text-cyan-500" />
                      )}
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        selectedModel === 'all'
                          ? darkMode ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-emerald-800 bg-emerald-50 border-emerald-300 font-black'
                          : darkMode ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30' : 'text-cyan-700 bg-cyan-50 border-cyan-200'
                      }`}>
                        {selectedModel === 'all' ? 'Multi-Model Comparison Active' : (prediction?.model_name_display || 'Predicted Stock High')}
                      </span>
                    </div>
                    {actualHigh && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono ${
                        darkMode ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}>
                        Actual: ₹{actualHigh.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {prediction ? (
                    <div className="space-y-5 animate-fade-in">
                      
                      {/* MULTI-MODEL SPECIAL HERO VIEW WHEN MODE IS 'ALL' */}
                      {selectedModel === 'all' && prediction.all_models ? (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-2xl border space-y-3 ${
                            darkMode ? 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border-emerald-500/30' : 'bg-emerald-50/80 border-emerald-300'
                          }`}>
                            <div className="flex items-center justify-between text-xs font-black text-emerald-400 uppercase tracking-wider">
                              <span className="flex items-center gap-1.5"><Scale className="w-4 h-4" /> Multi-Model Comparison Table</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">All 3 Predictions</span>
                            </div>

                            {/* 1. Linear */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f1a]/80 border border-cyan-500/30">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-cyan-400" />
                                <div>
                                  <div className="text-xs font-bold text-cyan-300">Linear Regression</div>
                                  <div className="text-[9px] text-gray-400 font-mono">Standard Linear</div>
                                </div>
                              </div>
                              <div className="text-base font-black font-mono text-cyan-300">₹{prediction.all_models.linear}</div>
                            </div>

                            {/* 2. Polynomial (WINNER HIGHLIGHT) */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f1a]/90 border border-purple-500/40 ring-1 ring-purple-500/30">
                              <div className="flex items-center gap-2">
                                <GitBranch className="w-4 h-4 text-purple-400" />
                                <div>
                                  <div className="text-xs font-bold text-purple-300 flex items-center gap-1">
                                    Polynomial (Deg 2) <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 font-mono">Best R²</span>
                                  </div>
                                  <div className="text-[9px] text-gray-400 font-mono">Degree 2 Curve</div>
                                </div>
                              </div>
                              <div className="text-base font-black font-mono text-purple-300">₹{prediction.all_models.polynomial}</div>
                            </div>

                            {/* 3. SVR */}
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0f1a]/80 border border-amber-500/30">
                              <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-amber-400" />
                                <div>
                                  <div className="text-xs font-bold text-amber-300">SVR Model</div>
                                  <div className="text-[9px] text-gray-400 font-mono">RBF Kernel</div>
                                </div>
                              </div>
                              <div className="text-base font-black font-mono text-amber-300">₹{prediction.all_models.svr}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* SINGLE MODEL HERO VIEW */
                        <div>
                          <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight bg-clip-text text-transparent ${
                            darkMode 
                              ? 'bg-gradient-to-r from-cyan-300 via-emerald-400 to-blue-400' 
                              : 'bg-gradient-to-r from-cyan-600 via-emerald-600 to-blue-600'
                          }`}>
                            ₹{prediction.predicted_high.toLocaleString('en-IN')}
                          </div>
                          <div className={`text-xs mt-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Active Model: {prediction.model_name_display}
                          </div>
                        </div>
                      )}

                      {/* Extended Metrics Breakdown */}
                      <div className={`grid grid-cols-2 gap-3 pt-2 border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                        <div className={`rounded-2xl p-3.5 border ${darkMode ? 'bg-[#0b0f1a]/90 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className={`text-[10px] mb-0.5 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Gain vs Open</div>
                          <div className={`text-base font-black font-mono ${prediction.metrics.diff_from_open >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {prediction.metrics.diff_from_open >= 0 ? '+' : ''}₹{prediction.metrics.diff_from_open}
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-500">
                            +{prediction.metrics.pct_from_open}%
                          </div>
                        </div>

                        <div className={`rounded-2xl p-3.5 border ${darkMode ? 'bg-[#0b0f1a]/90 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className={`text-[10px] mb-0.5 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Gain vs Close</div>
                          <div className={`text-base font-black font-mono ${prediction.metrics.diff_from_close >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {prediction.metrics.diff_from_close >= 0 ? '+' : ''}₹{prediction.metrics.diff_from_close}
                          </div>
                          <div className="text-[11px] font-semibold text-emerald-500">
                            +{prediction.metrics.pct_from_close}%
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto text-cyan-500 ${
                        darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Ready for Prediction</div>
                        <p className={`text-xs max-w-xs mx-auto ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                          Click <span className="text-cyan-500 font-semibold">Calculate High Price</span> or choose a preset.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* DYNAMIC CHART CARD */}
                {prediction && (
                  <div className={`rounded-3xl p-5 space-y-3 ${darkMode ? 'dark-glass-card' : 'light-glass-card'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        <PieChart className="w-4 h-4 text-cyan-500" /> Comparison Spectrum
                      </h3>
                      <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <button
                          onClick={() => setChartView('bar')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            chartView === 'bar'
                              ? darkMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white text-cyan-700 border border-slate-300'
                              : darkMode ? 'text-gray-400' : 'text-slate-500'
                          }`}
                        >
                          Bar
                        </button>
                        <button
                          onClick={() => setChartView('line')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            chartView === 'line'
                              ? darkMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white text-cyan-700 border border-slate-300'
                              : darkMode ? 'text-gray-400' : 'text-slate-500'
                          }`}
                        >
                          Line
                        </button>
                        <button
                          onClick={() => setChartView('radar')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            chartView === 'radar'
                              ? darkMode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white text-cyan-700 border border-slate-300'
                              : darkMode ? 'text-gray-400' : 'text-slate-500'
                          }`}
                        >
                          Radar
                        </button>
                      </div>
                    </div>

                    <div className="h-56 relative">
                      {chartView === 'bar' && barChartData && <Bar data={barChartData} options={chartOptions} />}
                      {chartView === 'line' && lineChartData && <Line data={lineChartData} options={chartOptions} />}
                      {chartView === 'radar' && radarChartData && <Radar data={radarChartData} options={radarOptions} />}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & RADAR */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Stock Feature Analytics & Model Weights</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Visual analysis of actual trained feature weights (coefficients) dynamically extracted from the Machine Learning Model.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Radar Spectrum */}
              <div className={`rounded-3xl p-6 flex flex-col justify-between ${darkMode ? 'dark-glass-card' : 'light-glass-card'}`}>
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Gauge className="w-4 h-4 text-purple-500" /> Relative Feature Spectrum
                </h3>
                <div className="h-80 relative">
                  {radarChartData ? (
                    <Radar data={radarChartData} options={radarOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                      Run a prediction on the Predictor tab to view live spectrum.
                    </div>
                  )}
                </div>
              </div>

              {/* Model Feature Coefficients Card */}
              <div className={`rounded-3xl p-6 space-y-4 ${darkMode ? 'dark-glass-card' : 'light-glass-card'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Award className="w-4 h-4 text-cyan-500" /> Trained Feature Weights (Linear Model)
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 font-bold">
                    LinearRegression
                  </span>
                </div>

                {modelWeights ? (
                  <div className="space-y-2 text-xs font-mono max-h-96 overflow-y-auto pr-1">
                    <div className={`flex items-center justify-between p-2.5 rounded-xl border font-bold ${
                      darkMode ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'
                    }`}>
                      <span>Model Intercept (Bias):</span>
                      <span>{modelWeights.intercept}</span>
                    </div>

                    {modelWeights.weights.map((w) => (
                      <div key={w.feature} className={`flex items-center justify-between p-2.5 rounded-xl border ${
                        darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>{w.feature}:</span>
                        <span className={`font-bold ${w.raw_coef >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {w.raw_coef >= 0 ? '+' : ''}{w.weight}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 text-xs">Loading model weights...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATASET STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Historical Stock Dataset Summary</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Statistical distribution computed across {stats ? stats.total_rows.toLocaleString('en-IN') : '4,151'} historical stock records in the dataset.
              </p>
            </div>

            {stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.stats).map(([featureName, featureStats]) => (
                  <div key={featureName} className={`rounded-2xl p-5 transition duration-300 ${darkMode ? 'dark-glass-card hover:border-cyan-500/40' : 'light-glass-card hover:border-cyan-400'}`}>
                    <div className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-3">{featureName}</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="text-gray-400 text-[10px]">MIN</div>
                        <div className={`font-mono font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{featureStats.min}</div>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-[#0b0f1a] border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
                        <div className="text-cyan-500 text-[10px] font-bold">MEAN</div>
                        <div className="font-mono text-cyan-500 font-bold">{featureStats.mean}</div>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="text-gray-400 text-[10px]">MAX</div>
                        <div className={`font-mono font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{featureStats.max}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
                <span>Loading dataset statistics...</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MODEL EVALUATION & METRICS (MODEL INFO) */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Target className="w-4 h-4 text-amber-400" /> Model Performance Dashboard
              </div>
              <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Machine Learning Model Evaluation & Error Metrics
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Evaluated across <span className="text-cyan-500 font-bold font-mono">{modelMetrics ? modelMetrics.total_eval_samples.toLocaleString('en-IN') : '4,151'}</span> stock dataset records using standard regression metrics.
              </p>
            </div>

            {/* METRICS LEADERBOARD GRID (3 COLUMNS) */}
            {modelMetrics?.metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Linear Regression Metrics Card */}
                <div className={`rounded-3xl p-6 border space-y-5 relative overflow-hidden transition-all hover:scale-[1.01] ${
                  darkMode ? 'dark-glass-card border-cyan-500/40' : 'light-glass-card border-cyan-300 shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b pb-4 border-white/10">
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="w-5 h-5 text-cyan-500" />
                      <h3 className={`font-black text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>Linear Regression</h3>
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      R² {modelMetrics.metrics.linear?.r2_score}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Mean Squared Error (MSE)</div>
                        <div className="text-base font-bold text-cyan-400">{modelMetrics.metrics.linear?.mse}</div>
                      </div>
                      <div className="text-xs text-gray-500">e²</div>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Root Mean Squared Error (RMSE)</div>
                        <div className="text-base font-bold text-cyan-400">₹{modelMetrics.metrics.linear?.rmse}</div>
                      </div>
                      <div className="text-xs text-gray-500">₹ error</div>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Mean Absolute Error (MAE)</div>
                        <div className="text-base font-bold text-cyan-400">₹{modelMetrics.metrics.linear?.mae}</div>
                      </div>
                      <div className="text-xs text-gray-500">Avg Abs Diff</div>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                      <div>
                        <div className="text-[10px] text-emerald-500 font-bold uppercase">Accuracy (R² Score)</div>
                        <div className="text-lg font-black text-emerald-400">{modelMetrics.metrics.linear?.accuracy_pct}%</div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* 2. Polynomial Regression Metrics Card (WINNER HIGHLIGHT) */}
                <div className={`rounded-3xl p-6 border space-y-5 relative overflow-hidden transition-all hover:scale-[1.01] ${
                  darkMode ? 'dark-glass-card border-purple-500/50 ring-2 ring-purple-500/40' : 'light-glass-card border-purple-400 shadow-2xl ring-2 ring-purple-400'
                }`}>
                  <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-purple-600 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl shadow-md">
                    🏆 Lowest Error (Best Fit)
                  </div>

                  <div className="flex items-center justify-between border-b pb-4 border-white/10 pt-2">
                    <div className="flex items-center gap-2.5">
                      <GitBranch className="w-5 h-5 text-purple-500" />
                      <h3 className={`font-black text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>Polynomial (Deg 2)</h3>
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      R² {modelMetrics.metrics.polynomial?.r2_score}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-purple-500/20' : 'bg-purple-50/50 border-purple-200'}`}>
                      <div>
                        <div className="text-[10px] text-purple-400 uppercase font-semibold">Mean Squared Error (MSE)</div>
                        <div className="text-base font-bold text-purple-400">{modelMetrics.metrics.polynomial?.mse}</div>
                      </div>
                      <div className="text-xs text-purple-400 font-bold">Lowest</div>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-purple-500/20' : 'bg-purple-50/50 border-purple-200'}`}>
                      <div>
                        <div className="text-[10px] text-purple-400 uppercase font-semibold">Root Mean Squared Error (RMSE)</div>
                        <div className="text-base font-bold text-purple-400">₹{modelMetrics.metrics.polynomial?.rmse}</div>
                      </div>
                      <div className="text-xs text-purple-400 font-bold">₹ error</div>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-purple-500/20' : 'bg-purple-50/50 border-purple-200'}`}>
                      <div>
                        <div className="text-[10px] text-purple-400 uppercase font-semibold">Mean Absolute Error (MAE)</div>
                        <div className="text-base font-bold text-purple-400">₹{modelMetrics.metrics.polynomial?.mae}</div>
                      </div>
                      <div className="text-xs text-purple-400 font-bold">Lowest</div>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                      <div>
                        <div className="text-[10px] text-emerald-500 font-bold uppercase">Accuracy (R² Score)</div>
                        <div className="text-lg font-black text-emerald-400">{modelMetrics.metrics.polynomial?.accuracy_pct}%</div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* 3. SVR Model Metrics Card */}
                <div className={`rounded-3xl p-6 border space-y-5 relative overflow-hidden transition-all hover:scale-[1.01] ${
                  darkMode ? 'dark-glass-card border-white/10' : 'light-glass-card border-slate-200'
                }`}>
                  <div className="flex items-center justify-between border-b pb-4 border-white/10">
                    <div className="flex items-center gap-2.5">
                      <Cpu className="w-5 h-5 text-amber-500" />
                      <h3 className={`font-black text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>Support Vector (SVR)</h3>
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      R² {modelMetrics.metrics.svr?.r2_score}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">MSE</div>
                        <div className="text-base font-bold text-amber-400">{modelMetrics.metrics.svr?.mse}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. AdaBoost Model Metrics Card */}
                <div className={`rounded-3xl p-6 border space-y-5 relative overflow-hidden transition-all hover:scale-[1.01] ${
                  darkMode ? 'dark-glass-card border-white/10' : 'light-glass-card border-slate-200'
                }`}>
                  <div className="flex items-center justify-between border-b pb-4 border-white/10">
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-5 h-5 text-red-500" />
                      <h3 className={`font-black text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>AdaBoost Regressor</h3>
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      R² {modelMetrics.metrics.adaboost?.r2_score}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">MSE</div>
                        <div className="text-base font-bold text-red-400">{modelMetrics.metrics.adaboost?.mse}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Random Forest Model Metrics Card */}
                <div className={`rounded-3xl p-6 border space-y-5 relative overflow-hidden transition-all hover:scale-[1.01] ${
                  darkMode ? 'dark-glass-card border-white/10' : 'light-glass-card border-slate-200'
                }`}>
                  <div className="flex items-center justify-between border-b pb-4 border-white/10">
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-5 h-5 text-green-500" />
                      <h3 className={`font-black text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>Random Forest Regressor</h3>
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      R² {modelMetrics.metrics.random_forest?.r2_score}
                    </span>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className={`p-3 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">MSE</div>
                        <div className="text-base font-bold text-green-400">{modelMetrics.metrics.random_forest?.mse}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
                <span>Computing evaluation metrics across dataset...</span>
              </div>
            )}

            {/* METRICS GLOSSARY & EXPLANATIONS */}
            <div className={`rounded-3xl p-6 border space-y-4 ${darkMode ? 'dark-glass-card border-white/10' : 'light-glass-card border-slate-200'}`}>
              <h3 className={`text-sm font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Info className="w-4 h-4 text-cyan-500" /> Regression Metrics Guide & Definitions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-cyan-500 mb-1">Mean Squared Error (MSE)</div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Calculates average squared difference between predicted High price and actual High price: <code className="text-cyan-400 font-mono">MSE = 1/n Σ(y - ŷ)²</code>.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-purple-500 mb-1">Root Mean Squared Error (RMSE)</div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Square root of MSE. Represents model prediction error in exact currency (₹ rupees): <code className="text-purple-400 font-mono">RMSE = √MSE</code>.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-amber-500 mb-1">Mean Absolute Error (MAE)</div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Average magnitude of errors without considering direction: <code className="text-amber-400 font-mono">MAE = 1/n Σ|y - ŷ|</code>.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0b0f1a] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="font-bold text-emerald-500 mb-1">R² Score (R-Squared)</div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Proportion of variance in target High price explained by features. Values near 1.0 (99.98%) indicate outstanding accuracy.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className={`mt-auto w-full relative z-20 border-t backdrop-blur-2xl text-xs transition-colors duration-300 ${
        darkMode ? 'bg-[#070a12]/95 border-white/10 text-gray-400' : 'bg-white/95 border-slate-200 text-slate-600 shadow-lg'
      }`}>
        
        {/* Top Glowing Gradient Accent Border */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
          
          <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between pb-6 border-b ${
            darkMode ? 'border-white/5' : 'border-slate-200'
          }`}>
            
            {/* Brand Info */}
            <div className="md:col-span-5 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                  SP
                </div>
                <span className={`text-base font-black tracking-tight bg-clip-text text-transparent ${
                  darkMode ? 'bg-gradient-to-r from-cyan-400 to-purple-400' : 'bg-gradient-to-r from-cyan-600 to-purple-600'
                }`}>
                  StockPredict AI PRO
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold">
                  v2.0
                </span>
              </div>
              <p className={`text-xs leading-relaxed max-w-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                Advanced AI-powered stock peak (High Price) multi-model prediction system.
              </p>
            </div>

            {/* Quick Navigation Links */}
            <div className="md:col-span-4 flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setActiveTab('predictor')}
                className={`hover:text-cyan-500 transition-colors ${activeTab === 'predictor' ? 'text-cyan-500 font-bold' : darkMode ? 'text-gray-400' : 'text-slate-600'}`}
              >
                Predictor Engine
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`hover:text-cyan-500 transition-colors ${activeTab === 'analytics' ? 'text-cyan-500 font-bold' : darkMode ? 'text-gray-400' : 'text-slate-600'}`}
              >
                Analytics
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setActiveTab('stats')}
                className={`hover:text-cyan-500 transition-colors ${activeTab === 'stats' ? 'text-cyan-500 font-bold' : darkMode ? 'text-gray-400' : 'text-slate-600'}`}
              >
                Dataset Stats
              </button>
              <span>&bull;</span>
              <button 
                onClick={() => setActiveTab('about')}
                className={`hover:text-cyan-500 transition-colors ${activeTab === 'about' ? 'text-cyan-500 font-bold' : darkMode ? 'text-gray-400' : 'text-slate-600'}`}
              >
                Model Metrics
              </button>
            </div>

            {/* Status & Badges */}
            <div className="md:col-span-3 flex md:justify-end items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-[11px] ${
                darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={backendStatus.connected ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                  {backendStatus.connected ? 'FastAPI Active' : 'FastAPI Offline'}
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] ${
            darkMode ? 'text-gray-500' : 'text-slate-500'
          }`}>
            <div>
              &copy; {new Date().getFullYear()} StockPredict AI &bull; Built with React 19 & FastAPI
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-bold">Linear</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-bold">Polynomial</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">SVR</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
