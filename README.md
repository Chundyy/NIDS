# NIDS - Network Intrusion Detection System with SIEM Dashboard

Uma plataforma completa de detecção de intrusões na rede com interface SIEM profissional, integrada com análise de malware, aprendizado de máquina em tempo real e centralização de alertas. O projeto combina FastAPI, Elasticsearch, PostgreSQL e React para criar um centro de operações de segurança (SOC) moderno e escalável.

---

## 📋 Visão Geral

O NIDS é um sistema de monitoramento e resposta a segurança que oferece:

Detecção e classificação de ameaças em tempo real através de motor de ML com DistilBERT; Armazenamento e busca rápida de alertas com Elasticsearch; Gestão centralizada de incidentes e casos de segurança; Análise de comportamento de hosts e padrões de ataque; Geração de relatórios de conformidade e segurança; Interface web intuitiva estilo QRadar para SOCs.

---

## 🛠️ Stack de Tecnologias

| Componente | Tecnologia | Versão | Função |
|-----------|-----------|--------|--------|
| **Backend** | FastAPI | 0.100+ | API REST e orquestração |
| **Frontend** | Next.js + React | 19.2.4+ | Interface SIEM |
| **Busca** | Elasticsearch | 8.14.3 | Indexação e busca de alertas |
| **Banco de Dados** | PostgreSQL | 15 Alpine | Dados estruturados e configurações |
| **ML/IA** | Transformers (DistilBERT) | HuggingFace | Classificação de ameaças |
| **Containerização** | Docker & Docker Compose | 3.9+ | Orquestração de serviços |
| **UI Components** | Shadcn/UI + Radix | Variadas | Design system profissional |
| **Estilização** | Tailwind CSS | 3.4+ | Estilos responsivos |

---

## 📦 Serviços e Componentes

| Serviço | Container | Porta | Status | Descrição |
|---------|-----------|-------|--------|-----------|
| **API** | ids_api | 8000 | Essencial | Backend FastAPI com routers de alertas, scans, malware, etc |
| **UI** | ids_ui | 3000 | Essencial | Frontend Next.js - Dashboard SIEM |
| **PostgreSQL** | ids_postgres | 5432 | Essencial | Base de dados relacional para dados estruturados |
| **Elasticsearch** | ids_elasticsearch | 9200 | Essencial | Motor de busca para alertas em tempo real |
| **Kibana** | ids_kibana | 5601 | Opcional | Visualização e debug do Elasticsearch |

---

## 🚀 Instalação e Setup

### Pré-requisitos

Docker e Docker Compose instalados; Mínimo 4GB de RAM disponível (recomendado 8GB); Pelo menos 10GB de espaço em disco; Python 3.9+ (para desenvolvimento local).

### Instalação com Docker (Recomendado)

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/NIDS.git
cd NIDS

# 2. Criar arquivo .env com variáveis de ambiente
cat > .env << EOF
SECRET_KEY=your-secret-key-here-change-in-production
DB_PASSWORD=ids123
EOF

# 3. Iniciar todos os serviços
docker compose up -d --build

# 4. Verificar status dos serviços
docker compose ps

# 5. Ver logs da API
docker compose logs -f api
```

### Pós-instalação

Após alguns segundos, os serviços estarão disponíveis em:

| Serviço | URL | Autenticação |
|---------|-----|-------|
| Dashboard SIEM | http://localhost:3000 | Credenciais padrão |
| API Documentation | http://localhost:8000/docs | Nenhuma |
| Elasticsearch | http://localhost:9200 | Desabilitada (dev) |
| Kibana | http://localhost:5601 | Nenhuma |

```bash
# Aguardar que o PostgreSQL esteja pronto (~10 segundos)
docker exec ids_postgres pg_isready -U ids -d idsdb
```

---

## 📚 Endpoints da API

### Alertas

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---|
| GET | `/alerts` | Listar todos os alertas | Sim |
| POST | `/alerts` | Criar novo alerta | Sim |
| GET | `/alerts/{id}` | Obter detalhes de alerta | Sim |
| PUT | `/alerts/{id}` | Atualizar alerta | Sim |
| DELETE | `/alerts/{id}` | Eliminar alerta | Sim |
| GET | `/alerts/search` | Buscar alertas com filtros | Sim |
| GET | `/alerts/severity/{level}` | Filtrar por severidade | Sim |

### Hosts

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---|
| GET | `/hosts` | Listar todos os hosts | Sim |
| POST | `/hosts` | Registar novo host | Sim |
| GET | `/hosts/{id}` | Detalhes do host | Sim |
| GET | `/hosts/{id}/activity` | Atividade recente do host | Sim |

### Scans

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---|
| GET | `/scans` | Listar scans | Sim |
| POST | `/scans` | Iniciar novo scan | Sim |
| GET | `/scans/{id}` | Status de scan | Sim |

### Malware

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---|
| GET | `/malware` | Listar detecções de malware | Sim |
| POST | `/malware` | Registar detecção | Sim |
| GET | `/malware/{id}` | Detalhes de malware | Sim |

### Cases

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---|
| GET | `/cases` | Listar casos | Sim |
| POST | `/cases` | Criar novo caso | Sim |
| PUT | `/cases/{id}` | Atualizar caso | Sim |
| GET | `/cases/{id}/timeline` | Timeline do caso | Sim |

### Regras

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---|
| GET | `/rules` | Listar regras de detecção | Sim |
| POST | `/rules` | Criar regra | Admin |
| PUT | `/rules/{id}` | Atualizar regra | Admin |
| DELETE | `/rules/{id}` | Eliminar regra | Admin |

### Relatórios

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---|
| GET | `/reports` | Listar relatórios | Sim |
| POST | `/reports` | Gerar novo relatório | Sim |
| GET | `/reports/{id}/export` | Exportar relatório | Sim |

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Autenticar utilizador |
| POST | `/auth/logout` | Terminar sessão |
| POST | `/auth/refresh` | Renovar token |

---

## 🔒 Modelos de Dados

### Alert

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| timestamp | DateTime | Momento da detecção (UTC) |
| severity | String | CRITICAL, HIGH, MEDIUM, LOW, INFO |
| source_ip | String | IP de origem |
| destination_ip | String | IP de destino |
| destination_port | Integer | Porta de destino |
| protocol | String | TCP, UDP, ICMP, etc |
| description | String | Descrição da ameaça |
| category | String | cyber attack, malware, scanning, etc |
| payload_len | Integer | Tamanho do payload (bytes) |
| status | String | OPEN, INVESTIGATING, RESOLVED |

### Host

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| hostname | String | Nome do máquina |
| ip_address | String | Endereço IP |
| os | String | Sistema operativo |
| last_seen | DateTime | Última atividade |
| risk_score | Float | Score de risco 0-100 |
| alerts_count | Integer | Total de alertas associados |

### Case (Incidente)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| title | String | Título do incidente |
| description | String | Descrição detalhada |
| severity | String | CRITICAL, HIGH, MEDIUM, LOW |
| status | String | OPEN, INVESTIGATING, CLOSED |
| assigned_to | String | Analista responsável |
| created_at | DateTime | Data de criação |
| closed_at | DateTime | Data de encerramento |
| alert_ids | List | Alertas relacionados |

---

## 📁 Estrutura do Projeto

```
NIDS/
├── services/
│   ├── api/                          # Backend FastAPI
│   │   ├── main.py                   # Aplicação principal
│   │   ├── requirements.txt          # Dependências Python
│   │   ├── Dockerfile               # Container da API
│   │   ├── init.sql                 # Schema inicial do PostgreSQL
│   │   ├── db.py                    # Conexão base de dados
│   │   ├── elastic.py               # Cliente Elasticsearch
│   │   ├── suricata.py              # Integração com Suricata IDS
│   │   ├── models/                  # Modelos Pydantic
│   │   │   ├── alert.py
│   │   │   ├── rule.py
│   │   │   └── user.py
│   │   ├── routers/                 # Endpoints da API
│   │   │   ├── alerts.py
│   │   │   ├── auth.py
│   │   │   ├── cases.py
│   │   │   ├── hosts.py
│   │   │   ├── malware.py
│   │   │   ├── reports.py
│   │   │   ├── rules.py
│   │   │   └── scans.py
│   │   └── ml/                      # Motor de Machine Learning
│   │       ├── engine.py            # Preditor com DistilBERT
│   │       ├── features.py          # Extração de features
│   │       ├── train_model.py       # Script de treino
│   │       ├── dataset_real.csv     # Dados de treino
│   │       └── models/              # Modelos treinados (joblib)
│   │
│   ├── ui/                          # Frontend Next.js + React
│   │   ├── Dockerfile              # Container da UI
│   │   └── siem-ui-build/
│   │       ├── package.json         # Dependências npm
│   │       ├── tsconfig.json        # Configuração TypeScript
│   │       ├── tailwind.config.ts   # Tailwind CSS config
│   │       ├── next.config.mjs      # Next.js config
│   │       ├── app/                 # Estrutura Next.js App Router
│   │       │   ├── layout.tsx       # Layout principal
│   │       │   ├── page.tsx         # Página inicial
│   │       │   └── globals.css      # Estilos globais
│   │       ├── components/          # Componentes React
│   │       │   ├── dashboard-shell.tsx
│   │       │   ├── alerts-list.tsx
│   │       │   ├── hosts-list.tsx
│   │       │   ├── cases-list.tsx
│   │       │   ├── login-page.tsx
│   │       │   ├── ui/              # Componentes base (Shadcn)
│   │       │   └── ...
│   │       ├── lib/                 # Utilitários e hooks
│   │       │   ├── api.ts           # Cliente HTTP
│   │       │   ├── auth-context.tsx # Contexto de autenticação
│   │       │   └── utils.ts         # Funções auxiliares
│   │       └── hooks/               # Custom React hooks
│   │
│   └── elasticsearch/
│       └── elasticsearch.yml        # Configuração ES
│
├── docker-compose.yml              # Orquestração de containers
├── package.json                    # Metadados do projeto
├── test_search_alerts.py           # Script de testes
└── README.md                       # Esta documentação
```

---

## 🧠 Motor de Machine Learning

O NIDS utiliza um modelo de classificação zero-shot com **DistilBERT** da Hugging Face para categorizar ameaças automaticamente.

| Categoria | Exemplos | Detecta |
|-----------|----------|---------|
| **cyber attack** | SQL Injection, XSS, Buffer Overflow, RCE | Ataques direcionados e exploração |
| **malware infection** | WannaCry, Trojans, Ransomware, Worms | Presença e comportamento suspeito |
| **network scanning** | Nmap scans, Port scanning, reconnaissance | Recon e mapeamento de rede |
| **system monitoring** | Windows Update, DNS, Ping, VPN | Tráfego legitimado e sistema |
| **normal traffic** | HTTP browsing, Email, Downloads | Atividade comum e esperada |

**Uso:**

```python
# O motor carrega automaticamente no startup
# Previsões são feitas continuamente nos alertas
severity_level, confidence = ml_engine.predict_severity(alert_data)
```

---

## 🎨 Interface do Dashboard

A UI oferece uma experiência SIEM profissional com:

Caixa de pesquisa global de alertas; Gráficos em tempo real de ameaças e hosts; Vista detalhada de casos e incidentes; Timeline de eventos para forensics; Exportação de relatórios formatados; Dark mode nativo (tema responsivo); Responsividade mobile (tablets e smartphones).

**Componentes principais:**

| Componente | Arquivo | Função |
|-----------|---------|--------|
| Dashboard | dashboard-shell.tsx | Shell principal com sidebar |
| Alerts | alerts-list.tsx | Lista e detalhes de alertas |
| Hosts | hosts-list.tsx | Monitoramento de máquinas |
| Cases | cases-list.tsx | Gestão de incidentes |
| Reports | reports-list.tsx | Geração e visualização |
| Login | login-page.tsx | Autenticação de utilizadores |

---

## 🔧 Desenvolvimento Local

### Pré-requisitos

Python 3.9+; Node.js 18+; PostgreSQL 15 (ou use Docker); Elasticsearch 8.14.3 (ou use Docker).

### Setup para Desenvolvimento

```bash
# Backend
cd services/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (em outro terminal)
cd services/ui/siem-ui-build
npm install
npm run dev
```

---

## 🐛 Troubleshooting

### O Elasticsearch demora a iniciar
O Elasticsearch é exigente com memória. Aguarde 30-60 segundos na primeira execução. Verifique com:

```bash
docker exec ids_elasticsearch curl -s http://localhost:9200/_cluster/health
```

### PostgreSQL não está saudável
Limpe os volumes e recrie:

```bash
docker compose down -v
docker compose up -d --build
```

### CORS errors no frontend
Verifique se o IP da máquina está em `allow_origins` em [main.py](services/api/main.py#L15). Adicione seu IP se necessário.

### Falta de memória (OOM)
Reduza a memória do Elasticsearch em [docker-compose.yml](docker-compose.yml#L72):

```yaml
ES_JAVA_OPTS: -Xms512m -Xmx512m  # Menor que 1g
```

---

## 📊 Dados de Teste

Um script de teste está incluído para popular o sistema com dados realistas:

```bash
python test_search_alerts.py
```

Isto criará alertas de exemplo em várias categorias para teste.

---

## 🔐 Segurança

Para produção, considere:

| Aspecto | Ação |
|--------|------|
| **Elasticsearch** | Ativar X-Pack security e autenticação |
| **PostgreSQL** | Mudar password padrão (`ids123`) |
| **API** | Gerar `SECRET_KEY` forte e aleatória |
| **CORS** | Whitelist apenas domínios confiáveis |
| **Conexões** | Usar HTTPS/TLS em produção |
| **Backups** | Implementar replicação e backup automático |

Exemplo `.env` para produção:

```bash
SECRET_KEY=your-complex-random-key-min-32-chars
DB_PASSWORD=very-strong-password-here
ES_JAVA_OPTS=-Xms2g -Xmx2g
```

---

## 📈 Performance e Escalabilidade

| Métrica | Valor | Notas |
|---------|-------|-------|
| Alertas/segundo | ~100 | Depende de hardware |
| Latência de busca | <200ms | Elasticsearch indexado |
| Memória base | ~2GB | Sem dados |
| CPU típico | 15-25% | Em repouso |
| Retenção de dados | Configurável | Default: 30 dias |

Para melhorar performance em produção, considere usar Kubernetes e replicação de Elasticsearch.

---

## 📝 Contribuindo

Contributions são bem-vindas! Por favor:

1. Faça fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores

Desenvolvido como plataforma SIEM de código aberto para detecção e resposta a incidentes.

---

## 📞 Suporte

Para questões, bugs ou sugestões, abra uma issue no repositório do GitHub.

**Status dos Serviços:** [http://localhost:8000/health](http://localhost:8000/health)
