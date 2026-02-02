import re

def extract_features(data):
    # Forçar conversão para dicionário para evitar erros de objeto Pydantic
    if hasattr(data, 'model_dump'):
        d = data.model_dump()
    elif hasattr(data, 'dict'):
        d = data.dict()
    else:
        d = data if isinstance(data, dict) else {}

    # 1. Capturar todo o texto disponível
    desc = str(d.get("description", "")).lower()
    payl = str(d.get("payload", "")).lower()
    cat = str(d.get("category", "")).lower()
    texto_completo = f"{desc} {payl} {cat}"

    # 2. Lógica de Pontuação (Danger Score)
    score = 0
    
    # Palavras de "Morte Imediata" (Ransomware/WannaCry)
    if any(w in texto_completo for w in ["wannacry", "ransomware", "malware", "sinkhole"]):
        score += 50
        
    # Padrões de SQL Injection
    if any(w in texto_completo for w in ["select", "union", "1=1", "--", "drop table"]):
        score += 30

    # Contagem de caracteres suspeitos
    special_chars = ["'", ";", "<", ">", "(", ")"]
    score += sum([texto_completo.count(c) for c in special_chars])

    # 3. Metadados
    port = int(d.get("destination_port", 0) or 0)
    
    return {
        "porta_destino": port,
        "tamanho_pacote": int(d.get("payload_len", 0) or 0),
        "caracteres_especiais": score,
        "is_web_port": 1 if port in [80, 443, 8080] else 0
    }
