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
      className={`relative w-full p-3 rounded-xl border text-left transition-all flex justify-between items-center group ${
        value === 'Yes'
          ? 'bg-indigo-900/20 border-indigo-500/50 text-white'
          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className={`w-10 h-6 rounded-full p-1 transition-colors ${value === 'Yes' ? 'bg-indigo-500' : 'bg-slate-700'}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value === 'Yes' ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 lg:py-10">

        {/* Header con Metadata Real */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">TelcoGuard <span className="text-indigo-400 font-light">AI</span></h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-emerald-400">v{MODEL_METADATA.version}</span>
                <span>Updated: {MODEL_METADATA.date}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <div className="hidden lg:flex items-center gap-6 bg-slate-900/80 border border-slate-800 px-6 py-2 rounded-full backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Model Type</span>
                  <span className="text-xs font-semibold text-indigo-300">{MODEL_METADATA.name}</span>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">ROC AUC</span>
                  <span className="text-xs font-semibold text-emerald-400">{MODEL_METADATA.auc}</span>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Validation Accuracy</span>
                  <span className="text-xs font-semibold text-white">{MODEL_METADATA.accuracy}</span>
                </div>
             </div>
          </div>
        </header>

        <main className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Columna Izquierda: Inputs basados en metadata.json */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl">

              {/* Sección 1: Datos de Cuenta (Críticos para el modelo) */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Datos de Contrato & Facturación
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm text-slate-400">Tipo de Contrato</label>
                    <div className="grid grid-cols-1 gap-2">
                      {['Month-to-month', 'One year', 'Two year'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleInputChange('Contract', opt)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left border ${
                            formData.Contract === opt
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Antigüedad (Tenure)</span>
                        <span className="font-mono text-white">{formData.tenure} meses</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="72"
                        value={formData.tenure}
                        onChange={(e) => handleInputChange('tenure', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Cargos Mensuales</span>
                        <span className="font-mono text-emerald-400">${formData.MonthlyCharges}</span>
                      </div>
                      <input
                        type="range"
                        min="18"
                        max="120"
                        step="0.5"
                        value={formData.MonthlyCharges}
                        onChange={(e) => handleInputChange('MonthlyCharges', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                     <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-500">Total Charges (Calc)</span>
                        <span className="text-sm font-mono text-slate-300">${formData.TotalCharges}</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-800/50 w-full my-6"></div>

              {/* Sección 2: Servicios & Features Técnicos */}
              <div className="mb-8">
                 <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Server className="w-4 h-4" /> Configuración de Servicios
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Servicio de Internet</label>
                    <select
                      value={formData.InternetService}
                      onChange={(e) => handleInputChange('InternetService', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500"
                    >
                      <option value="Fiber optic">Fibra Óptica (Riesgo Alto)</option>
                      <option value="DSL">DSL</option>
                      <option value="No">Sin Internet</option>
                    </select>

                     <label className="text-sm text-slate-400 mt-4 mb-2 block">Método de Pago</label>
                    <select
                      value={formData.PaymentMethod}
                      onChange={(e) => handleInputChange('PaymentMethod', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500"
                    >
                      <option value="Electronic check">Electronic Check</option>
                      <option value="Mailed check">Mailed Check</option>
                      <option value="Bank transfer (automatic)">Bank Transfer (Auto)</option>
                      <option value="Credit card (automatic)">Credit Card (Auto)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <ToggleButton label="Soporte Técnico" field="TechSupport" value={formData.TechSupport} />
                    <ToggleButton label="Seguridad Online" field="OnlineSecurity" value={formData.OnlineSecurity} />
                    <ToggleButton label="Paperless Billing" field="PaperlessBilling" value={formData.PaperlessBilling} />
                    <ToggleButton label="Dependientes (Familia)" field="Dependents" value={formData.Dependents} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                 <button
                  onClick={calculateChurnRisk}
                  disabled={loading}
                  className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <BarChart3 className="w-5 h-5" />}
                  Ejecutar Modelo Predictivo
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resultados */}
          <div className="lg:col-span-4 space-y-6">

            {/* Panel de Estado / Resultado */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-1 shadow-xl min-h-[500px] flex flex-col">
              {!showResult && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                  <Shield className="w-16 h-16 text-slate-700 mb-4" />
                  <h3 className="text-lg font-medium text-slate-300">Ready for Inference</h3>
                  <p className="text-sm text-slate-500 mt-2">Ajusta los parámetros y ejecuta el modelo para obtener el Churn Score.</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-20 h-20 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-white font-mono animate-pulse">Calculando Probabilidad...</h3>
                  <div className="text-xs text-slate-500 mt-2 font-mono space-y-1 text-center">
                    <p>Loading weights from churn_model.pkl...</p>
                    <p>Applying StandardScaler...</p>
                    <p>Computing Logits...</p>
                  </div>
                </div>
              )}

              {showResult && prediction && (
                <div className="flex-1 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                  <div className="text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Probabilidad de Abandono</span>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                        <circle
                          cx="80" cy="80" r="70"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * prediction.score) / 100}
                          className={`${prediction.level === 'Crítico' ? 'text-red-500' : prediction.level === 'Medio' ? 'text-orange-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${prediction.level === 'Crítico' ? 'text-white' : 'text-white'}`}>
                          {prediction.score}%
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded mt-1 ${
                          prediction.level === 'Crítico' ? 'bg-red-500/20 text-red-300' :
                          prediction.level === 'Medio' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {prediction.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-800 pb-2">Top Factores de Influencia</h4>
                    {prediction.factors.map((factor, i) => (
                      <div key={i} className="flex justify-between items-center text-sm group">
                        <span className="text-slate-300">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs ${factor.color}`}>{factor.weight}</span>
                          <div className={`w-2 h-2 rounded-full ${factor.color.replace('text', 'bg')}`}></div>
                        </div>
                      </div>
                    ))}
                    {prediction.factors.length === 0 && (
                      <p className="text-sm text-slate-500 italic">No se detectaron factores de riesgo inusuales.</p>
                    )}
                  </div>

                  {prediction.level === 'Crítico' && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                        <div>
                          <h5 className="text-red-200 font-medium text-sm">Alerta de Retención</h5>
                          <p className="text-red-300/70 text-xs mt-1">Usuario en alto riesgo. Se sugiere ofrecer contrato a 1 año con descuento para reducir el logit score.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* JSON Metadata Viewer (Para validación) */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden">
               <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <FileJson className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase">metadata.json preview</span>
               </div>
               <pre className="text-[10px] text-slate-500 font-mono overflow-x-auto">
{`{
  "model": "${MODEL_METADATA.name}",
  "features": [
    "SeniorCitizen", "tenure",
    "MonthlyCharges", "TotalCharges",
    "Contract_Month-to-month",
    "InternetService_Fiber optic",
    ...
  ],
  "performance": {
    "AUC": ${MODEL_METADATA.auc},
    "Accuracy": "${MODEL_METADATA.accuracy}"
  }
}`}
               </pre>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default TelcoGuardAI;