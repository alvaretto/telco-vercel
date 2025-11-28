"""
API Serverless para predicción de Churn - Cliente Insight
Versión Ligera (sin sklearn) - Solo numpy para inferencia
Usa coeficientes reales del modelo entrenado en Google Colab
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import numpy as np

# Cargar coeficientes del modelo al inicio
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
COEF = None
INTERCEPT = None
METADATA = None
SCALER_MEAN = None
SCALER_SCALE = None
LOAD_ERROR = None

def load_model():
    global COEF, INTERCEPT, METADATA, SCALER_MEAN, SCALER_SCALE, LOAD_ERROR
    if COEF is not None:
        return True
    try:
        # Cargar coeficientes desde JSON
        with open(os.path.join(MODEL_DIR, 'model_weights.json'), 'r') as f:
            weights = json.load(f)
        COEF = np.array(weights['coef'])
        INTERCEPT = weights['intercept']
        
        # Cargar parámetros del scaler
        with open(os.path.join(MODEL_DIR, 'scaler_params.json'), 'r') as f:
            scaler = json.load(f)
        SCALER_MEAN = np.array(scaler['mean'])
        SCALER_SCALE = np.array(scaler['scale'])
        
        with open(os.path.join(MODEL_DIR, 'metadata.json'), 'r') as f:
            METADATA = json.load(f)
        return True
    except Exception as e:
        LOAD_ERROR = str(e)
        return False

def preprocess_input(data):
    """Preprocesar input del usuario a features del modelo (39 features)"""
    # 9 features numéricas + 30 features categóricas one-hot
    features = np.zeros(39)
    
    # === FEATURES NUMÉRICAS (índices 0-8) ===
    tenure = float(data.get('tenure', 0))
    monthly = float(data.get('MonthlyCharges', 0))
    total = float(data.get('TotalCharges', 0))
    
    # Calcular features derivadas
    charge_ratio = total / (monthly + 0.01) if monthly > 0 else 0
    
    services = 0
    for svc in ['PhoneService', 'MultipleLines', 'OnlineSecurity', 'OnlineBackup', 
                'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies']:
        if data.get(svc) == 'Yes':
            services += 1
    
    avg_monthly = total / (tenure + 0.01) if tenure > 0 else monthly
    senior = int(data.get('SeniorCitizen', 0))
    senior_with_dep = senior * (1 if data.get('Dependents') == 'Yes' else 0)
    high_value = 1 if (data.get('Contract') != 'Month-to-month' and monthly > 70) else 0
    
    # Array de features numéricas (orden del preprocesador)
    num_features = np.array([
        senior,           # SeniorCitizen
        tenure,           # tenure
        monthly,          # MonthlyCharges
        total,            # TotalCharges
        charge_ratio,     # Charge_Ratio
        services,         # Total_Services
        avg_monthly,      # AvgMonthlyCharges
        senior_with_dep,  # SeniorWithDependents
        high_value        # HighValueContract
    ])
    
    # Normalizar con StandardScaler
    num_scaled = (num_features - SCALER_MEAN) / SCALER_SCALE
    features[0:9] = num_scaled
    
    # === FEATURES CATEGÓRICAS ONE-HOT (índices 9-38) ===
    idx = 9
    
    # gender (drop='first' -> Male=1)
    features[idx] = 1 if data.get('gender') == 'Male' else 0
    idx += 1
    
    # Partner (Yes=1)
    features[idx] = 1 if data.get('Partner') == 'Yes' else 0
    idx += 1
    
    # Dependents (Yes=1)
    features[idx] = 1 if data.get('Dependents') == 'Yes' else 0
    idx += 1
    
    # PhoneService (Yes=1)
    features[idx] = 1 if data.get('PhoneService') == 'Yes' else 0
    idx += 1
    
    # MultipleLines (No phone service, Yes) - 2 columnas
    ml = data.get('MultipleLines', 'No')
    features[idx] = 1 if ml == 'No phone service' else 0
    features[idx+1] = 1 if ml == 'Yes' else 0
    idx += 2
    
    # InternetService (Fiber optic, No) - 2 columnas
    inet = data.get('InternetService', 'No')
    features[idx] = 1 if inet == 'Fiber optic' else 0
    features[idx+1] = 1 if inet == 'No' else 0
    idx += 2
    no_internet = (inet == 'No')
    
    # OnlineSecurity (No internet service, Yes) - 2 columnas
    features[idx] = 1 if no_internet else 0
    features[idx+1] = 1 if data.get('OnlineSecurity') == 'Yes' else 0
    idx += 2
    
    # OnlineBackup (No internet service, Yes) - 2 columnas
    features[idx] = 1 if no_internet else 0
    features[idx+1] = 1 if data.get('OnlineBackup') == 'Yes' else 0
    idx += 2
    
    # DeviceProtection (No internet service, Yes) - 2 columnas
    features[idx] = 1 if no_internet else 0
    features[idx+1] = 1 if data.get('DeviceProtection') == 'Yes' else 0
    idx += 2
    
    # TechSupport (No internet service, Yes) - 2 columnas
    features[idx] = 1 if no_internet else 0
    features[idx+1] = 1 if data.get('TechSupport') == 'Yes' else 0
    idx += 2
    
    # StreamingTV (No internet service, Yes) - 2 columnas
    features[idx] = 1 if no_internet else 0
    features[idx+1] = 1 if data.get('StreamingTV') == 'Yes' else 0
    idx += 2
    
    # StreamingMovies (No internet service, Yes) - 2 columnas
    features[idx] = 1 if no_internet else 0
    features[idx+1] = 1 if data.get('StreamingMovies') == 'Yes' else 0
    idx += 2
    
    # Contract (One year, Two year) - 2 columnas
    contract = data.get('Contract', 'Month-to-month')
    features[idx] = 1 if contract == 'One year' else 0
    features[idx+1] = 1 if contract == 'Two year' else 0
    idx += 2
    
    # PaperlessBilling (Yes=1)
    features[idx] = 1 if data.get('PaperlessBilling') == 'Yes' else 0
    idx += 1
    
    # PaymentMethod (Credit card, Electronic check, Mailed check) - 3 columnas
    pm = data.get('PaymentMethod', 'Electronic check')
    features[idx] = 1 if pm == 'Credit card (automatic)' else 0
    features[idx+1] = 1 if pm == 'Electronic check' else 0
    features[idx+2] = 1 if pm == 'Mailed check' else 0
    idx += 3
    
    # TenureGroup (1-2 años, 2-4 años, 4+ años, nan) - 4 columnas
    if tenure <= 12:
        pass  # 0-1 año (baseline, drop='first')
    elif tenure <= 24:
        features[idx] = 1  # 1-2 años
    elif tenure <= 48:
        features[idx+1] = 1  # 2-4 años
    else:
        features[idx+2] = 1  # 4+ años
    # features[idx+3] = 0  # nan (siempre 0)
    
    return features

def sigmoid(x):
    return 1 / (1 + np.exp(-np.clip(x, -500, 500)))

def predict_proba(features):
    """Calcular probabilidad de churn usando regresión logística"""
    logit = np.dot(features, COEF) + INTERCEPT
    prob_churn = sigmoid(logit)
    return prob_churn

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if load_model():
            self.wfile.write(json.dumps({
                'status': 'ok',
                'model_info': METADATA.get('model_info', {}),
                'metrics': METADATA.get('metrics', {}),
                'n_features': METADATA.get('n_features', 39),
                'message': 'API ML real - Modelo cargado correctamente'
            }).encode())
        else:
            self.wfile.write(json.dumps({
                'status': 'error',
                'message': f'Error: {LOAD_ERROR}'
            }).encode())

    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        try:
            if not load_model():
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': f'Modelo no cargado: {LOAD_ERROR}'
                }).encode())
                return
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            features = preprocess_input(data)
            prob_churn = predict_proba(features)
            
            score = round(prob_churn * 100)
            risk_level = 'Bajo' if score <= 35 else ('Medio' if score <= 65 else 'Critico')
            
            self.wfile.write(json.dumps({
                'success': True,
                'prediction': {
                    'churn': score > 50,
                    'probability': float(prob_churn),
                    'score': score,
                    'risk_level': risk_level
                },
                'model_version': METADATA.get('model_info', {}).get('version', '1.0.0'),
                'using_real_ml': True
            }).encode())
            
        except Exception as e:
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e)
            }).encode())
