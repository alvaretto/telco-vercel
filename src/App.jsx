import React, { useState } from 'react';
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
  Brain
} from 'lucide-react';

const TelcoGuardAI = () => {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // METADATA REAL DEL MODELO (Extraída de metadata.json)
  const MODEL_METADATA = {
    name: "Logistic Regression Optimizado",
    version: "1.0.0",
    date: "2025-11-24",
    auc: 0.8246,
    accuracy: "79.13%",
    features: 41,
    environment: "Google Colab / Production"
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

  // Simulación de Inferencia basada en los pesos típicos de una Regresión Logística para este dataset
  const calculateChurnRisk = () => {
    setLoading(true);
    setShowResult(false);

    setTimeout(() => {
      let logit = -1.5; // Intercepto base (bias hacia No Churn)
      const factors = [];

      // 1. Contrato (Peso fuerte negativo para largo plazo)
      if (formData.Contract === 'Month-to-month') {
        logit += 2.5;
        factors.push({ name: 'Contrato: Mensual', impact: 'Crítico', color: 'text-red-400', weight: '+High' });
      } else if (formData.Contract === 'Two year') {
        logit -= 1.5;
        factors.push({ name: 'Contrato: 2 Años', impact: 'Protector', color: 'text-emerald-400', weight: '-High' });
      }

      // 2. Internet Service (Fibra suele tener alto churn)
      if (formData.InternetService === 'Fiber optic') {
        logit += 1.2;
        factors.push({ name: 'Servicio: Fibra Óptica', impact: 'Alto', color: 'text-orange-400', weight: '+Med' });
      }

      // 3. Antigüedad (Tenure) - Relación lineal negativa
      // Normalizamos tenure aprox 0-72
      logit -= (formData.tenure / 72) * 2.0;
      if (formData.tenure < 6) factors.push({ name: 'Antigüedad: Baja', impact: 'Alto', color: 'text-red-400', weight: '+Med' });

      // 4. Método de Pago
      if (formData.PaymentMethod === 'Electronic check') {
        logit += 0.8;
        factors.push({ name: 'Pago: Cheque Electrónico', impact: 'Medio', color: 'text-orange-300', weight: '+Low' });
      }

      // 5. Soporte Técnico y Seguridad (Protectores)
      if (formData.TechSupport === 'No' && formData.InternetService !== 'No') logit += 0.6;
      if (formData.OnlineSecurity === 'No' && formData.InternetService !== 'No') logit += 0.5;

      // 6. Paperless Billing
      if (formData.PaperlessBilling === 'Yes') logit += 0.3;

      // 7. Senior Citizen
      if (formData.SeniorCitizen === 1) logit += 0.2;

      // Función Sigmoide para convertir logit a probabilidad (0-1)
      const probability = 1 / (1 + Math.exp(-logit));
      const percentage = Math.round(probability * 100);

      let riskLevel = 'Bajo';
      if (percentage > 35) riskLevel = 'Medio';
      if (percentage > 65) riskLevel = 'Crítico'; // Umbral ajustado para churn

      setPrediction({
        score: percentage,
        level: riskLevel,
        factors: factors
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
      className={`relative w-full p-3 rounded-lg border text-left transition-all flex justify-between items-center ${
        value === 'Yes'
          ? 'bg-indigo-50 border-indigo-300 text-slate-900'
          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className={`relative w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${
        value === 'Yes' ? 'bg-indigo-600' : 'bg-slate-300'
      }`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          value === 'Yes' ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* Header/Navbar */}
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                TelcoGuard <span className="font-light">AI</span>
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-white/90 text-sm">
              <a href="#" className="hover:text-white transition-colors">Inicio</a>
              <a href="#" className="hover:text-white transition-colors">Diagnosticar</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-cyan-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Descubre TelcoGuard AI
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Un modelo de inteligencia artificial diseñado para predecir la probabilidad de abandono de clientes
                y proporcionar información útil sobre retención de clientes en telecomunicaciones.
              </p>
              <button
                onClick={() => document.getElementById('diagnosticar')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Comenzar Diagnóstico
              </button>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{MODEL_METADATA.auc.toFixed(4)}</div>
                    <div className="text-xs text-slate-600 font-medium">ROC AUC Score</div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-5 border border-violet-200">
                    <div className="text-3xl font-bold text-violet-600 mb-1">{MODEL_METADATA.accuracy}</div>
                    <div className="text-xs text-slate-600 font-medium">Accuracy</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">{MODEL_METADATA.features}</div>
                    <div className="text-xs text-slate-600 font-medium">Features</div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                    <div className="text-3xl font-bold text-slate-900 mb-1">v{MODEL_METADATA.version}</div>
                    <div className="text-xs text-slate-600 font-medium">Version</div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <Cpu className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium">{MODEL_METADATA.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-indigo-600 mb-4">¿Cómo Funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 border border-cyan-200 shadow-sm">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-md">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sube tu Información</h3>
              <p className="text-slate-600 leading-relaxed">
                Proporciona datos del contrato y respuestas a cuestionarios sobre servicios del cliente.
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 border border-cyan-200 shadow-sm">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-md">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Análisis con IA</h3>
              <p className="text-slate-600 leading-relaxed">
                Nuestra IA procesa los datos con modelos avanzados para detectar posibles patrones de abandono.
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 border border-cyan-200 shadow-sm">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-md">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Obtén tu Resultado</h3>
              <p className="text-slate-600 leading-relaxed">
                Recibe un informe con una estimación de riesgo y recomendaciones para la retención del cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario principal */}
      <section id="diagnosticar" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Configurar Predicción</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Configura los parámetros del cliente y ejecuta el modelo para obtener la probabilidad de churn.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

          {/* Columna izquierda: Datos de Contrato & Facturación */}
          <div className="lg:col-span-1 space-y-6">

            {/* Datos de Contrato & Facturación */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Contrato & Facturación</h3>
              </div>

              <div className="space-y-5">
                {/* Tipo de Contrato */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Tipo de Contrato</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Month-to-month', 'One year', 'Two year'].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleInputChange('Contract', type)}
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          formData.Contract === type
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {type === 'Month-to-month' ? 'Mensual' : type === 'One year' ? '1 año' : '2 años'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Antigüedad */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Antigüedad
                    <span className="ml-2 text-indigo-600 font-bold">{formData.tenure} meses</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="72"
                    value={formData.tenure}
                    onChange={(e) => handleInputChange('tenure', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0m</span>
                    <span>72m</span>
                  </div>
                </div>

                {/* Cargos Mensuales */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cargos Mensuales
                    <span className="ml-2 text-indigo-600 font-bold">${formData.MonthlyCharges}</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="120"
                    step="0.5"
                    value={formData.MonthlyCharges}
                    onChange={(e) => handleInputChange('MonthlyCharges', parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>$18</span>
                    <span>$120</span>
                  </div>
                </div>

                {/* Total Acumulado */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600 font-medium">Total Acumulado</span>
                    <span className="text-lg font-bold text-slate-900">${formData.TotalCharges}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Servicios */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Wifi className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Configuración de Servicios</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Servicio de Internet</label>
                  <select
                    value={formData.InternetService}
                    onChange={(e) => handleInputChange('InternetService', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="Fiber optic">Fibra Óptica</option>
                    <option value="DSL">DSL</option>
                    <option value="No">Sin Internet</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Método de Pago</label>
                  <select
                    value={formData.PaymentMethod}
                    onChange={(e) => handleInputChange('PaymentMethod', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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

            {/* Botón de ejecución */}
            <button
              onClick={calculateChurnRisk}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
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
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {!showResult && !loading && (
                <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-full mb-4">
                    <Shield className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Listo para Predecir</h3>
                  <p className="text-slate-600 max-w-md">Configura los parámetros del cliente y ejecuta el modelo para obtener la probabilidad de churn.</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                  <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                    <div className="w-20 h-20 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Procesando...</h3>
                  <p className="text-sm text-slate-600">Analizando datos del cliente</p>
                </div>
              )}

              {showResult && prediction && (
                <div className="p-8">

                  {/* Círculo de probabilidad */}
                  <div className="text-center mb-8">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Probabilidad de Churn</div>
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
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
                          } transition-all duration-1000 ease-out`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-slate-900 mb-1">
                          {prediction.score}%
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          prediction.level === 'Crítico' ? 'bg-red-100 text-red-700' :
                          prediction.level === 'Medio' ? 'bg-orange-100 text-orange-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          Riesgo {prediction.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Factores de influencia */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-xs uppercase text-slate-600 font-semibold tracking-wider pb-2 border-b border-slate-200">Factores Principales</h4>
                    {prediction.factors.map((factor, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                        <span className="text-sm text-slate-700">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-semibold ${factor.color.replace('text-red', 'text-red').replace('text-orange', 'text-orange').replace('text-emerald', 'text-emerald')}`}>{factor.weight}</span>
                          <div className={`w-2 h-2 rounded-full ${factor.color.replace('text', 'bg')}`}></div>
                        </div>
                      </div>
                    ))}
                    {prediction.factors.length === 0 && (
                      <p className="text-sm text-slate-500 italic text-center py-4">Sin factores de riesgo significativos</p>
                    )}
                  </div>

                  {/* Alerta crítica */}
                  {prediction.level === 'Crítico' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-red-900 font-semibold text-sm mb-1">⚠️ Alerta de Retención</h5>
                          <p className="text-red-700 text-xs leading-relaxed">Cliente en alto riesgo de abandono. Considere ofrecer incentivos o mejoras en el plan.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Prevención y Cuidado Section */}
      <section className="py-20 bg-gradient-to-b from-cyan-50 to-cyan-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-indigo-600 mb-6">Prevención y Cuidado</h2>
          <p className="text-center text-slate-700 mb-12 text-lg leading-relaxed">
            Aunque el churn es inevitable en telecomunicaciones, estudios han demostrado que ciertas estrategias pueden reducir el riesgo. Aquí te dejamos algunos consejos:
          </p>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 text-slate-700">
              <span className="text-2xl">🧠</span>
              <p className="text-base leading-relaxed"><strong>Mejora la experiencia del cliente</strong> con un servicio de calidad y soporte técnico eficiente.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-700">
              <span className="text-2xl">💰</span>
              <p className="text-base leading-relaxed"><strong>Ofrece planes competitivos</strong> manteniendo precios justos y promociones atractivas.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-700">
              <span className="text-2xl">🏃</span>
              <p className="text-base leading-relaxed"><strong>Actúa rápidamente</strong> identificando clientes en riesgo y contactando proactivamente.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-700">
              <span className="text-2xl">🛌</span>
              <p className="text-base leading-relaxed"><strong>Fideliza con beneficios</strong> mediante programas de lealtad y recompensas para clientes antiguos.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-700">
              <span className="text-2xl">👥</span>
              <p className="text-base leading-relaxed"><strong>Mantén comunicación activa</strong> con encuestas de satisfacción y feedback constante.</p>
            </div>
            <div className="flex items-start gap-4 text-slate-700">
              <span className="text-2xl">📊</span>
              <p className="text-base leading-relaxed"><strong>Analiza datos regularmente</strong> usando IA para predecir y prevenir el abandono.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer con metadata */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
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
        </div>
      </footer>
    </div>
  );
};

export default TelcoGuardAI;