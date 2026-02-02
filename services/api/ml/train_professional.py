import pandas as pd
import joblib
import os
from features import extract_features
from sklearn.ensemble import RandomForestClassifier

def train_professional():
    print("A ler dataset sintético...")
    df_raw = pd.read_csv('dataset_real.csv')

    processed_data = []
    print("A processar features para o modelo...")
    
    for index, row in df_raw.iterrows():
        # Usa os nomes das colunas que criámos no generate_data.py
        mock_data = {
            "destination_port": row['destination_port'],
            "payload_len": row['payload_len'],
            "description": str(row['description'])
        }
        
        features = extract_features(mock_data)
        
        # Mapeia a label para severidade numérica
        label = row['label']
        if label == 'BENIGN': features['target'] = 1
        elif label == 'SQL_INJECTION': features['target'] = 4
        else: features['target'] = 3
            
        processed_data.append(features)

    df = pd.DataFrame(processed_data)
    X = df.drop(columns=['target'])
    y = df['target']

    print(f"A treinar Random Forest com {len(df)} exemplos equilibrados...")
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)

    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/ids_model.pkl')
    print("NOVO MODELO CRIADO COM SUCESSO!")

if __name__ == "__main__":
    train_professional()
