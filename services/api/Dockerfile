FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema necessárias para drivers de BD
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Garante que o comando bate certo com o nome do teu ficheiro (ex: main.py -> main:app)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
