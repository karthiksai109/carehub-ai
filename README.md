<p align="center">
  <img src="docs/logo.png" alt="CareHub AI" width="120" />
</p>

<h1 align="center">CareHub AI</h1>
<h3 align="center">AI-Powered Hospital Command Center</h3>

<p align="center">
  <em>Real-time clinical intelligence, agentic triage, deterioration prediction, and hospital operations management — all in one platform.</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#testing">Testing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.12-blue?logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Kafka-Event_Stream-231F20?logo=apachekafka" alt="Kafka" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/Kubernetes-Orchestrated-326CE5?logo=kubernetes" alt="K8s" />
  <img src="https://img.shields.io/badge/AWS-Cloud_Native-FF9900?logo=amazonaws" alt="AWS" />
  <img src="https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform" alt="Terraform" />
  <img src="https://img.shields.io/badge/Elasticsearch-Search-005571?logo=elasticsearch" alt="ES" />
</p>

---

## The Problem

Hospitals face critical operational challenges daily:

- **Triage bottlenecks** — Manual triage is slow, subjective, and error-prone during high-volume shifts
- **Missed deterioration** — 80% of cardiac arrests have detectable warning signs 6-8 hours before the event, yet they're often missed
- **Drug interaction errors** — Adverse drug events cause 1.3 million ER visits/year in the US alone
- **Bed management chaos** — Manual bed tracking leads to 30-40% operational inefficiency
- **Data silos** — Patient data is fragmented across systems, preventing holistic clinical views

## The Solution

**CareHub AI** is a unified, AI-powered hospital command center that connects patients, clinicians, and operations through real-time intelligence:

| Module | What It Does | AI Technique |
|--------|-------------|-------------|
| **AI Triage Engine** | Classifies patient urgency in seconds using clinical protocols | NLP + Manchester Triage System + ESI |
| **Deterioration Predictor** | Predicts patient decline before it happens | NEWS2 scoring + trend analysis + risk modeling |
| **Clinical Decision Support** | Evidence-based treatment protocols and guidance | RAG + clinical guidelines database |
| **Drug Interaction Checker** | Detects dangerous medication combinations instantly | Graph-based interaction matching |
| **Bed Management & Optimizer** | Real-time bed tracking with AI capacity prediction | Predictive analytics + optimization |
| **Real-time Vitals Streaming** | Live vital signs monitoring via WebSockets | Streaming analytics + anomaly detection |
| **Analytics Dashboard** | Hospital-wide performance metrics and insights | Statistical analysis + visualization |

---

## Features

### AI Triage Engine
- Symptom analysis against Manchester Triage System (MTS) and Emergency Severity Index (ESI)
- Automatic urgency classification: Critical → Emergency → Urgent → Semi-Urgent → Non-Urgent
- Intelligent department routing based on symptom-department correlation matrix
- Pain level assessment and vital signs integration
- Age-based risk adjustment (pediatric and geriatric boosting)
- Transparent AI reasoning chain for every assessment
- Clinician override capability with audit trail

### Deterioration Prediction (NEWS2)
- National Early Warning Score 2 (NEWS2) calculation from Royal College of Physicians
- Real-time vital sign trend analysis with historical comparison
- Composite deterioration scoring combining NEWS2 + trends + age + comorbidities
- Automatic clinical alert generation with severity classification
- Actionable recommendations for each risk level
- Continuous monitoring with WebSocket-powered live updates

### Clinical Decision Support
- Evidence-based clinical protocols for common conditions (chest pain, sepsis, pneumonia, etc.)
- Drug interaction database with severity classification (Major, Moderate, Minor)
- Allergy cross-reactivity checking (e.g., penicillin class)
- Age-adjusted dosing recommendations (geriatric/pediatric)
- ICD-10 code mapping for billing integration

### Hospital Operations
- Real-time bed occupancy dashboard with ward-level breakdown
- AI-powered capacity prediction (24h forecast)
- Smart bed assignment optimization based on patient acuity
- Appointment scheduling with priority-based queue management
- Department load balancing analytics
- Surge capacity protocol automation

### Real-time Infrastructure
- WebSocket-powered live vitals streaming per patient
- Broadcast alert system for critical clinical events
- Kafka event streaming for asynchronous processing
- Redis pub/sub for real-time dashboard updates
- Rate-limited API with sliding window counter

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CAREHUB AI ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌──────────────────────────────────────────────┐   │
│  │   React +    │    │              FASTAPI BACKEND                 │   │
│  │  TailwindCSS │◄──►│                                              │   │
│  │  TypeScript  │    │  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │   │
│  │             │    │  │   Auth   │ │ Patients │ │   Triage    │  │   │
│  │  Dashboard  │    │  │  Routes  │ │  Routes  │ │   Routes    │  │   │
│  │  Triage UI  │    │  └────┬─────┘ └────┬─────┘ └──────┬──────┘  │   │
│  │  Vitals     │    │       │            │              │          │   │
│  │  Beds       │    │  ┌────┴────────────┴──────────────┴───────┐  │   │
│  │  Clinical   │    │  │           SERVICE LAYER                 │  │   │
│  │  Analytics  │    │  │                                         │  │   │
│  └──────┬──────┘    │  │  ┌─────────────┐  ┌──────────────────┐ │  │   │
│         │           │  │  │ AI ENGINES  │  │  BUSINESS LOGIC  │ │  │   │
│         │WebSocket  │  │  │             │  │                  │ │  │   │
│         │           │  │  │ • Triage    │  │ • Patient Mgmt   │ │  │   │
│         ▼           │  │  │ • NEWS2     │  │ • Bed Optimizer  │ │  │   │
│  ┌──────────────┐   │  │  │ • Clinical  │  │ • Scheduling     │ │  │   │
│  │  WebSocket   │   │  │  │ • Drug Chk  │  │ • Analytics      │ │  │   │
│  │  Manager     │   │  │  │ • Bed AI    │  │ • Alerts         │ │  │   │
│  └──────────────┘   │  │  └─────────────┘  └──────────────────┘ │  │   │
│                     │  └─────────────────────────────────────────┘  │   │
│                     │       │           │            │              │   │
│                     └───────┼───────────┼────────────┼──────────────┘   │
│                             │           │            │                  │
│              ┌──────────────┼───────────┼────────────┼──────────────┐   │
│              │         DATA & MESSAGING LAYER                       │   │
│              │                                                      │   │
│  ┌───────────┴──┐  ┌───────┴───────┐  ┌─────┴──────┐  ┌─────────┐ │   │
│  │ PostgreSQL   │  │    Redis      │  │   Kafka    │  │Elastic  │ │   │
│  │              │  │               │  │            │  │search   │ │   │
│  │ • Users      │  │ • Cache       │  │ • Vitals   │  │         │ │   │
│  │ • Patients   │  │ • Sessions    │  │ • Alerts   │  │ • Search│ │   │
│  │ • Vitals     │  │ • Pub/Sub     │  │ • Events   │  │ • Index │ │   │
│  │ • Triage     │  │ • Rate Limit  │  │ • Logs     │  │ • Logs  │ │   │
│  │ • Beds       │  │               │  │            │  │         │ │   │
│  │ • Alerts     │  │               │  │            │  │         │ │   │
│  └──────────────┘  └───────────────┘  └────────────┘  └─────────┘ │   │
│              │                                                      │   │
│              └──────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    INFRASTRUCTURE                                │   │
│  │  Docker Compose │ Kubernetes │ Terraform │ GitHub Actions │ AWS  │   │
│  │  Grafana │ Datadog │ ELK Stack │ S3 │ ECR │ ECS │ RDS │ ElastiCache│
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Patient Arrives → Triage Assessment → AI Urgency Classification
                                          │
                     ┌────────────────────┤
                     ▼                    ▼
              Admit to Bed          Route to Dept
                     │                    │
                     ▼                    ▼
           Monitor Vitals        Clinical Guidance
                     │                    │
                     ▼                    ▼
          AI Deterioration       Drug Interaction
           Prediction              Checking
                     │                    │
                     ▼                    ▼
            Alert if Risk        Treatment Protocol
              Detected              Generated
                     │                    │
                     └────────┬───────────┘
                              ▼
                    Dashboard Analytics
                    (Real-time Updates)
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript, TailwindCSS, Recharts, Lucide Icons | Modern responsive dashboard UI |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2 | High-performance async API |
| **Database** | PostgreSQL 16 (async via asyncpg) | Primary relational datastore |
| **Cache** | Redis 7 (pub/sub, caching, rate limiting) | Real-time data & session management |
| **Messaging** | Apache Kafka (Redpanda) | Event streaming for vitals & alerts |
| **Search** | Elasticsearch 8 | Full-text search & data indexing |
| **Real-time** | WebSockets (native FastAPI) | Live vitals & alert streaming |
| **Auth** | JWT (python-jose), bcrypt (passlib) | Secure authentication & authorization |
| **AI/ML** | Custom engines + OpenAI integration | Triage, prediction, clinical support |
| **Containerization** | Docker, Docker Compose | Multi-service container orchestration |
| **Orchestration** | Kubernetes (K8s) | Production-grade container orchestration |
| **Infrastructure** | Terraform (AWS) | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Automated testing & deployment pipeline |
| **Cloud** | AWS (ECS, ECR, RDS, ElastiCache, S3) | Production cloud infrastructure |
| **Monitoring** | Grafana, Datadog (configured) | Application & infrastructure monitoring |

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/yourusername/carehub-ai.git
cd carehub-ai

# Copy environment file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Access the application
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# Grafana:   http://localhost:3001
```

### Local Development

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Copy env file and configure
cp .env.example .env

# Run database migrations
# (tables auto-create on startup)

# Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173
```

---

## API Documentation

Once the backend is running, access the interactive API docs:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Authenticate user |
| `POST` | `/api/v1/triage/assess` | AI triage assessment |
| `GET` | `/api/v1/triage/` | List triage records |
| `POST` | `/api/v1/vitals/` | Record vital signs + AI analysis |
| `GET` | `/api/v1/vitals/patient/{id}/deterioration` | AI deterioration prediction |
| `GET` | `/api/v1/beds/dashboard` | Bed occupancy dashboard |
| `POST` | `/api/v1/clinical/guidance` | Clinical decision support |
| `POST` | `/api/v1/clinical/drug-interactions` | Drug interaction check |
| `GET` | `/api/v1/analytics/dashboard` | Hospital analytics |
| `WS` | `/ws/vitals/{patient_id}` | Real-time vitals stream |
| `WS` | `/ws/dashboard` | Live dashboard updates |

### Example: AI Triage Assessment

```bash
curl -X POST http://localhost:8000/api/v1/triage/assess \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "severe chest pain radiating to left arm, difficulty breathing",
    "patient_age": 55,
    "patient_gender": "male",
    "pain_level": 9,
    "vital_signs": {
      "heart_rate": 110,
      "systolic_bp": 90,
      "oxygen_saturation": 92
    }
  }'
```

**Response:**
```json
{
  "ai_urgency_level": "critical",
  "ai_urgency_score": 0.952,
  "ai_recommended_department": "cardiac",
  "ai_preliminary_assessment": "55-year-old male patient presenting with severe chest pain radiating to left arm, difficulty breathing. Classified as CRITICAL — requires immediate life-saving intervention.",
  "ai_suggested_tests": ["ECG/EKG", "Troponin levels", "Chest X-ray", "CBC", "BMP", "BNP"],
  "ai_reasoning": "1. Symptom Analysis: 'chest pain' matched critical protocol...\n2. Urgency Score: 0.952 → CRITICAL\n3. Vital Signs: Critical SpO2 92%, HR 110..."
}
```

---

## Deployment

### Docker Compose (Recommended for staging)

```bash
docker-compose up -d --build
```

### Kubernetes

```bash
# Apply all K8s manifests
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/backend-deployment.yaml
kubectl apply -f infrastructure/k8s/frontend-deployment.yaml
kubectl apply -f infrastructure/k8s/ingress.yaml
```

### Terraform (AWS Production)

```bash
cd infrastructure/terraform

terraform init
terraform plan -var="db_password=<secure-password>"
terraform apply -var="db_password=<secure-password>"
```

### CI/CD Pipeline

The GitHub Actions pipeline automatically:
1. Runs backend Python tests with PostgreSQL + Redis
2. Builds and type-checks the frontend
3. Builds Docker images for both services
4. Deploys to AWS ECS on merge to `main`

---

## Testing

```bash
# Backend unit tests
cd backend
python -m pytest tests/ -v

# Run specific test suites
python -m pytest tests/test_triage_engine.py -v
python -m pytest tests/test_deterioration.py -v
python -m pytest tests/test_clinical_decision.py -v

# With coverage
python -m pytest tests/ --cov=app --cov-report=html
```

### Test Coverage

| Module | Tests | Coverage |
|--------|-------|---------|
| AI Triage Engine | 10 tests | Urgency classification, department routing, age factors, vitals |
| Deterioration Predictor | 8 tests | NEWS2 scoring, trends, age/comorbidity factors, alerts |
| Clinical Decision Support | 8 tests | Protocols, drug interactions, allergies, age adjustments |

---

## Project Structure

```
carehub-ai/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST API endpoints
│   │   │   ├── auth.py          # Authentication (JWT)
│   │   │   ├── patients.py      # Patient CRUD + search
│   │   │   ├── triage.py        # AI triage assessments
│   │   │   ├── vitals.py        # Vital signs + AI prediction
│   │   │   ├── beds.py          # Bed management + optimizer
│   │   │   ├── clinical.py      # Clinical decision support
│   │   │   ├── appointments.py  # Scheduling
│   │   │   └── analytics.py     # Hospital analytics
│   │   ├── core/
│   │   │   ├── config.py        # Application settings
│   │   │   └── security.py      # JWT + bcrypt auth
│   │   ├── db/
│   │   │   ├── database.py      # Async SQLAlchemy engine
│   │   │   └── redis_client.py  # Redis cache + pub/sub
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── patient.py
│   │   │   ├── vitals.py
│   │   │   ├── bed.py
│   │   │   ├── triage.py
│   │   │   ├── alert.py
│   │   │   ├── appointment.py
│   │   │   └── medication.py
│   │   ├── schemas/             # Pydantic v2 schemas
│   │   ├── services/ai/        # AI Engines
│   │   │   ├── triage_engine.py           # MTS + ESI triage
│   │   │   ├── deterioration_predictor.py # NEWS2 + trend analysis
│   │   │   ├── clinical_decision_support.py # Protocols + drug checker
│   │   │   └── bed_optimizer.py           # Capacity prediction
│   │   ├── middleware/
│   │   │   └── rate_limiter.py  # Sliding window rate limiting
│   │   ├── websockets/
│   │   │   └── vitals_stream.py # Real-time vitals WebSocket
│   │   └── main.py             # FastAPI application entry
│   ├── tests/                   # Pytest test suites
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/Layout.tsx # Sidebar + navigation
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # Hospital command center
│   │   │   ├── Triage.tsx       # AI triage interface
│   │   │   ├── Patients.tsx     # Patient management
│   │   │   ├── Vitals.tsx       # Real-time vitals monitor
│   │   │   ├── BedManagement.tsx # Bed occupancy + optimizer
│   │   │   ├── ClinicalSupport.tsx # Clinical AI + drug checker
│   │   │   ├── Analytics.tsx    # Hospital analytics
│   │   │   └── Login.tsx        # Authentication
│   │   ├── api.ts              # Axios API client
│   │   └── main.tsx            # React entry point
│   ├── package.json
│   └── tailwind.config.js
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── nginx.conf
│   ├── k8s/
│   │   ├── namespace.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   └── ingress.yaml
│   └── terraform/
│       └── main.tf             # AWS infrastructure
├── .github/workflows/
│   └── ci.yml                  # CI/CD pipeline
├── docker-compose.yml          # Full stack orchestration
├── .gitignore
└── README.md
```

---

## AI Engine Details

### Triage Classification Algorithm

The AI Triage Engine uses a hybrid approach:

1. **Keyword Matching** — Symptoms are matched against a curated database of 60+ critical, emergency, and urgent symptom patterns based on Manchester Triage System
2. **Vital Signs Analysis** — Real-time vital signs are scored against clinical thresholds (HR, BP, SpO2, Temp, RR)
3. **Age Risk Adjustment** — Pediatric (<12) and geriatric (>70) patients receive automatic risk boosting (10-25%)
4. **Pain Level Integration** — Self-reported pain scores (0-10) contribute to urgency scoring
5. **Composite Scoring** — All factors are combined into a 0.0-1.0 urgency score mapped to 5 clinical urgency levels
6. **Department Routing** — Symptom-department correlation matrix routes patients to the appropriate specialty

### NEWS2 Deterioration Prediction

Based on the Royal College of Physicians NEWS2 framework:

| Parameter | Score 3 | Score 2 | Score 1 | Score 0 |
|-----------|---------|---------|---------|---------|
| Resp Rate | ≤8 or ≥25 | - | 9-11 or 21-24 | 12-20 |
| SpO2 | ≤91 | 92-93 | 94-95 | ≥96 |
| Systolic BP | ≤90 or ≥220 | 91-100 | 101-110 | 111-219 |
| Heart Rate | ≤40 or ≥131 | 111-130 | 41-50 or 91-110 | 51-90 |
| Temperature | ≤35.0 | - | 35.1-36.0 or 39.1+ | 36.1-38.0 |
| Consciousness | Unresponsive | Pain | Voice | Alert |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|---------|---------|-------------|
| `SECRET_KEY` | Yes | - | JWT signing key |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | No | `redis://localhost:6379/0` | Redis connection string |
| `KAFKA_BOOTSTRAP_SERVERS` | No | `localhost:9092` | Kafka broker address |
| `ELASTICSEARCH_URL` | No | `http://localhost:9200` | Elasticsearch URL |
| `OPENAI_API_KEY` | No | - | OpenAI key for enhanced AI |
| `AWS_ACCESS_KEY_ID` | No | - | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | No | - | AWS credentials |
| `AWS_REGION` | No | `us-east-1` | AWS region |
| `S3_BUCKET` | No | `carehub-ai-storage` | S3 bucket for file storage |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `refactor:` — Code refactoring
- `test:` — Adding tests
- `ci:` — CI/CD changes
- `infra:` — Infrastructure changes

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with clinical precision by a developer who believes AI can save lives.
</p>
