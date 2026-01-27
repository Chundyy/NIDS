import joblib
import os
import pandas as pd

class IDSPredictor:
    def __init__(self, model_path="/app/ml/models/ids_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                print("✅ ML Engine: Modelo carregado com sucesso.")
            except Exception as e:
                print(f"❌ Erro ao carregar modelo: {e}")
        else:
            print(f"⚠️ Aviso: Modelo não encontrado em {self.model_path}")

    def predict_severity(self, data: dict):
        if not self.model:
            return 0 
        try:
            df = pd.DataFrame([{
                "porta_destino": data.get("destination_port", 0),
                "tamanho_pacote": data.get("payload_len", 0)
            }])
            prediction = self.model.predict(df)[0]
            return int(prediction)
        except Exception as e:
            print(f"❌ Erro na predicao: {e}")
            return 0
