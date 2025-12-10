# Technical Design Document
## AI-Powered Medical Diary & Clinician Dashboard

**Version**: 1.0  
**Date**: December 2024  
**Status**: Active Development (TRL 3)

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Data Flow & Provenance](#data-flow--provenance)
3. [Component Specifications](#component-specifications)
4. [NLP Pipeline](#nlp-pipeline)
5. [API Specifications](#api-specifications)
6. [Security & Compliance](#security--compliance)
7. [Performance Metrics](#performance-metrics)

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│              End Users                               │
│  ├─ Patients  ├─ Clinicians  ├─ Administrators     │
└──────────────────────┬────────────────────────────┘
                       │
        ┌──────────────▼───────────────┐
        │ API Gateway & Authentication  │
        │ (JWT, Rate Limiting, CORS)    │
        └──────────────┬───────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
┌───▼────┐   ┌────────▼──────┐   ┌──────▼───┐
│ Auth    │   │ Medical Record│   │ NLP/     │
│ Service │   │ Service        │   │Summary   │
└─────────┘   └────────────────┘   │Service   │
                                     └──────────┘
    │              │                 │
    └──────────────┼─────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼──────┐  ┌─────────────┐  ┌──▼──────┐
│ MongoDB/ │  │ Redis Cache │  │ Celery  │
│PostgreSQL│  │ (NLP Models)│  │ Queue   │
└──────────┘  └─────────────┘  └─────────┘
```

## Data Flow & Provenance

### Clinical Note Processing Pipeline

```
Input: Raw Clinical Note
    ↓
[Schema Validation]
    ↓
[Medical Entity Recognition] (BioBERT + spaCy)
    ├─→ Drug names, dosages
    ├─→ Medical conditions
    ├─→ Lab values
    └─→ Vital signs
    ↓
[Relation Extraction]
    ├─→ Drug-condition relations
    ├─→ Dosage-frequency mappings
    └─→ Temporal relations
    ↓
[Provenance Tracking]
    ├─→ Token-level source mapping
    ├─→ Confidence scoring
    └─→ Cross-reference indexing
    ↓
[LLM Summarization] (Provenance-Conditioned)
    ├─→ Context retrieval from past records
    ├─→ Abstractive summarization
    └─→ Source attribution linking
    ↓
[Clinician Verification]
    ├─→ Accept & Deploy
    ├─→ Reject & Request Corrections
    └─→ Suggest Modifications
    ↓
Output: Patient Portal Display + Audit Trail
```

### Provenance Mapping Example

```json
{
  "summary_text": "Patient on Metformin 500mg BID for Type 2 Diabetes",
  "provenance_map": {
    "Metformin": {
      "source_type": "prescription",
      "record_id": "RX_2024_001",
      "line_number": 5,
      "confidence": 0.99
    },
    "500mg": {
      "source_type": "prescription",
      "record_id": "RX_2024_001",
      "field": "dosage",
      "confidence": 0.99
    },
    "BID": {
      "source_type": "prescription",
      "record_id": "RX_2024_001",
      "field": "frequency",
      "confidence": 0.98
    },
    "Type 2 Diabetes": {
      "source_type": "clinical_note",
      "record_id": "NOTE_2024_042",
      "section": "diagnosis",
      "confidence": 0.97
    }
  }
}
```

## Component Specifications

### Frontend Architecture

**Technology**: React 18 + TypeScript + Redux + Vite

```
src/
├── pages/
│   ├── Auth/
│   ├── Dashboard/
│   ├── MedicalRecords/
│   └── Summary/
├── components/
│   ├── Provenance Display/
│   ├── Source Highlighting/
│   └── VerificationUI/
├── hooks/
│   ├── useAuth.ts
│   ├── useMedicalRecords.ts
│   └── useSummary.ts
├── services/
│   └── api.ts (Axios with interceptors)
└── store/
    └── Redux slices
```

### Backend NLP Pipeline

**Framework**: FastAPI + Python 3.10+

#### Entity Extraction
```python
# BioBERT-based NER
from transformers import AutoTokenizer, AutoModelForTokenClassification
from seqeval.metrics import f1_score

model = AutoModelForTokenClassification.from_pretrained(
    "dmis-lab/biobert-base-cased-v1.2"
)
```

#### Summarization with Provenance
```python
# Provenance-Conditioned Generation
class ProvennanceConditionedSummarizer:
    def __init__(self, model_name="biomedical-gpt2"):
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    def summarize_with_provenance(self, source_text, entities):
        # Generate summary conditioned on extracted entities
        # Track attention weights for source attribution
        pass
```

## API Specifications

### Authentication
```
POST /auth/login
Body: {"email": "user@example.com", "password": "***"}
Response: {"access_token": "jwt_token", "user_role": "clinician"}
```

### Medical Records
```
GET /api/medical-records?patient_id=P123&limit=10
POST /api/medical-records
Body: {
  "patient_id": "P123",
  "note_type": "consultation",
  "content": "Clinical note text..."
}
```

### Summarization
```
GET /api/summaries/{record_id}
Response: {
  "summary": "...",
  "provenance_map": {...},
  "confidence_score": 0.95,
  "generated_at": "2024-12-04T10:30:00Z"
}

POST /api/summaries/{record_id}/verify
Body: {"status": "approved", "clinician_notes": "..."}
```

## Security & Compliance

- **Data Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Authentication**: JWT with RS256
- **HIPAA Compliance**: Audit logging for all data access
- **Access Control**: Role-based (Patient, Clinician, Admin)
- **Data Minimization**: No PII in logs

## Performance Metrics

- **NER Accuracy**: >94% (BioBERT baseline)
- **Summarization Speed**: <2 seconds per record
- **API Response Time**: <500ms (p95)
- **Cache Hit Rate**: >80% for frequent NLP models
- **Database Query Time**: <100ms (p95)

---

## Development Guidelines

1. All code changes require tests with >80% coverage
2. NLP models must be version-controlled in `models/` directory
3. Provenance tracking must be implemented at token level
4. All API responses must include provenance metadata
5. Clinician feedback loops must be logged for model improvement
