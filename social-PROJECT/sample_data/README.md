# Sample Data & Test Cases

This directory contains synthetic medical records and test cases for development and testing of the AI-Powered Medical Diary & Clinician Dashboard.

## Contents

- **synthetic_notes/** - Sample clinical notes and records
- **test_cases/** - NER, summarization, and provenance test cases
- **expected_outputs/** - Expected outputs for validation

## Synthetic Data Examples

### Consultation Note
- Patient with Type 2 Diabetes on Metformin 500mg BID
- Current vital signs: BP 140/90, HR 78 bpm
- Prescribed Aspirin for headache management

### Lab Report
- Fasting Blood Sugar: 145 mg/dL (HIGH)
- HbA1c: 7.8% (HIGH)
- Complete metabolic panel

## Test Cases

### NER Tests (50+ cases)
- Medication and dosage extraction
- Condition identification
- Lab value recognition
- Vital sign parsing

### Summarization Tests (20+ cases)
- Multi-note synthesis
- Temporal reasoning
- Medication tracking
- Clinical outcome tracking

### Provenance Tests (15+ cases)
- Token-level source attribution
- Cross-reference validation
- Confidence scoring

## Usage

```python
import json

# Load test cases
with open('sample_data/test_cases/ner_test_cases.json') as f:
    test_cases = json.load(f)
```

## Privacy Note

**All data is completely synthetic and generated for testing purposes only.**

No real patient information is included in this directory.

---

**Last Updated**: December 2024
