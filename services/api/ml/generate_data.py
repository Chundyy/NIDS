import pandas as pd
import random

data = []

# BENIGN (Incluindo o ruído da tua rede)
for _ in range(4000):
    data.append({
        'destination_port': random.choice([80, 443, 53, 7680, 9993]),
        'payload_len': random.randint(20, 500),
        'description': "Normal background traffic",
        'label': 'BENIGN' # Severidade 1
    })

# SQL INJECTION
for _ in range(2000):
    data.append({
        'destination_port': 80,
        'payload_len': random.randint(100, 1000),
        'description': "SQL Injection: SELECT * FROM users WHERE 1=1",
        'label': 'SQL_INJECTION' # Severidade 4
    })

# WANNACRY / MALWARE
for _ in range(2000):
    data.append({
        'destination_port': random.choice([445, 53]),
        'payload_len': random.randint(50, 2000),
        'description': "ET MALWARE WannaCry Ransomware Activity",
        'label': 'SQL_INJECTION' # Usamos o mesmo label pesado
    })

df = pd.DataFrame(data)
df.to_csv('dataset_real.csv', index=False)
print("Dataset reconstruído do zero!")
