# 🎯 Cliente Insight - Predicción de Churn con Machine Learning

<div align="center">

![Cliente Insight](https://img.shields.io/badge/Cliente%20Insight-Churn%20Prediction-0037FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMjBWMTAiLz48cGF0aCBkPSJNMTggMjBWNCIvPjxwYXRoIGQ9Ik02IDIwdi00Ii8+PC9zdmc+)
![ROC-AUC](https://img.shields.io/badge/ROC--AUC-85.05%25-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)

**Aplicación web de predicción de abandono de clientes de telecomunicaciones usando Machine Learning**

[🚀 Ver Demo](https://clienteinsight-ai.vercel.app/) • [📊 Documentación](https://clienteinsight-ai.vercel.app/#documentacion)

</div>

---

## 📋 Descripción del Proyecto

**Cliente Insight** es una aplicación web que utiliza un modelo de Machine Learning para predecir la probabilidad de que un cliente de telecomunicaciones abandone el servicio (churn). La aplicación permite a los equipos de retención identificar clientes en riesgo y tomar acciones preventivas.

### ✨ Características Principales

- 🎯 **Predicción en tiempo real** - Obtén la probabilidad de churn instantáneamente
- 📊 **Dashboard interactivo** - Visualiza métricas y estadísticas del modelo
- 📚 **Documentación técnica integrada** - Aprende sobre el modelo y sus features
- 🌐 **API RESTful** - Integra las predicciones en tus sistemas
- 📱 **Diseño responsive** - Funciona en desktop, tablet y móvil
- ⚡ **Serverless** - Sin infraestructura que mantener

---

## 🧠 Modelo de Machine Learning

### Algoritmo: Regresión Logística Optimizada

El modelo fue entrenado en **Google Colab** con el dataset [IBM Telco Customer Churn](https://www.kaggle.com/datasets/blastchar/telco-customer-churn) y optimizado mediante GridSearchCV.

### 📊 Métricas de Rendimiento

| Métrica | Valor |
|---------|-------|
| **ROC-AUC** | 85.05% |
| **Recall** | 79.68% |
| **Precision** | 50.77% |
| **F1-Score** | 62.02% |
| **Cross-Validation (5-fold)** | 83.89% ± 1.09% |

### 🔧 Hiperparámetros Optimizados

```python
LogisticRegression(
    C=1.0,
    solver='lbfgs',
    penalty='l2',
    class_weight='balanced',
    max_iter=500
)
```

### 📈 Features del Modelo

El modelo procesa **39 features** después del preprocesamiento:

| Tipo | Cantidad | Descripción |
|------|----------|-------------|
| Numéricas | 9 | Normalizadas con StandardScaler |
| Categóricas | 30 | One-Hot Encoded (drop='first') |
| Derivadas | 6 | Ingeniería de características |

#### Features Derivadas

| Feature | Fórmula | Descripción |
|---------|---------|-------------|
| `Charge_Ratio` | `TotalCharges / (tenure × MonthlyCharges)` | Ratio pago real vs esperado |
| `Total_Services` | `Σ servicios = 'Yes'` | Cantidad de servicios activos |
| `AvgMonthlyCharges` | `TotalCharges / tenure` | Cargo mensual promedio histórico |
| `SeniorWithDependents` | `SeniorCitizen × Dependents` | Interacción senior-dependientes |
| `HighValueContract` | `Contract ≠ M2M AND Charges > 70` | Cliente premium con compromiso |
| `TenureGroup` | Categorización | 0-1, 1-2, 2-4, 4+ años |

---

## 🛠️ Stack Tecnológico

### Frontend
- ⚛️ **React 18** - Biblioteca de UI
- ⚡ **Vite** - Build tool ultrarrápido
- 🎨 **Tailwind CSS** - Framework de estilos
- 🎯 **Lucide Icons** - Iconografía moderna

### Backend / API
- 🐍 **Python 3.10** - Runtime
- 📊 **NumPy** - Cálculos numéricos
- 🤖 **scikit-learn 1.6.1** - Entrenamiento del modelo
- 📦 **joblib** - Serialización

### Infraestructura
- ▲ **Vercel** - Hosting y serverless functions
- 🔬 **Google Colab** - Entrenamiento del modelo
- 🐙 **GitHub** - Control de versiones

---

## 📁 Estructura del Proyecto

```
telco-vercel/
├── api/
│   └── predict.py          # API serverless de predicción
├── models/
│   ├── model_weights.json   # Coeficientes del modelo (39 features)
│   ├── scaler_params.json   # Parámetros del StandardScaler
│   └── metadata.json        # Métricas y metadata del modelo
├── src/
│   ├── App.jsx              # Aplicación React principal
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globales
├── public/
│   └── logo.png             # Logo de la aplicación
├── documentacion/
│   └── Telco_Churn/         # Notebook y documentación técnica
├── vercel.json              # Configuración de Vercel
├── package.json             # Dependencias Node.js
├── requirements.txt         # Dependencias Python
├── tailwind.config.js       # Configuración Tailwind
└── README.md                # Este archivo
```

---

## 🚀 Instalación y Uso Local

### Prerrequisitos

- Node.js 18+
- Python 3.10+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/alvaretto/telco-vercel.git
cd telco-vercel
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias de Python (opcional, para API local)

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Build para producción

```bash
npm run build
```

---

## 🌐 API de Predicción

### Endpoint

```
POST https://clienteinsight-ai.vercel.app/api/predict
```

### Request Body

```json
{
  "gender": "Male",
  "SeniorCitizen": 0,
  "Partner": "No",
  "Dependents": "No",
  "tenure": 2,
  "PhoneService": "Yes",
  "MultipleLines": "No",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "No",
  "OnlineBackup": "No",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "No",
  "StreamingMovies": "No",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 70.35,
  "TotalCharges": 140.70
}
```

### Response

```json
{
  "success": true,
  "churn_probability": 0.803,
  "churn_score": 80,
  "risk_level": "Crítico",
  "model_version": "1.0.0"
}
```

---

## 📊 Dataset

**IBM Telco Customer Churn**

| Característica | Valor |
|----------------|-------|
| Registros totales | 7,043 |
| Train set | 5,634 (80%) |
| Test set | 1,409 (20%) |
| Variables originales | 21 |
| Tasa de churn | ~27% |

**Fuente:** [Kaggle - Telco Customer Churn](https://www.kaggle.com/datasets/blastchar/telco-customer-churn)

---

## 🔗 URLs de Deployment

| Recurso | URL |
|---------|-----|
| 🌐 **Aplicación Web** | [clienteinsight-ai.vercel.app](https://clienteinsight-ai.vercel.app/) |
| 📚 **Documentación** | [clienteinsight-ai.vercel.app/#documentacion](https://clienteinsight-ai.vercel.app/#documentacion) |
| 🔌 **API Endpoint** | [clienteinsight-ai.vercel.app/api/predict](https://clienteinsight-ai.vercel.app/api/predict) |
| 💻 **Repositorio** | [github.com/alvaretto/telco-vercel](https://github.com/alvaretto/telco-vercel) |

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 👨‍💻 Autor

**Álvaro Ángel Molina** ([@alvaretto](https://github.com/alvaretto))

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- [IBM](https://www.ibm.com/) - Por el dataset Telco Customer Churn
- [Vercel](https://vercel.com/) - Por el hosting gratuito
- [Google Colab](https://colab.research.google.com/) - Por los recursos de computación
- [scikit-learn](https://scikit-learn.org/) - Por las herramientas de ML

---

<div align="center">

**⭐ Si este proyecto te resultó útil, considera darle una estrella ⭐**

Made with ❤️ using React + Python + ML

</div>
