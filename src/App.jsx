import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  User,
  CreditCard,
  Wifi,
  Shield,
  Smartphone,
  BarChart3,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Database,
  Server,
  Cpu,
  FileJson,
  FileText,
  Brain,
  Menu,
  X,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ClienteInsight = () => {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [formStep, setFormStep] = useState(1); // 1: Contrato, 2: Servicios
  const [displayScore, setDisplayScore] = useState(0); // Para animación del contador
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Para menú móvil
  const [openAccordion, setOpenAccordion] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [useRealAPI, setUseRealAPI] = useState(true); // Para acordeones de documentación

  // METADATA REAL DEL MODELO (Extraída de metadata.json)
  const MODEL_METADATA = {
    name: "Logistic Regression Optimizado",
    version: "1.0.0",
    date: "2025-11-28",
    auc: 0.8505,
    accuracy: "85.05%",
    recall: "79.68%",
    features: 39,
    environment: "Google Colab / Vercel Serverless"
  };

  // Estado del formulario alineado con las features requeridas por preprocessor.pkl
  const [formData, setFormData] = useState({
    // Demographics
    gender: 'Male',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',

    // Services
    PhoneService: 'Yes',
    MultipleLines: 'No',
    InternetService: 'Fiber optic',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',

    // Account
    tenure: 12,
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 70.0,
    TotalCharges: 840.0 // tenure * monthly (estimado inicial)
  });

  const [prediction, setPrediction] = useState(null);

  // Efecto para animar el contador cuando aparece el resultado
  useEffect(() => {
    if (showResult && prediction) {
      let start = 0;
      const end = prediction.score;
      const duration = 2000; // 2 segundos
      const increment = end / (duration / 16); // 60 FPS

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayScore(end);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [showResult, prediction]);
  // Verificar estado de la API al cargar
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const res = await fetch('/api/predict');
        const data = await res.json();
        if (data.status === 'ok') {
          setApiStatus('online');
          console.log('API conectada:', data.model_info);
        } else {
          setApiStatus('offline');
          setUseRealAPI(false);
        }
      } catch (e) {
        setApiStatus('offline');
        setUseRealAPI(false);
        console.log('API no disponible, usando simulación');
      }
    };
    checkAPI();
  }, []);


  
  // Predicción usando API real o simulación local
  const calculateChurnRisk = async () => {
    setLoading(true);
    setShowResult(false);

    if (useRealAPI && apiStatus === 'online') {
      // Usar API real
      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (data.success) {
          const factors = [];
          
          // Generar factores basados en los datos
          if (formData.Contract === 'Month-to-month') {
            factors.push({ name: 'Contrato: Mensual', impact: 'Crítico', color: 'text-red-400', weight: '+High' });
          } else if (formData.Contract === 'Two year') {
            factors.push({ name: 'Contrato: 2 Años', impact: 'Protector', color: 'text-emerald-400', weight: '-High' });
          }
          if (formData.InternetService === 'Fiber optic') {
            factors.push({ name: 'Servicio: Fibra Óptica', impact: 'Alto', color: 'text-orange-400', weight: '+Med' });
          }
          if (formData.tenure < 6) {
            factors.push({ name: 'Antigüedad: Baja', impact: 'Alto', color: 'text-red-400', weight: '+Med' });
          }
          if (formData.PaymentMethod === 'Electronic check') {
            factors.push({ name: 'Pago: Cheque Electrónico', impact: 'Medio', color: 'text-orange-300', weight: '+Low' });
          }
          if (formData.TechSupport === 'Yes') {
            factors.push({ name: 'Soporte Técnico: Activo', impact: 'Protector', color: 'text-emerald-400', weight: '-Med' });
          }

          setPrediction({
            score: data.prediction.score,
            level: data.prediction.risk_level,
            factors: factors,
            isRealPrediction: true
          });
          
          setLoading(false);
          setShowResult(true);
          return;
        }
      } catch (error) {
        console.error('Error en API, usando simulación:', error);
      }
    }

    // Fallback: Simulación local
    setTimeout(() => {
      let logit = -1.5;
      const factors = [];

      if (formData.Contract === 'Month-to-month') {
        logit += 2.5;
        factors.push({ name: 'Contrato: Mensual', impact: 'Crítico', color: 'text-red-400', weight: '+High' });
      } else if (formData.Contract === 'Two year') {
        logit -= 1.5;
        factors.push({ name: 'Contrato: 2 Años', impact: 'Protector', color: 'text-emerald-400', weight: '-High' });
      }

      if (formData.InternetService === 'Fiber optic') {
        logit += 1.2;
        factors.push({ name: 'Servicio: Fibra Óptica', impact: 'Alto', color: 'text-orange-400', weight: '+Med' });
      }

      logit -= (formData.tenure / 72) * 2.0;
      if (formData.tenure < 6) factors.push({ name: 'Antigüedad: Baja', impact: 'Alto', color: 'text-red-400', weight: '+Med' });

      if (formData.PaymentMethod === 'Electronic check') {
        logit += 0.8;
        factors.push({ name: 'Pago: Cheque Electrónico', impact: 'Medio', color: 'text-orange-300', weight: '+Low' });
      }

      if (formData.TechSupport === 'No' && formData.InternetService !== 'No') logit += 0.6;
      if (formData.OnlineSecurity === 'No' && formData.InternetService !== 'No') logit += 0.5;
      if (formData.PaperlessBilling === 'Yes') logit += 0.3;
      if (formData.SeniorCitizen === 1) logit += 0.2;

      const probability = 1 / (1 + Math.exp(-logit));
      const percentage = Math.round(probability * 100);

      let riskLevel = 'Bajo';
      if (percentage > 35) riskLevel = 'Medio';
      if (percentage > 65) riskLevel = 'Crítico';

      setPrediction({
        score: percentage,
        level: riskLevel,
        factors: factors,
        isRealPrediction: false
      });

      setLoading(false);
      setShowResult(true);
    }, 1200);
  };

  const handleInputChange = (field, value) => {
    let newValues = { [field]: value };

    // Auto-actualizar TotalCharges si cambia tenure o monthly
    if (field === 'tenure' || field === 'MonthlyCharges') {
      const t = field === 'tenure' ? value : formData.tenure;
      const m = field === 'MonthlyCharges' ? value : formData.MonthlyCharges;
      newValues.TotalCharges = (t * m).toFixed(2);
    }

    setFormData(prev => ({ ...prev, ...newValues }));
  };

  const ToggleButton = ({ label, field, value }) => (
    <button
      onClick={() => handleInputChange(field, value === 'Yes' ? 'No' : 'Yes')}
      className={`relative w-full p-3 rounded-lg border text-left transition-all flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        value === 'Yes'
          ? 'bg-indigo-500/20 border-indigo-500/40 text-white'
          : 'bg-slate-700/60 border-slate-600/50 text-slate-300 hover:border-slate-600'
      }`}
      role="switch"
      aria-checked={value === 'Yes'}
      aria-label={`${label}: ${value === 'Yes' ? 'Activado' : 'Desactivado'}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className={`relative w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${
        value === 'Yes' ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-slate-600'
      }`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          value === 'Yes' ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </button>
  );

  // Componente Accordion para la sección de Documentación
  const AccordionItem = ({ icon: Icon, title, children, index }) => {
    const isOpen = openAccordion === index;

    return (
      <div className="glass-card glass-card-hover border border-slate-700/50 rounded-xl overflow-hidden hover:border-indigo-500/40 transition-all shadow-lg shadow-indigo-500/10">
        <button
          onClick={() => setOpenAccordion(isOpen ? null : index)}
          className="w-full p-6 flex items-center justify-between text-left transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset hover:bg-slate-700/40 hover:shadow-lg"
          aria-expanded={isOpen}
          aria-controls={`accordion-content-${index}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Icon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            id={`accordion-content-${index}`}
            className="px-6 pb-6 text-slate-300 leading-relaxed animate-fadeInDown"
            role="region"
          >
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080810] via-[#0F0F1A] to-[#1E1E2E] text-slate-100 font-sans">
      {/* Skip Link para accesibilidad */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-blue focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Saltar al contenido principal
      </a>

      {/* Fondo animado con colores de marca (degradado 120° azul #0037FF → rojo #fd371d) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[180px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-[180px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10">

      {/* Header/Navbar */}
      <header className="bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-purple-500/10 glass-dark backdrop-blur-xl border-b border-slate-700/30 shadow-lg sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            {/* Logo Cliente Insight */}
            <a href="#" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:rounded-lg">
              <img
                src="/logo.png"
                alt="Cliente Insight - Conoce quién se queda. Anticípate a quien se va"
                className="h-16 sm:h-20 md:h-24 w-auto"
              />
            </a>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-6 text-slate-300 text-sm" role="navigation" aria-label="Navegación principal">
              <a href="#" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:rounded px-2 py-1">Inicio</a>
              <a href="#diagnosticar" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:rounded px-2 py-1">Predicción</a>
              <a href="#documentacion" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:rounded px-2 py-1">Documentación</a>
            </nav>

            {/* Botón Menú Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Menú Móvil */}
          {mobileMenuOpen && (
            <nav
              className="md:hidden mt-4 pb-4 border-t border-slate-700/50 pt-4 animate-fadeInDown"
              role="navigation"
              aria-label="Navegación móvil"
            >
              <div className="flex flex-col gap-4">
                <a
                  href="#"
                  className="text-slate-300 hover:text-white py-2 px-4 rounded-lg hover:bg-slate-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inicio
                </a>
                <a
                  href="#diagnosticar"
                  className="text-slate-300 hover:text-white py-2 px-4 rounded-lg hover:bg-slate-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Predicción
                </a>
                <a
                  href="#documentacion"
                  className="text-slate-300 hover:text-white py-2 px-4 rounded-lg hover:bg-slate-700/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documentación
                </a>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Eslogan de marca */}
              <p className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-4">
                Conoce quién se queda. Anticípate a quien se va.
              </p>
              <h2 id="hero-heading" className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Descubre <span className="text-brand-gradient bg-clip-text">Cliente Insight</span>
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Un modelo de inteligencia artificial diseñado para predecir la probabilidad de abandono de clientes
                y proporcionar información útil sobre retención de clientes en telecomunicaciones.
              </p>

              {/* Dual CTA - Botones de Acción Principal y Secundaria */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Botón Primario - Acción Principal con degradado de marca */}
                <button
                  onClick={() => document.getElementById('diagnosticar')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center gap-2"
                  aria-label="Ir a la sección de diagnóstico"
                >
                  <ArrowRight className="w-5 h-5" />
                  Iniciar Predicción
                </button>

                {/* Botón Secundario - Acción Alternativa */}
                <button
                  onClick={() => document.getElementById('documentacion')?.scrollIntoView({ behavior: 'smooth' })}
                  className="glass-card glass-card-hover border border-slate-700/50 hover:border-indigo-500/40 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center gap-2"
                  aria-label="Ir a la sección de documentación"
                >
                  <BookOpen className="w-5 h-5" />
                  Ver Documentación
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="glass-card glass-card-hover rounded-3xl shadow-2xl p-8 border border-slate-700/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#0037FF]/20 to-[#0037FF]/10 rounded-2xl p-5 border border-indigo-500/30">
                    <div className="text-3xl font-bold text-indigo-400 mb-1">{MODEL_METADATA.accuracy}</div>
                    <div className="text-xs text-slate-300 font-medium">Precisión del Modelo</div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-500/15 to-pink-500/10 rounded-2xl p-5 border border-rose-500/30">
                    <div className="text-3xl font-bold text-rose-400 mb-1">8 de 10</div>
                    <div className="text-xs text-slate-300 font-medium">Predicciones Correctas</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl p-5 border border-emerald-500/30">
                    <div className="text-3xl font-bold text-emerald-300 mb-1">+25%</div>
                    <div className="text-xs text-slate-300 font-medium">Retención de Clientes</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl p-5 border border-amber-500/30">
                    <div className="text-3xl font-bold text-amber-300 mb-1">Tiempo Real</div>
                    <div className="text-xs text-slate-300 font-medium">Análisis Instantáneo</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium">Inteligencia Artificial Avanzada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-brand-gradient bg-clip-text mb-4">¿Cómo Funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="glass-card rounded-2xl p-8 border border-slate-700/30 shadow-card hover:border-indigo-500/40 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-indigo-500/30">1</div>
              <h3 className="text-xl font-bold text-white mb-3">Sube tu Información</h3>
              <p className="text-slate-300 leading-relaxed">
                Proporciona datos del contrato y respuestas a cuestionarios sobre servicios del cliente.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 border border-slate-700/30 shadow-card hover:border-rose-500/50 transition-colors">
              <div className="w-14 h-14 bg-brand-gradient text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-indigo-500/30">2</div>
              <h3 className="text-xl font-bold text-white mb-3">Análisis con IA</h3>
              <p className="text-slate-300 leading-relaxed">
                Nuestra IA procesa los datos con modelos avanzados para detectar posibles patrones de abandono.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8 border border-slate-700/30 shadow-card hover:border-indigo-500/40 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-rose-500/30">3</div>
              <h3 className="text-xl font-bold text-white mb-3">Obtén tu Resultado</h3>
              <p className="text-slate-300 leading-relaxed">
                Recibe un informe con una estimación de riesgo y recomendaciones para la retención del cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario principal */}
      <section id="diagnosticar" className="py-16" aria-labelledby="main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 id="main-content" className="text-3xl font-bold text-white mb-4">Configurar Predicción</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Configura los parámetros del cliente y ejecuta el modelo para obtener la probabilidad de churn.
            </p>
          </div>

          {/* Indicador de Progreso */}
          <div className="mb-10">
            <div className="flex items-center justify-center max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  formStep >= 1 ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm shadow-indigo-500/25' : 'bg-slate-700 text-slate-400'
                }`}>
                  1
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  formStep >= 1 ? 'text-white' : 'text-slate-400'
                }`}>Contrato</span>
              </div>

              <div className="flex-1 h-1 bg-slate-700 mx-4 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-600 transition-all duration-500 ${
                  formStep >= 2 ? 'w-full' : 'w-0'
                }`}></div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  formStep >= 2 ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm shadow-indigo-500/25' : 'bg-slate-700 text-slate-400'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  formStep >= 2 ? 'text-white' : 'text-slate-400'
                }`}>Servicios</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

          {/* Columna izquierda: Datos de Contrato & Facturación */}
          <div className="lg:col-span-1 space-y-6">

            {/* Datos de Contrato & Facturación */}
            <div className="glass-card glass-card-hover border border-slate-700/50 rounded-2xl p-6 shadow-card hover:border-slate-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-xl border border-indigo-500/30">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Contrato & Facturación</h3>
              </div>

              <div className="space-y-5">
                {/* Tipo de Contrato */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Tipo de Contrato</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Month-to-month', 'One year', 'Two year'].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleInputChange('Contract', type)}
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          formData.Contract === type
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                        }`}
                        role="radio"
                        aria-checked={formData.Contract === type}
                      >
                        {type === 'Month-to-month' ? 'Mensual' : type === 'One year' ? '1 año' : '2 años'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Antigüedad */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Antigüedad
                    <span className="ml-2 text-indigo-400 font-bold">{formData.tenure} meses</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="72"
                    value={formData.tenure}
                    onChange={(e) => handleInputChange('tenure', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-slate-300 mt-1">
                    <span>0m</span>
                    <span>72m</span>
                  </div>
                </div>

                {/* Cargos Mensuales */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Cargos Mensuales
                    <span className="ml-2 text-indigo-400 font-bold">${formData.MonthlyCharges}</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="120"
                    step="0.5"
                    value={formData.MonthlyCharges}
                    onChange={(e) => handleInputChange('MonthlyCharges', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-slate-300 mt-1">
                    <span>$18</span>
                    <span>$120</span>
                  </div>
                </div>

                {/* Total Acumulado */}
                <div className="p-4 bg-slate-700/60 rounded-xl border border-slate-600/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-medium">Total Acumulado</span>
                    <span className="text-lg font-bold text-white">${formData.TotalCharges}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Servicios */}
            <div className="glass-card glass-card-hover border border-slate-700/50 rounded-2xl p-6 shadow-card hover:border-slate-600/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-violet-500/20 rounded-lg border border-violet-500/30">
                  <Wifi className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Configuración de Servicios</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Servicio de Internet</label>
                  <select
                    value={formData.InternetService}
                    onChange={(e) => handleInputChange('InternetService', e.target.value)}
                    className="w-full bg-slate-700/60 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="Fiber optic">Fibra Óptica</option>
                    <option value="DSL">DSL</option>
                    <option value="No">Sin Internet</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Método de Pago</label>
                  <select
                    value={formData.PaymentMethod}
                    onChange={(e) => handleInputChange('PaymentMethod', e.target.value)}
                    className="w-full bg-slate-700/60 border border-slate-600/50 rounded-lg px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="Electronic check">Electronic Check</option>
                    <option value="Mailed check">Mailed Check</option>
                    <option value="Bank transfer (automatic)">Bank Transfer (Auto)</option>
                    <option value="Credit card (automatic)">Credit Card (Auto)</option>
                  </select>
                </div>

                <div className="pt-2 space-y-3">
                  <ToggleButton label="Soporte Técnico" field="TechSupport" value={formData.TechSupport} />
                  <ToggleButton label="Seguridad Online" field="OnlineSecurity" value={formData.OnlineSecurity} />
                  <ToggleButton label="Paperless Billing" field="PaperlessBilling" value={formData.PaperlessBilling} />
                  <ToggleButton label="Dependientes" field="Dependents" value={formData.Dependents} />
                </div>
              </div>
            </div>

            {/* Botón de ejecución con degradado de marca */}
            <button
              onClick={calculateChurnRisk}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              aria-label="Ejecutar predicción de abandono de cliente"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin"/>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Brain className="w-6 h-6" />
                  <span>Ejecutar Predicción</span>
                </>
              )}
            </button>
          </div>

          {/* Columna Derecha: Resultados */}
          <div className="lg:col-span-2 space-y-6">

            {/* Panel de Resultado */}
            <div className="glass-card glass-card-hover border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
              {!showResult && !loading && (
                <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-500/20 rounded-full mb-4 border border-indigo-500/30">
                    <Shield className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Listo para Predecir</h3>
                  <p className="text-slate-300 max-w-md">Configura los parámetros del cliente y ejecuta el modelo para obtener la probabilidad de churn.</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                  <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                    <div className="w-20 h-20 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Procesando...</h3>
                  <p className="text-sm text-slate-300">Analizando datos del cliente</p>
                </div>
              )}

              {showResult && prediction && (
                <div className="p-8">

                  {/* Círculo de probabilidad */}
                  <div className="text-center mb-8">
                    <div className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Probabilidad de Churn</div>
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                        <circle
                          cx="96" cy="96" r="88"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={553}
                          strokeDashoffset={553 - (553 * prediction.score) / 100}
                          strokeLinecap="round"
                          className={`${
                            prediction.level === 'Crítico' ? 'text-red-500' :
                            prediction.level === 'Medio' ? 'text-orange-500' :
                            'text-emerald-500'
                          } transition-all duration-2000 ease-out`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-white mb-1 tabular-nums">
                          {displayScore}%
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          prediction.level === 'Crítico' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          prediction.level === 'Medio' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          Riesgo {prediction.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Factores de influencia */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-xs uppercase text-slate-300 font-semibold tracking-wider pb-2 border-b border-slate-700/30">Factores Principales</h4>
                    {prediction.factors.map((factor, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-700/60 rounded-lg border border-slate-600/50 hover:border-slate-600 transition-colors">
                        <span className="text-sm text-slate-300">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-semibold ${factor.color.replace('text-red', 'text-red').replace('text-orange', 'text-orange').replace('text-emerald', 'text-emerald')}`}>{factor.weight}</span>
                          <div className={`w-2 h-2 rounded-full ${factor.color.replace('text', 'bg')}`}></div>
                        </div>
                      </div>
                    ))}
                    {prediction.factors.length === 0 && (
                      <p className="text-sm text-slate-300 italic text-center py-4">Sin factores de riesgo significativos</p>
                    )}
                  </div>

                  {/* Alerta crítica */}
                  {prediction.level === 'Crítico' && (
                    <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-red-300 font-semibold text-sm mb-1">⚠️ Alerta de Retención</h5>
                          <p className="text-red-200 text-xs leading-relaxed">Cliente en alto riesgo de abandono. Considere ofrecer incentivos o mejoras en el plan.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
          </div>
        </div>
      </section>

      {/* Prevención y Cuidado Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-6">Prevención y Cuidado</h2>
          <p className="text-center text-slate-300 mb-12 text-lg leading-relaxed">
            Aunque el churn es inevitable en telecomunicaciones, estudios han demostrado que ciertas estrategias pueden reducir el riesgo. Aquí te dejamos algunos consejos:
          </p>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 text-slate-300">
              <span className="text-2xl">🧠</span>
              <p className="text-base leading-relaxed"><strong className="text-white">Mejora la experiencia del cliente</strong> con un servicio de calidad y soporte técnico eficiente.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-300">
              <span className="text-2xl">💰</span>
              <p className="text-base leading-relaxed"><strong className="text-white">Ofrece planes competitivos</strong> manteniendo precios justos y promociones atractivas.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-300">
              <span className="text-2xl">🏃</span>
              <p className="text-base leading-relaxed"><strong className="text-white">Actúa rápidamente</strong> identificando clientes en riesgo y contactando proactivamente.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-300">
              <span className="text-2xl">🛌</span>
              <p className="text-base leading-relaxed"><strong className="text-white">Fideliza con beneficios</strong> mediante programas de lealtad y recompensas para clientes antiguos.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-300">
              <span className="text-2xl">👥</span>
              <p className="text-base leading-relaxed"><strong className="text-white">Mantén comunicación activa</strong> con encuestas de satisfacción y feedback constante.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-300">
              <span className="text-2xl">📊</span>
              <p className="text-base leading-relaxed"><strong className="text-white">Analiza datos regularmente</strong> usando IA para predecir y prevenir el abandono.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Documentación */}
      <section id="documentacion" className="py-20 bg-[#363333]/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-brand-gradient bg-clip-text mb-4">
              📚 Documentación
            </h2>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Aprende cómo funciona Cliente Insight, cómo interpretar los resultados y cómo utilizar la predicción de abandono para mejorar la retención de clientes.
            </p>
          </div>

          <div className="space-y-4">
            {/* Sección 1: Descripción General */}
            <AccordionItem icon={BookOpen} title="Descripción General del Proyecto" index={0}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">¿Qué es ClienteInsight?</h4>
                <p>
                  ClienteInsight es una aplicación web de inteligencia artificial diseñada específicamente para empresas de telecomunicaciones que buscan reducir la tasa de abandono de clientes (churn). Utilizando algoritmos avanzados de machine learning, la aplicación analiza múltiples variables del comportamiento y perfil del cliente para predecir la probabilidad de que abandone el servicio.
                </p>

                <h4 className="text-lg font-semibold text-white mt-6">Propósito</h4>
                <p>
                  El objetivo principal es proporcionar a las empresas de telecomunicaciones una herramienta predictiva que les permita:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Identificar clientes en riesgo de abandono antes de que se vayan</li>
                  <li>Tomar acciones preventivas personalizadas para cada cliente</li>
                  <li>Optimizar recursos enfocándose en los clientes de mayor riesgo</li>
                  <li>Mejorar la retención y reducir costos de adquisición de nuevos clientes</li>
                  <li>Aumentar el valor de vida del cliente (Customer Lifetime Value)</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mt-6">Beneficios</h4>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">💰 Reducción de Costos</p>
                    <p className="text-sm mt-2">Retener un cliente es 5-25 veces más barato que adquirir uno nuevo.</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">📊 Decisiones Basadas en Datos</p>
                    <p className="text-sm mt-2">Predicciones precisas basadas en análisis de datos históricos.</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">⚡ Acción Proactiva</p>
                    <p className="text-sm mt-2">Intervención temprana antes de que el cliente decida irse.</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">🎯 Personalización</p>
                    <p className="text-sm mt-2">Estrategias de retención adaptadas a cada perfil de cliente.</p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Tecnologías Utilizadas</h4>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-sm">React</span>
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-sm">Tailwind CSS</span>
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-sm">Machine Learning</span>
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-sm">Inteligencia Artificial</span>
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-sm">Análisis Predictivo</span>
                </div>
              </div>
            </AccordionItem>

            {/* Sección 2: Modelo de Predicción - ACTUALIZADO con info técnica real */}
            <AccordionItem icon={Brain} title="Modelo de Predicción - Cómo Funciona" index={1}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Algoritmo de Machine Learning</h4>
                <p>
                  ClienteInsight utiliza un modelo de <strong className="text-indigo-400">Regresión Logística Optimizada</strong> entrenado con datos históricos de clientes de telecomunicaciones del dataset Telco Customer Churn. El modelo fue entrenado en <strong className="text-indigo-400">Google Colab</strong> y desplegado como API serverless en Vercel.
                </p>

                <div className="bg-gradient-to-r from-indigo-900/40 to-violet-900/40 p-4 rounded-lg mt-4 border border-indigo-500/30">
                  <p className="font-semibold text-white mb-3">�� Modelo Implementado: Regresión Logística</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-indigo-400 font-medium">¿Por qué Regresión Logística?</p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Alta interpretabilidad de coeficientes</li>
                        <li>Probabilidades calibradas (0-100%)</li>
                        <li>Rápido tiempo de inferencia</li>
                        <li>Excelente para clasificación binaria</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-medium">Comparativa de Modelos Evaluados</p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li><strong>Random Forest:</strong> AUC 0.83</li>
                        <li><strong>XGBoost:</strong> AUC 0.84</li>
                        <li><strong>Logistic Regression:</strong> AUC <strong className="text-emerald-400">0.85</strong> ✓</li>
                        <li><strong>SVM:</strong> AUC 0.82</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Pipeline de Preprocesamiento</h4>
                <p>Los datos pasan por un <strong className="text-indigo-400">ColumnTransformer</strong> de scikit-learn:</p>

                <div className="bg-slate-800/50 p-4 rounded-lg mt-4 font-mono text-sm border border-slate-600">
                  <p className="text-emerald-400">ColumnTransformer Pipeline:</p>
                  <p className="text-slate-300 mt-2">├── <span className="text-yellow-400">StandardScaler</span> (9 features numéricas)</p>
                  <p className="text-slate-400 ml-6">└── Normaliza: mean=0, std=1</p>
                  <p className="text-slate-300 mt-1">└── <span className="text-yellow-400">OneHotEncoder</span> (10 features categóricas)</p>
                  <p className="text-slate-400 ml-6">└── drop='first' para evitar multicolinealidad</p>
                  <p className="text-indigo-400 mt-2">→ Total: <strong>39 features</strong> después del preprocesamiento</p>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Ingeniería de Features</h4>
                <p>Se crearon <strong className="text-indigo-400">6 features derivadas</strong> para mejorar el poder predictivo:</p>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm border border-slate-600 rounded-lg overflow-hidden">
                    <thead className="bg-indigo-900/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Feature</th>
                        <th className="px-3 py-2 text-left">Fórmula</th>
                        <th className="px-3 py-2 text-left">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800/30">
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2 font-mono text-indigo-400">Charge_Ratio</td>
                        <td className="px-3 py-2 font-mono text-xs">Total / (tenure × Monthly)</td>
                        <td className="px-3 py-2">Ratio pago real vs esperado</td>
                      </tr>
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2 font-mono text-indigo-400">Total_Services</td>
                        <td className="px-3 py-2 font-mono text-xs">Σ servicios = 'Yes'</td>
                        <td className="px-3 py-2">Cantidad de servicios activos</td>
                      </tr>
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2 font-mono text-indigo-400">AvgMonthlyCharges</td>
                        <td className="px-3 py-2 font-mono text-xs">TotalCharges / tenure</td>
                        <td className="px-3 py-2">Cargo mensual promedio histórico</td>
                      </tr>
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2 font-mono text-indigo-400">SeniorWithDependents</td>
                        <td className="px-3 py-2 font-mono text-xs">Senior × Dependents</td>
                        <td className="px-3 py-2">Interacción senior-dependientes</td>
                      </tr>
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2 font-mono text-indigo-400">HighValueContract</td>
                        <td className="px-3 py-2 font-mono text-xs">Contract≠M2M & Charges{'>'}70</td>
                        <td className="px-3 py-2">Cliente premium con compromiso</td>
                      </tr>
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2 font-mono text-indigo-400">TenureGroup</td>
                        <td className="px-3 py-2 font-mono text-xs">Categorización</td>
                        <td className="px-3 py-2">0-1, 1-2, 2-4, 4+ años</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Balanceo de Clases</h4>
                <p>El dataset original tiene <strong className="text-orange-400">desbalance de clases</strong> (~73% No Churn, ~27% Churn). Se aplicaron técnicas de balanceo:</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400 mb-2">Dataset Original</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-600 rounded-full h-4 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{width: '73%'}}></div>
                      </div>
                      <span className="text-xs whitespace-nowrap">73% No Churn</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-full bg-slate-600 rounded-full h-4 overflow-hidden">
                        <div className="bg-red-500 h-full" style={{width: '27%'}}></div>
                      </div>
                      <span className="text-xs whitespace-nowrap">27% Churn</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">5,634 muestras de entrenamiento</p>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-emerald-400 mb-2">Técnica: SMOTE + class_weight</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>SMOTE:</strong> Genera muestras sintéticas de la clase minoritaria</li>
                      <li><strong>class_weight='balanced':</strong> Ajusta pesos inversamente proporcionales</li>
                      <li>Resultado: 2,990 muestras balanceadas</li>
                    </ul>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Métricas Reales del Modelo</h4>
                <p>
                  Métricas evaluadas en el conjunto de prueba (20% de los datos) con validación cruzada de 5 folds:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 rounded-lg text-center border border-emerald-500/30">
                    <p className="text-2xl font-bold text-emerald-400">85.05%</p>
                    <p className="text-xs text-slate-300 mt-1">ROC-AUC</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 rounded-lg text-center border border-indigo-500/30">
                    <p className="text-2xl font-bold text-white">79.68%</p>
                    <p className="text-xs text-slate-300 mt-1">Recall</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 rounded-lg text-center border border-indigo-500/30">
                    <p className="text-2xl font-bold text-white">50.77%</p>
                    <p className="text-xs text-slate-300 mt-1">Precision</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 rounded-lg text-center border border-indigo-500/30">
                    <p className="text-2xl font-bold text-white">62.02%</p>
                    <p className="text-xs text-slate-300 mt-1">F1-Score</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">
                  Cross-Validation (5-fold): 83.89% ± 1.09% | Entrenamiento: Google Colab | Deployment: Vercel Serverless
                </p>
              </div>
            </AccordionItem>
            {/* Sección 3: Guía de Uso */}
            <AccordionItem icon={FileText} title="Guía de Uso - Cómo Interpretar los Resultados" index={2}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Cómo Completar el Formulario</h4>
                <p>
                  El formulario de predicción está dividido en <strong className="text-indigo-400">2 pasos principales</strong> para facilitar la entrada de datos:
                </p>

                <div className="bg-slate-700/30 p-4 rounded-lg mt-4">
                  <p className="font-semibold text-white mb-3">📋 Paso 1: Información del Contrato</p>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Antigüedad (Tenure):</strong> Número de meses que el cliente ha estado con la empresa (0-72 meses)</li>
                    <li><strong>Tipo de Contrato:</strong> Month-to-month (mes a mes), One year (un año), o Two year (dos años)</li>
                    <li><strong>Método de Pago:</strong> Electronic check, Mailed check, Bank transfer, o Credit card</li>
                    <li><strong>Cargos Mensuales:</strong> Monto que el cliente paga mensualmente ($18-$120)</li>
                    <li><strong>Cargos Totales:</strong> Se calcula automáticamente (Antigüedad × Cargos Mensuales)</li>
                  </ul>
                </div>

                <div className="bg-slate-700/30 p-4 rounded-lg mt-4">
                  <p className="font-semibold text-white mb-3">📡 Paso 2: Servicios Contratados</p>
                  <ul className="space-y-2 text-sm">
                    <li><strong>Servicio de Internet:</strong> No, DSL, o Fiber optic</li>
                    <li><strong>Servicios Adicionales:</strong> Phone Service, Online Security, Online Backup, Device Protection, Tech Support, Streaming TV, Streaming Movies</li>
                    <li><strong>Información Demográfica:</strong> Senior Citizen, Partner, Dependents</li>
                    <li><strong>Facturación:</strong> Paperless Billing (facturación sin papel)</li>
                  </ul>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Interpretación de Resultados</h4>
                <p>
                  Una vez completado el formulario, el sistema mostrará un <strong className="text-indigo-400">score de riesgo de 0 a 100%</strong> que indica la probabilidad de que el cliente abandone el servicio:
                </p>

                <div className="space-y-3 mt-4">
                  <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-emerald-500/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Riesgo Bajo (0-33%)</p>
                        <p className="text-sm text-emerald-300">Cliente Estable</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      El cliente tiene baja probabilidad de abandono. Mantén la calidad del servicio y considera programas de fidelización para fortalecer la relación.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-orange-500/30 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Riesgo Medio (34-66%)</p>
                        <p className="text-sm text-orange-300">Requiere Atención</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      El cliente muestra señales de posible abandono. Implementa estrategias de retención como descuentos, mejoras de servicio o contacto personalizado.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">Riesgo Crítico (67-100%)</p>
                        <p className="text-sm text-red-300">Acción Inmediata</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      El cliente tiene alta probabilidad de abandono. Requiere intervención urgente: contacto directo, ofertas especiales, resolución de problemas o mejora de plan.
                    </p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Recomendaciones Basadas en el Nivel de Riesgo</h4>
                <p>
                  El sistema proporciona recomendaciones automáticas personalizadas según el nivel de riesgo detectado. Estas incluyen:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                  <li>Estrategias de comunicación específicas</li>
                  <li>Ofertas y descuentos sugeridos</li>
                  <li>Mejoras de servicio recomendadas</li>
                  <li>Timing óptimo para la intervención</li>
                  <li>Canales de contacto más efectivos</li>
                </ul>
              </div>
            </AccordionItem>

            {/* Sección 4: Métricas y Variables - ACTUALIZADO con 39 features reales */}
            <AccordionItem icon={BarChart3} title="Métricas y Variables Utilizadas" index={3}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Arquitectura de Features</h4>
                <p>
                  El modelo procesa un total de <strong className="text-indigo-400">39 features</strong> después del preprocesamiento, organizadas en tres categorías:
                </p>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 p-4 rounded-lg border border-indigo-500/30">
                    <p className="font-bold text-2xl text-indigo-400">9</p>
                    <p className="text-sm text-white">Features Numéricas</p>
                    <p className="text-xs text-slate-400 mt-1">Normalizadas con StandardScaler</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 p-4 rounded-lg border border-emerald-500/30">
                    <p className="font-bold text-2xl text-emerald-400">30</p>
                    <p className="text-sm text-white">Features Categóricas</p>
                    <p className="text-xs text-slate-400 mt-1">One-Hot Encoded (drop='first')</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 p-4 rounded-lg border border-orange-500/30">
                    <p className="font-bold text-2xl text-orange-400">6</p>
                    <p className="text-sm text-white">Features Derivadas</p>
                    <p className="text-xs text-slate-400 mt-1">Ingeniería de características</p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Features Numéricas (9)</h4>
                <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-600">
                  <table className="w-full text-sm">
                    <thead className="bg-indigo-900/50">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Feature</th>
                        <th className="px-3 py-2 text-left">Tipo</th>
                        <th className="px-3 py-2 text-left">Rango/Descripción</th>
                        <th className="px-3 py-2 text-left">Impacto</th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800/30">
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2">0</td>
                        <td className="px-3 py-2 font-mono text-indigo-400">SeniorCitizen</td>
                        <td className="px-3 py-2">Original</td>
                        <td className="px-3 py-2">0 o 1</td>
                        <td className="px-3 py-2 text-yellow-400">Medio</td>
                      </tr>
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2">1</td>
                        <td className="px-3 py-2 font-mono text-indigo-400">tenure</td>
                        <td className="px-3 py-2">Original</td>
                        <td className="px-3 py-2">0-72 meses</td>
                        <td className="px-3 py-2 text-red-400">🔴 Alto</td>
                      </tr>
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2">2</td>
                        <td className="px-3 py-2 font-mono text-indigo-400">MonthlyCharges</td>
                        <td className="px-3 py-2">Original</td>
                        <td className="px-3 py-2">$18-$120</td>
                        <td className="px-3 py-2 text-red-400">🔴 Alto</td>
                      </tr>
                      <tr className="border-t border-slate-700">
                        <td className="px-3 py-2">3</td>
                        <td className="px-3 py-2 font-mono text-indigo-400">TotalCharges</td>
                        <td className="px-3 py-2">Original</td>
                        <td className="px-3 py-2">Acumulado histórico</td>
                        <td className="px-3 py-2 text-yellow-400">Medio</td>
                      </tr>
                      <tr className="border-t border-slate-700 bg-emerald-900/20">
                        <td className="px-3 py-2">4</td>
                        <td className="px-3 py-2 font-mono text-emerald-400">Charge_Ratio</td>
                        <td className="px-3 py-2">Derivada</td>
                        <td className="px-3 py-2">Total/(tenure×Monthly)</td>
                        <td className="px-3 py-2 text-yellow-400">Medio</td>
                      </tr>
                      <tr className="border-t border-slate-700 bg-emerald-900/20">
                        <td className="px-3 py-2">5</td>
                        <td className="px-3 py-2 font-mono text-emerald-400">Total_Services</td>
                        <td className="px-3 py-2">Derivada</td>
                        <td className="px-3 py-2">Suma servicios (0-8)</td>
                        <td className="px-3 py-2 text-yellow-400">Medio</td>
                      </tr>
                      <tr className="border-t border-slate-700 bg-emerald-900/20">
                        <td className="px-3 py-2">6</td>
                        <td className="px-3 py-2 font-mono text-emerald-400">AvgMonthlyCharges</td>
                        <td className="px-3 py-2">Derivada</td>
                        <td className="px-3 py-2">TotalCharges/tenure</td>
                        <td className="px-3 py-2 text-yellow-400">Medio</td>
                      </tr>
                      <tr className="border-t border-slate-700 bg-emerald-900/20">
                        <td className="px-3 py-2">7</td>
                        <td className="px-3 py-2 font-mono text-emerald-400">SeniorWithDependents</td>
                        <td className="px-3 py-2">Derivada</td>
                        <td className="px-3 py-2">Interacción</td>
                        <td className="px-3 py-2 text-slate-400">Bajo</td>
                      </tr>
                      <tr className="border-t border-slate-700 bg-emerald-900/20">
                        <td className="px-3 py-2">8</td>
                        <td className="px-3 py-2 font-mono text-emerald-400">HighValueContract</td>
                        <td className="px-3 py-2">Derivada</td>
                        <td className="px-3 py-2">Cliente premium (0/1)</td>
                        <td className="px-3 py-2 text-emerald-400">🟢 Protector</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Features Categóricas One-Hot (30)</h4>
                <p className="text-sm text-slate-300 mb-4">Después de aplicar OneHotEncoder con drop='first', las 10 variables categóricas se expanden a 30 columnas binarias:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400 mb-2">📋 Contrato & Cuenta</p>
                    <ul className="text-sm space-y-1 font-mono">
                      <li>• gender_Male</li>
                      <li>• Partner_Yes</li>
                      <li>• Dependents_Yes</li>
                      <li>• Contract_One year</li>
                      <li>• Contract_Two year <span className="text-emerald-400">← Protector</span></li>
                      <li>• PaperlessBilling_Yes</li>
                      <li>• PaymentMethod_Credit card</li>
                      <li>• PaymentMethod_Electronic check <span className="text-red-400">← Riesgo</span></li>
                      <li>• PaymentMethod_Mailed check</li>
                    </ul>
                  </div>
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400 mb-2">📡 Servicios</p>
                    <ul className="text-sm space-y-1 font-mono">
                      <li>• PhoneService_Yes</li>
                      <li>• MultipleLines_No phone/Yes</li>
                      <li>• InternetService_Fiber optic <span className="text-orange-400">← Riesgo</span></li>
                      <li>• InternetService_No</li>
                      <li>• OnlineSecurity_No internet/Yes</li>
                      <li>• OnlineBackup_No internet/Yes</li>
                      <li>• DeviceProtection_No internet/Yes</li>
                      <li>• TechSupport_No internet/Yes <span className="text-emerald-400">← Protector</span></li>
                      <li>• StreamingTV_No internet/Yes</li>
                      <li>• StreamingMovies_No internet/Yes</li>
                      <li>• TenureGroup_1-2 años/2-4/4+</li>
                    </ul>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Top 10 Features por Importancia</h4>
                <p className="text-sm text-slate-300 mb-4">Basado en la magnitud de los coeficientes del modelo de Regresión Logística:</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-400 w-6">1</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-mono">Contract_Two year</span>
                        <span className="text-emerald-400">-1.52 (Protege)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3"><div className="bg-emerald-500 h-full rounded-full" style={{width: '100%'}}></div></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-400 w-6">2</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-mono">InternetService_Fiber optic</span>
                        <span className="text-red-400">+0.69 (Riesgo)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3"><div className="bg-red-500 h-full rounded-full" style={{width: '45%'}}></div></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-400 w-6">3</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-mono">Contract_One year</span>
                        <span className="text-emerald-400">-0.68 (Protege)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3"><div className="bg-emerald-500 h-full rounded-full" style={{width: '44%'}}></div></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-400 w-6">4</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-mono">PhoneService_Yes</span>
                        <span className="text-emerald-400">-0.65 (Protege)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3"><div className="bg-emerald-500 h-full rounded-full" style={{width: '42%'}}></div></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-400 w-6">5</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-mono">tenure</span>
                        <span className="text-emerald-400">-0.58 (Protege)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3"><div className="bg-emerald-500 h-full rounded-full" style={{width: '38%'}}></div></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/30 p-4 rounded-lg mt-6">
                  <p className="font-semibold text-white mb-2">📊 Interpretación de Coeficientes</p>
                  <ul className="text-sm space-y-1">
                    <li>• <span className="text-emerald-400">Coeficientes negativos</span> = Reducen probabilidad de churn (factores protectores)</li>
                    <li>• <span className="text-red-400">Coeficientes positivos</span> = Aumentan probabilidad de churn (factores de riesgo)</li>
                    <li>• La magnitud indica la fuerza del impacto en la predicción</li>
                  </ul>
                </div>
              </div>
            </AccordionItem>
            {/* Sección 5: Metodología - ACTUALIZADO con detalles técnicos */}
            <AccordionItem icon={Database} title="Metodología del Análisis de Abandono" index={4}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Dataset: Telco Customer Churn</h4>
                <p>
                  El modelo fue entrenado con el dataset <strong className="text-indigo-400">IBM Telco Customer Churn</strong>, un conjunto de datos estándar de la industria para análisis de abandono en telecomunicaciones:
                </p>
                
                <div className="grid md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                    <p className="text-xl font-bold text-indigo-400">7,043</p>
                    <p className="text-xs text-slate-300">Registros totales</p>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                    <p className="text-xl font-bold text-emerald-400">5,634</p>
                    <p className="text-xs text-slate-300">Train set (80%)</p>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                    <p className="text-xl font-bold text-orange-400">1,409</p>
                    <p className="text-xs text-slate-300">Test set (20%)</p>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg text-center">
                    <p className="text-xl font-bold text-violet-400">21</p>
                    <p className="text-xs text-slate-300">Variables originales</p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Proceso de Limpieza de Datos</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-500/30 text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                      <div>
                        <strong className="text-white">Manejo de valores nulos:</strong>
                        <span className="text-slate-300"> TotalCharges con espacios vacíos → convertidos a 0 o imputados con mediana</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-500/30 text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                      <div>
                        <strong className="text-white">Conversión de tipos:</strong>
                        <span className="text-slate-300"> SeniorCitizen de Yes/No a 0/1, TotalCharges de string a float</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-500/30 text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
                      <div>
                        <strong className="text-white">Eliminación de columnas:</strong>
                        <span className="text-slate-300"> customerID (no predictivo)</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-indigo-500/30 text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
                      <div>
                        <strong className="text-white">Target encoding:</strong>
                        <span className="text-slate-300"> Churn: Yes=1, No=0</span>
                      </div>
                    </li>
                  </ol>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Optimización de Hiperparámetros</h4>
                <p>
                  Se utilizó <strong className="text-indigo-400">GridSearchCV</strong> con validación cruzada de 5 folds para encontrar los mejores hiperparámetros:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400 mb-3">🔧 Hiperparámetros Explorados</p>
                    <ul className="text-sm space-y-2 font-mono">
                      <li>• <span className="text-yellow-400">C:</span> [0.001, 0.01, 0.1, 1, 10]</li>
                      <li>• <span className="text-yellow-400">solver:</span> ['liblinear', 'lbfgs', 'saga']</li>
                      <li>• <span className="text-yellow-400">penalty:</span> ['l1', 'l2']</li>
                      <li>• <span className="text-yellow-400">class_weight:</span> [None, 'balanced']</li>
                      <li>• <span className="text-yellow-400">max_iter:</span> [100, 500, 1000]</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 p-4 rounded-lg border border-emerald-500/30">
                    <p className="font-semibold text-emerald-400 mb-3">✓ Mejores Parámetros Encontrados</p>
                    <ul className="text-sm space-y-2 font-mono">
                      <li>• <span className="text-emerald-400">C:</span> 1.0</li>
                      <li>• <span className="text-emerald-400">solver:</span> 'lbfgs'</li>
                      <li>• <span className="text-emerald-400">penalty:</span> 'l2'</li>
                      <li>• <span className="text-emerald-400">class_weight:</span> 'balanced'</li>
                      <li>• <span className="text-emerald-400">max_iter:</span> 500</li>
                    </ul>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Validación del Modelo</h4>
                <div className="bg-slate-700/30 p-4 rounded-lg">
                  <p className="font-semibold text-white mb-3">📊 Estrategia de Validación</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-indigo-400 font-medium">Train/Test Split</p>
                      <ul className="mt-2 space-y-1">
                        <li>• Estratificado por clase (Churn)</li>
                        <li>• 80% entrenamiento, 20% prueba</li>
                        <li>• random_state=42 para reproducibilidad</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-indigo-400 font-medium">Cross-Validation</p>
                      <ul className="mt-2 space-y-1">
                        <li>• 5-Fold Stratified CV</li>
                        <li>• Scoring: ROC-AUC</li>
                        <li>• Mean: 83.89% ± 1.09%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Identificación de Patrones de Riesgo</h4>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                    <p className="font-semibold text-red-400 mb-3">🚨 Señales de Alto Riesgo</p>
                    <ul className="text-sm space-y-1">
                      <li>• Contrato mes a mes (+2.5 en logit)</li>
                      <li>• Antigüedad menor a 6 meses</li>
                      <li>• Fibra óptica sin servicios adicionales</li>
                      <li>• Pago con electronic check</li>
                      <li>• Sin soporte técnico ni seguridad online</li>
                      <li>• Cargos mensuales {'>'} $80</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30">
                    <p className="font-semibold text-emerald-400 mb-3">✅ Factores Protectores</p>
                    <ul className="text-sm space-y-1">
                      <li>• Contrato de 2 años (-1.52 en logit)</li>
                      <li>• Antigüedad {'>'} 24 meses</li>
                      <li>• Múltiples servicios contratados</li>
                      <li>• Pago automático (bank/credit)</li>
                      <li>• Soporte técnico activo</li>
                      <li>• Servicios de protección/backup</li>
                    </ul>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Matriz de Confusión (Test Set)</h4>
                <div className="flex justify-center mt-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 inline-block">
                    <table className="text-sm">
                      <thead>
                        <tr>
                          <th className="px-4 py-2"></th>
                          <th className="px-4 py-2 text-emerald-400">Pred: No Churn</th>
                          <th className="px-4 py-2 text-red-400">Pred: Churn</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 text-emerald-400">Real: No Churn</td>
                          <td className="px-4 py-2 bg-emerald-900/30 text-center font-bold">~850 (TN)</td>
                          <td className="px-4 py-2 bg-red-900/20 text-center">~185 (FP)</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-red-400">Real: Churn</td>
                          <td className="px-4 py-2 bg-red-900/20 text-center">~76 (FN)</td>
                          <td className="px-4 py-2 bg-emerald-900/30 text-center font-bold">~298 (TP)</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs text-slate-400 mt-3 text-center">Recall alto (79.68%) = detectamos la mayoría de los clientes que abandonarán</p>
                  </div>
                </div>

                <h4 className="text-lg font-semibold text-white mt-6">Entorno de Desarrollo y Deployment</h4>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full text-sm">Python 3.10</span>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm">scikit-learn 1.6.1</span>
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-sm">Google Colab (Training)</span>
                  <span className="px-3 py-1 bg-slate-500/20 border border-slate-500/50 rounded-full text-sm">Vercel Serverless (API)</span>
                  <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-sm">NumPy (Inference)</span>
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-sm">React + Vite (Frontend)</span>
                </div>
              </div>
            </AccordionItem>
            {/* Sección 6: Glosario */}
            <AccordionItem icon={Info} title="Glosario de Términos Técnicos" index={5}>
              <div className="space-y-4">
                <p className="text-slate-300">
                  Definiciones de los términos técnicos utilizados en ClienteInsight:
                </p>

                <div className="space-y-4 mt-6">
                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Churn (Abandono de Clientes)</p>
                    <p className="text-sm mt-2">
                      Tasa de clientes que cancelan o no renuevan su servicio en un período determinado. Es una métrica clave para medir la salud del negocio y la satisfacción del cliente.
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Tenure (Antigüedad)</p>
                    <p className="text-sm mt-2">
                      Número de meses que un cliente ha estado activo con la empresa. Es un predictor importante: clientes con mayor antigüedad tienden a ser más leales.
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Contract (Tipo de Contrato)</p>
                    <p className="text-sm mt-2">
                      Duración del compromiso contractual del cliente:
                      <br/>• <strong>Month-to-month:</strong> Sin compromiso, puede cancelar en cualquier momento
                      <br/>• <strong>One year:</strong> Compromiso de 1 año
                      <br/>• <strong>Two year:</strong> Compromiso de 2 años (mayor estabilidad)
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">DSL vs Fiber Optic</p>
                    <p className="text-sm mt-2">
                      Tipos de conexión a internet:
                      <br/>• <strong>DSL (Digital Subscriber Line):</strong> Internet por línea telefónica, velocidades moderadas
                      <br/>• <strong>Fiber Optic:</strong> Internet por fibra óptica, velocidades muy altas pero a veces con mayor costo
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Streaming Services</p>
                    <p className="text-sm mt-2">
                      Servicios de transmisión de contenido en tiempo real:
                      <br/>• <strong>Streaming TV:</strong> Televisión en vivo por internet
                      <br/>• <strong>Streaming Movies:</strong> Películas y series bajo demanda
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Payment Method (Método de Pago)</p>
                    <p className="text-sm mt-2">
                      Forma en que el cliente paga su servicio:
                      <br/>• <strong>Electronic check:</strong> Cheque electrónico (asociado a mayor churn)
                      <br/>• <strong>Mailed check:</strong> Cheque por correo
                      <br/>• <strong>Bank transfer:</strong> Transferencia bancaria automática
                      <br/>• <strong>Credit card:</strong> Tarjeta de crédito (pago automático, menor churn)
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Monthly Charges (Cargos Mensuales)</p>
                    <p className="text-sm mt-2">
                      Monto que el cliente paga mensualmente por todos sus servicios. Cargos muy altos sin servicios adicionales pueden indicar baja percepción de valor.
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Total Charges (Cargos Totales)</p>
                    <p className="text-sm mt-2">
                      Suma acumulada de todos los pagos que el cliente ha realizado desde que se unió. Se calcula como: Tenure × Monthly Charges (aproximadamente).
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Machine Learning (Aprendizaje Automático)</p>
                    <p className="text-sm mt-2">
                      Rama de la inteligencia artificial que permite a los sistemas aprender patrones de los datos sin ser programados explícitamente. El modelo aprende de ejemplos históricos para hacer predicciones.
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Feature Importance (Importancia de Variables)</p>
                    <p className="text-sm mt-2">
                      Medida de cuánto contribuye cada variable a la predicción del modelo. Variables con mayor importancia tienen más peso en la decisión final.
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Precision, Recall, F1-Score</p>
                    <p className="text-sm mt-2">
                      Métricas de evaluación del modelo:
                      <br/>• <strong>Precision:</strong> De los clientes que predecimos que abandonarán, ¿cuántos realmente lo hacen?
                      <br/>• <strong>Recall:</strong> De todos los clientes que abandonaron, ¿cuántos detectamos?
                      <br/>• <strong>F1-Score:</strong> Balance entre precision y recall
                    </p>
                  </div>

                  <div className="bg-slate-700/30 p-4 rounded-lg">
                    <p className="font-semibold text-indigo-400">Customer Lifetime Value (CLV)</p>
                    <p className="text-sm mt-2">
                      Valor total que un cliente aporta a la empresa durante toda su relación. Retener clientes aumenta el CLV significativamente.
                    </p>
                  </div>
                </div>
              </div>
            </AccordionItem>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
              ¿Tienes más preguntas? Contacta a nuestro equipo de soporte para asistencia personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* Footer con branding y metadata */}
      <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            {/* Logo y eslogan */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <img src="/logo.png" alt="Cliente Insight" className="h-14 w-auto" />
                <span className="text-slate-400 text-sm hidden sm:inline">Conoce quién se queda. Anticípate a quien se va.</span>
              </div>
              <a
                href="https://github.com/alvaretto/telco-vercel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-white transition-colors text-sm font-medium"
              >
                github.com/alvaretto/telco-vercel
              </a>
            </div>

            {/* Metadata del modelo */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Model: {MODEL_METADATA.name} v{MODEL_METADATA.version}</span>
              </div>
              <div className="flex items-center gap-6">
                <span>Features: {MODEL_METADATA.features}</span>
                <span>•</span>
                <span>Updated: {MODEL_METADATA.date}</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center text-xs text-slate-500">
              © {new Date().getFullYear()} Cliente Insight. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>

      </div>
    </div>
  );
};

export default ClienteInsight;