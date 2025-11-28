"""
API Serverless para predicción de Churn - Cliente Insight
Vercel Python Runtime (Optimizado para deployment ligero)
"""
from http.server import BaseHTTPRequestHandler
import json
import os

# Lazy loading para reducir cold start
model = None
preprocessor = None
metadata = None
LOAD_ERROR = None

def load_models():
    global model, preprocessor, metadata, LOAD_ERROR
    if model is not None:
        return True
    
    try:
        import joblib
        MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
        model = joblib.load(os.path.join(MODEL_DIR, 'churn_model.pkl'))
        preprocessor = joblib.load(os.path.join(MODEL_DIR, 'preprocessor.pkl'))
        with open(os.path.join(MODEL_DIR, 'metadata.json'), 'r') as f:
            metadata = json.load(f)
        return True
    except Exception as e:
        LOAD_ERROR = str(e)
        return False

# Features esperadas
EXPECTED_FEATURES = [
    'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure',
    'PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity',
    'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV',
    'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod',
    'MonthlyCharges', 'TotalCharges'
]


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

        if load_models():
            response = {
                'status': 'ok',
                'model_info': metadata.get('model_info', {}),
                'metrics': metadata.get('metrics', {}),
                'n_features': metadata.get('n_features', 0),
                'message': 'API de prediccion de churn lista'
            }
        else:
            response = {
                'status': 'error',
                'message': f'Error cargando modelos: {LOAD_ERROR}'
            }
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            if not load_models():
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': f'Modelos no cargados: {LOAD_ERROR}'
                }).encode())
                return

            import pandas as pd
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            missing = [f for f in EXPECTED_FEATURES if f not in data]
            if missing:
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': f'Campos faltantes: {missing}'
                }).encode())
                return

            df = pd.DataFrame([data])
            X_processed = preprocessor.transform(df)
            proba = model.predict_proba(X_processed)[0]
            churn_probability = float(proba[1])
            prediction = int(model.predict(X_processed)[0])

            score = round(churn_probability * 100)
            risk_level = 'Bajo' if score <= 35 else ('Medio' if score <= 65 else 'Critico')

            self.wfile.write(json.dumps({
                'success': True,
                'prediction': {
                    'churn': prediction == 1,
                    'probability': churn_probability,
                    'score': score,
                    'risk_level': risk_level
                },
                'model_version': metadata.get('model_info', {}).get('version', '1.0.0')
            }).encode())

        except Exception as e:
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e)
            }).encode())
