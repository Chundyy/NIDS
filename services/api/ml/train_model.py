import pandas as pd
import joblib
import json
from sklearn.ensemble import RandomForestClassifier
from features import extract_features

def train():
    with open('alerts_data.json', 'r') as f:
        raw_data = json.load(f)
    
    hits = [hit['_source'] for hit in raw_data['hits']['hits']]
    
    # Processar cada alerta para extrair as novas features
    processed_data = []
    for h in hits:
        features = extract_features(h)
        # Mapear a severidade real (o nosso alvo)
        sev_map = {'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4}
        features['target'] = sev_map.get(h.get('severity'), 1)
        processed_data.append(features)
    
    df = pd.DataFrame(processed_data)
    
    X = df.drop(columns=['target'])
    y = df['target']
    
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)
    
    joblib.dump(model, 'models/ids_model.pkl')
    print("✅ Modelo treinado com inteligência de caracteres especiais!")

if __name__ == "__main__":
    train()
