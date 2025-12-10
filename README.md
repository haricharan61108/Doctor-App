# Doctor App - Healthcare AI Platform

A comprehensive healthcare management system with AI-powered features for students, doctors, and pharmacists.

## 📁 Project Structure

```
Doctor-app/
├── app/                      # New rebuilt version
│   ├── frontend/            # React + Tailwind CSS frontend
│   └── backend/             # Node.js + Express + Prisma backend (coming soon)
└── social-PROJECT/          # Original Python FastAPI version
    ├── frontend/            # React frontend with Radix UI
    ├── backend/             # Python FastAPI backend
    ├── docs/                # Technical documentation
    ├── tests/               # Test suite
    └── sample_data/         # Sample medical records
```

## 🚀 New App (app/)

### Frontend
- **Tech Stack:** React 18, Tailwind CSS, Axios, Lucide React
- **Features:**
  - Student health portal with appointments & prescriptions
  - Mock data for demo without backend
  - Consolidated single-file components
  - Responsive design

#### Running Frontend
```bash
cd app/frontend
npm install
npm start
```
The app will open at http://localhost:3000

**Note:** Currently using mock data - no backend required!

### Backend (Coming Soon)
- **Tech Stack:** Node.js, Express, Prisma, PostgreSQL
- Will replace Python backend with Node.js

## 📦 Original Project (social-PROJECT/)

### Frontend
- React 18 with Radix UI components
- 48+ reusable UI components
- Multiple role support (Student, Doctor, Pharmacist)

### Backend
- Python 3.10+ with FastAPI
- MongoDB database
- BioBERT for medical NLP
- AI-powered clinical summaries with provenance tracking

#### Running Original Project

**Backend:**
```bash
cd social-PROJECT/backend
pip install -r requirements.txt
python server.py
```

**Frontend:**
```bash
cd social-PROJECT/frontend
npm install
npm start
```

## 🎯 Features

### Student Portal
- Health statistics dashboard
- Appointments management
- Prescriptions viewing
- Medical records access
- Allergy & condition tracking

### Doctor Portal (Original)
- Patient management
- Appointment queue
- Prescription creation
- AI clinical summaries with provenance

### Pharmacist Portal (Original)
- Prescription processing
- Inventory management
- Low stock alerts
- Dispense request handling

## 🔧 Tech Stack Comparison

| Feature | Original (social-PROJECT) | New (app) |
|---------|--------------------------|-----------|
| Frontend | React + Radix UI | React + Tailwind CSS |
| Backend | Python FastAPI | Node.js + Express (planned) |
| Database | MongoDB | PostgreSQL + Prisma (planned) |
| AI/NLP | BioBERT + spaCy | TBD |
| Components | 48+ separate files | Consolidated single files |

## 📝 Current Status

- ✅ New frontend with mock data (fully functional)
- ⏳ New backend (in development)
- ✅ Original full-stack app (working)

## 🤝 Contributing

This is a learning/demo project. Feel free to fork and experiment!

## 📄 License

MIT License

---

**Last Updated:** December 2025
