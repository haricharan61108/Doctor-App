# AI-Powered Medical Diary & Clinician Dashboard

An intelligent healthcare system combining patient-facing digital medical diary with clinician-facing verification dashboard for accurate clinical documentation with provenance-tracked summarization.

## Overview

This project addresses critical gaps in clinical documentation and patient data accessibility by:
- **Structured Data Capture**: Schema-based extraction of medical facts from clinical notes
- **AI-Powered Summarization**: Provenance-conditioned generation ensuring every summary fact is traceable to source
- **Clinician Dashboard**: Verification interface for medical professionals to review and validate AI-generated summaries
- **Patient Portal**: Mobile-accessible digital medical diary with click-to-verify summaries

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux/Context API
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS / Material-UI

### Backend
- **Runtime**: Python 3.10+
- **Framework**: FastAPI
- **Database**: MongoDB / PostgreSQL
- **NLP Models**: BioBERT, spaCy, Hugging Face Transformers
- **Async Tasks**: Celery with Redis

### DevOps
- **Containerization**: Docker & Docker Compose
- **Testing**: pytest, Jest
- **CI/CD**: GitHub Actions

## Project Structure

```
social-PROJECT/
├── frontend/              # React SPA application
├── backend/              # Python FastAPI backend
├── tests/                # Unit & integration tests
├── test_reports/         # Test execution reports
├── docs/                 # Technical documentation
├── sample_data/          # Example datasets & test cases
├── docker-compose.yml
├── Dockerfile
├── LICENSE               # MIT License
└── README.md
```

## Prerequisites

- **Node.js**: v18+
- **Python**: 3.10+
- **Docker**: 20.10+
- **Git**: 2.25+

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/em24mtech11004-dev/social-PROJECT.git
cd social-PROJECT

# Create environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Access applications:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Option 2: Local Development

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend Setup:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend (.env)

```env
# Application
DEBUG=True
ENV=development
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=mongodb://localhost:27017/medical_diary

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# NLP Models
BIOBERT_MODEL_PATH=models/biobert-base-cased
SPACY_MODEL=en_core_sci_lg

# Authentication
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_MINUTES=1440

# Redis
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Medical Diary
VITE_ENABLE_ANALYTICS=false
```

## Running Tests

```bash
# Backend tests
pytest
pytest --cov=app           # With coverage

# Frontend tests
npm test
npm run test:coverage
```

## API Documentation

Once backend is running, visit: `http://localhost:8000/docs`

Key endpoints:
- `POST /auth/login` - User authentication
- `GET /api/medical-records` - Retrieve patient records
- `POST /api/medical-records` - Create new medical record
- `GET /api/summaries/{record_id}` - Get AI-generated summary
- `POST /api/summaries/{record_id}/verify` - Clinician verification

## Key Features

### 1. Digital Medical Diary
- Secure storage of medical records
- Schema-based structured data capture
- HIPAA-compliant encryption

### 2. AI-Powered Summarization
- Provenance-conditioned generation (APCG)
- Token-level source attribution
- Medical entity recognition (NER)
- Temporal reasoning for prescriptions

### 3. Clinician Verification Dashboard
- Review AI summaries with source highlighting
- Accept/reject/modify summaries
- Real-time feedback mechanism
- Audit trail of all modifications

### 4. Patient Portal
- Mobile-accessible interface
- Click-to-verify summary details
- Crisis-ready medical history access
- Personal health record management

## Architecture

```
Patient Input
    ↓
Schema-Based Extraction (Entity Recognition)
    ↓
NLP Processing (BioBERT + spaCy)
    ↓
Provenance-Conditioned Summarization (APCG)
    ↓
Clinician Verification Queue
    ↓
Clinic Review & Approval
    ↓
Patient Portal Display
```

## Provenance Tracking

Every summary fact is traceable to source:
```
Summary: "Patient has hypertension managed with Lisinopril 10mg daily"
  ↤─ "hypertension" → Note #142, Line 5
  ↤─ "Lisinopril" → Note #142, Line 7
  ↤─ "10mg" → Prescription #892
  ↤─ "daily" → Prescription #892, Frequency field
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature description'`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request

## Roadmap

- [ ] Real-time collaborative editing
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] EHR integration (HL7 FHIR)
- [ ] Multi-language support
- [ ] Blockchain audit trail

## License

MIT License - see LICENSE file for details

## Contact

**Author**: em24mtech11004-dev (IIT Hyderabad)

For issues and questions, please create a GitHub Issue.

## Acknowledgments

- BioBERT model (DMIS-Lab)
- spaCy medical NLP pipeline
- Hugging Face model hub
- IIT Hyderabad research community
