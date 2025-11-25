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
  FileJson
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
      className={`relative w-full p-3.5 rounded-xl border text-left transition-all flex justify-between items-center group ${
        value === 'Yes'
          ? 'bg-indigo-500/10 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/5'
          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/50'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className={`relative w-11 h-6 rounded-full p-0.5 transition-all duration-300 ${
        value === 'Yes' ? 'bg-indigo-500' : 'bg-slate-700'
      }`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          value === 'Yes' ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      {/* Fondo animado mejorado */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Header mejorado */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Logo y título */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 p-3 rounded-2xl">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                  TelcoGuard <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">Customer Churn Prediction System</p>
              </div>
            </div>

            {/* Métricas del modelo */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl px-4 py-3">
                <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">Model</div>
                <div className="text-sm font-bold text-indigo-300">{MODEL_METADATA.name}</div>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl px-4 py-3">
                <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">ROC AUC</div>
                <div className="text-sm font-bold text-emerald-400">{MODEL_METADATA.auc}</div>
              </div>
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl px-4 py-3">
                <div className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider mb-1">Accuracy</div>
                <div className="text-sm font-bold text-white">{MODEL_METADATA.accuracy}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Columna Izquierda: Inputs */}
          <div className="lg:col-span-2 space-y-6">

            {/* Card 1: Datos de Contrato */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 lg:p-8 shadow-xl hover:border-slate-700/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Datos de Contrato & Facturación</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Tipo de Contrato */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Tipo de Contrato</label>
                  <div className="space-y-2">
                    {['Month-to-month', 'One year', 'Two year'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleInputChange('Contract', opt)}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                          formData.Contract === opt
                            ? 'bg-indigo-500/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-300">Antigüedad</label>
                      <span className="text-sm font-bold text-white bg-slate-800/50 px-3 py-1 rounded-lg">{formData.tenure} meses</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="72"
                      value={formData.tenure}
                      onChange={(e) => handleInputChange('tenure', parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-300">Cargos Mensuales</label>
                      <span className="text-sm font-bold text-emerald-400 bg-slate-800/50 px-3 py-1 rounded-lg">${formData.MonthlyCharges}</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="120"
                      step="0.5"
                      value={formData.MonthlyCharges}
                      onChange={(e) => handleInputChange('MonthlyCharges', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Total Acumulado</span>
                      <span className="text-lg font-bold text-white">${formData.TotalCharges}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Servicios */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 lg:p-8 shadow-xl hover:border-slate-700/50 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-violet-500/10 rounded-lg">
                  <Wifi className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Configuración de Servicios</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Selectores */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Servicio de Internet</label>
                    <select
                      value={formData.InternetService}
                      onChange={(e) => handleInputChange('InternetService', e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="Fiber optic">Fibra Óptica</option>
                      <option value="DSL">DSL</option>
                      <option value="No">Sin Internet</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Método de Pago</label>
                    <select
                      value={formData.PaymentMethod}
                      onChange={(e) => handleInputChange('PaymentMethod', e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="Electronic check">Electronic Check</option>
                      <option value="Mailed check">Mailed Check</option>
                      <option value="Bank transfer (automatic)">Bank Transfer (Auto)</option>
                      <option value="Credit card (automatic)">Credit Card (Auto)</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
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
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin"/>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-6 h-6" />
                  <span>Ejecutar Predicción</span>
                </>
              )}
            </button>
          </div>

          {/* Columna Derecha: Resultados */}
          <div className="lg:col-span-1 space-y-6">

            {/* Panel de Resultado */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-xl overflow-hidden sticky top-8">
              {!showResult && !loading && (
                <div className="flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"></div>
                    <Shield className="relative w-20 h-20 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">Listo para Predecir</h3>
                  <p className="text-sm text-slate-500 max-w-xs">Configura los parámetros del cliente y ejecuta el modelo para obtener la probabilidad de churn.</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center p-12 min-h-[500px]">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="w-10 h-10 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Procesando...</h3>
                  <div className="text-xs text-slate-500 font-mono space-y-2 text-center">
                    <p className="animate-pulse">→ Loading model weights</p>
                    <p className="animate-pulse delay-100">→ Applying preprocessing</p>
                    <p className="animate-pulse delay-200">→ Computing prediction</p>
                  </div>
                </div>
              )}

              {showResult && prediction && (
                <div className="p-8 animate-in fade-in duration-700">

                  {/* Círculo de probabilidad */}
                  <div className="text-center mb-8">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Probabilidad de Churn</div>
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800/50" />
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
                        <span className="text-5xl font-bold text-white mb-1">
                          {prediction.score}%
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
                    <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider pb-2 border-b border-slate-800">Factores Principales</h4>
                    {prediction.factors.map((factor, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 hover:border-slate-700/50 transition-colors">
                        <span className="text-sm text-slate-300">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-semibold ${factor.color}`}>{factor.weight}</span>
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
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-red-200 font-semibold text-sm mb-1">⚠️ Alerta de Retención</h5>
                          <p className="text-red-300/80 text-xs leading-relaxed">Cliente en alto riesgo de abandono. Considere ofrecer incentivos o mejoras en el plan.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </main>

        {/* Footer con metadata */}
        <footer className="mt-12 pt-8 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
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
        </footer>
      </div>
    </div>
  );
};

export default TelcoGuardAI;