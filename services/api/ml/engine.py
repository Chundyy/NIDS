import os
from transformers import pipeline

class IDSPredictor:
    def __init__(self):
        print("ML Engine: A carregar Inteligencia Artificial Generalista (DistilBERT)...")
        try:
            # Modelo otimizado para classificacao de texto
            self.classifier = pipeline("zero-shot-classification", 
                                     model="typeform/distilbert-base-uncased-mnli")
            
            # Categorias amplas que cobrem quase tudo num NIDS
            self.labels = [
                "cyber attack",      # SQLi, XSS, Brute Force
                "malware infection", # WannaCry, Trojans, Virus
                "network scanning",  # Nmap, Port scan
                "system monitoring", # Windows Update, ZeroTier, Pings
                "normal traffic"     # Browsing, DNS comum
            ]
            print("ML Engine: IA carregada e pronta para qualquer cenário.")
        except Exception as e:
            print(f"Erro ao carregar Hugging Face: {e}")
            self.classifier = None

    def predict_severity(self, data):
        if not self.classifier:
            return 1
        
        try:
            # Extração de dados robusta
            if hasattr(data, 'model_dump'):
                d = data.model_dump()
            else:
                d = data if isinstance(data, dict) else {}
            
            # Analisamos a descrição e a categoria que o Suricata já sugeriu
            text_to_analyze = f"{d.get('description', '')} {d.get('category', '')}"

            # A IA decide qual a etiqueta que melhor descreve o evento
            result = self.classifier(text_to_analyze, candidate_labels=self.labels)
            top_label = result['labels'][0]
            confidence = result['scores'][0]

            print(f"IA LOG - Texto: '{text_to_analyze}' | Classificacao: {top_label} ({confidence:.2%})")

            # Mapeamento para a Severidade da tua Dashboard (1-4)
            mapping = {
                "cyber attack": 4,
                "malware infection": 4,
                "network scanning": 3,
                "system monitoring": 2,
                "normal traffic": 1
            }

            return mapping.get(top_label, 1)

        except Exception as e:
            print(f"Erro na predicao: {e}")
            return 1
