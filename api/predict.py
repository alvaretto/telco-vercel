"""
API Serverless para predicción de Churn - Cliente Insight
Versión Ligera (sin sklearn) - Solo numpy para inferencia
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
LOAD_ERROR = None

def load_model():
    global COEF, INTERCEPT, METADATA, LOAD_ERROR
    if COEF is not None:
        return True
    try:
        # Cargar coeficientes desde JSON (no requiere sklearn)
        with open(os.path.join(MODEL_DIR, 'model_weights.json'), 'r') as f:
            weights = json.load(f)
        COEF = np.array(weights['coef'])
        INTERCEPT = weights['intercept']
        
        with open(os.path.join(MODEL_DIR, 'metadata.json'), 'r') as f:
            METADATA = json.load(f)
        return True
    except Exception as e:
        LOAD_ERROR = str(e)
        return False

def preprocess_input(data):
    """Preprocesar input del usuario a features del modelo"""
    features = np.zeros(39)
    
    # Numéricas
    features[0] = int(data.get('SeniorCitizen', 0))
    features[1] = float(data.get('tenure', 0))
    features[2] = float(data.get('MonthlyCharges', 0))
    features[3] = float(data.get('TotalCharges', 0))
    
    # Features derivadas
    tenure = features[1]
    monthly = features[2]
    total = features[3]
    
    features[4] = total / (monthly + 0.01) if monthly > 0 else 0  # Charge_Ratio
    
    # Total_Services (contar servicios activos)
    services = 0
    for svc in ['PhoneService', 'MultipleLines', 'OnlineSecurity', 'OnlineBackup', 
                'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies']:
        if data.get(svc) == 'Yes':
            services += 1
    features[5] = services
    
    features[6] = total / (tenure + 0.01) if tenure > 0 else monthly  # AvgMonthlyCharges
    features[7] = features[0] * (1 if data.get('Dependents') == 'Yes' else 0)  # SeniorWithDependents
    features[8] = 1 if (data.get('Contract') != 'Month-to-month' and monthly > 70) else 0  # HighValueContract
    
    # One-hot encoding
    features[9] = 1 if data.get('gender') == 'Male' else 0
    features[10] = 1 if data.get('Partner') == 'Yes' else 0
    features[11] = 1 if data.get('Dependents') == 'Yes' else 0
    features[12] = 1 if data.get('PhoneService') == 'Yes' else 0
    
    # MultipleLines
    ml = data.get('MultipleLines', 'No')
    features[13] = 1 if ml == 'No phone service' else 0
    features[14] = 1 if ml == 'Yes' else 0
    
    # InternetService
    inet = data.get('InternetService', 'No')
    features[15] = 1 if inet == 'Fiber optic' else 0
    features[16] = 1 if inet == 'No' else 0
    
    no_internet = (inet == 'No')
    
    # OnlineSecurity
    features[17] = 1 if no_internet else 0
    features[18] = 1 if data.get('OnlineSecurity') == 'Yes' else 0
    
    # OnlineBackup
    features[19] = 1 if no_internet else 0
    features[20] = 1 if data.get('OnlineBackup') == 'Yes' else 0
    
    # DeviceProtection
    features[21] = 1 if no_internet else 0
    features[22] = 1 if data.get('DeviceProtection') == 'Yes' else 0
    
    # TechSupport
    features[23] = 1 if no_internet else 0
    features[24] = 1 if data.get('TechSupport') == 'Yes' else 0
    
    # StreamingTV
    features[25] = 1 if no_internet else 0
    features[26] = 1 if data.get('StreamingTV') == 'Yes' else 0
    
    # StreamingMovies
    features[27] = 1 if no_internet else 0
    features[28] = 1 if data.get('StreamingMovies') == 'Yes' else 0
    
    # Contract
    contract = data.get('Contract', 'Month-to-month')
    features[29] = 1 if contract == 'One year' else 0
    features[30] = 1 if contract == 'Two year' else 0
    
    features[31] = 1 if data.get('PaperlessBilling') == 'Yes' else 0
    
    # PaymentMethod
    pm = data.get('PaymentMethod', 'Electronic check')
    features[32] = 1 if pm == 'Credit card (automatic)' else 0
    features[33] = 1 if pm == 'Electronic check' else 0
    features[34] = 1 if pm == 'Mailed check' else 0
    
    # TenureGroup
    if tenure <= 12:
        pass  # 0-1 año (baseline)
    elif tenure <= 24:
        features[35] = 1  # 1-2 años
    elif tenure <= 48:
        features[36] = 1  # 2-4 años
    else:
        features[37] = 1  # 4+ años
    
    features[38] = 0  # TenureGroup_nan (siempre 0)
    
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
