import pandas as pd
import joblib
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestClassifier
import os

# Configuração (Usa o nome do container ids_postgres se correres via Docker)
# Se correres direto na VM, usa localhost
DATABASE_URL = "postgresql://ids:ids123@ids_postgres:5432/idsdb"

def train():
    engine = create_engine(DATABASE_URL)
    
    print("A procurar dados no Postgres...")
    try:
        df = pd.read_sql("SELECT porta_destino, tamanho_pacote, severidade_ml FROM eventos_rede", engine)
    except Exception as e:
        print(f"Erro ao ler tabela: {e}. Garante que inseriste dados de teste!")
        return

    if len(df) < 5:
        print("Dados insuficientes para treinar. Insere mais alguns eventos primeiro.")
        return


    X = df[['porta_destino', 'tamanho_pacote']]
    y = df['severidade_ml']

    print("A treinar o modelo Random Forest...")
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)

    os.makedirs('models', exist_ok=True)

    joblib.dump(model, 'models/ids_model.pkl')
    print("Modelo guardado com sucesso em ml/models/ids_model.pkl!")

if __name__ == "__main__":
    train()
