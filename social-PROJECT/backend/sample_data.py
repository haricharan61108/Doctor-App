"""Sample prescription data for seeding the database"""

SAMPLE_PRESCRIPTIONS = [
    {
        "prescription_number": 1,
        "clinic": "Wellness Care",
        "date": "2024-12-29",
        "patient_name": "Diya Sharma",
        "patient_age": 36,
        "patient_sex": "Male",
        "symptoms": ["Cough", "Shortness of breath"],
        "medicines": [
            {"name": "Ranitidine", "dosage": "300 mg", "form": "tablet", "frequency": "Once daily", "duration": "3 days", "route": "Oral", "quantity": 3}
        ],
        "recommended_tests": ["ECG"],
        "notes": "Follow up after completion of medication.",
        "prescriber_name": "Dr. Shreya Gupta",
        "prescriber_reg_number": "eab9f811"
    },
    {
        "prescription_number": 2,
        "clinic": "Downtown Family Practice",
        "date": "2025-09-23",
        "patient_name": "Sneha Nair",
        "patient_age": 84,
        "patient_sex": "Other",
        "symptoms": ["Sore throat", "Abdominal pain", "Vomiting", "Fatigue"],
        "medicines": [
            {"name": "Metformin", "dosage": "850 mg", "form": "tablet", "frequency": "Twice daily", "duration": "5 days", "route": "Oral", "quantity": 5},
            {"name": "Amoxicillin", "dosage": "250 mg", "form": "capsule", "frequency": "Once at night", "duration": "3 days", "route": "Oral", "quantity": 3},
            {"name": "Metformin", "dosage": "850 mg", "form": "tablet", "frequency": "When required (PRN)", "duration": "3 days", "route": "Inhalation", "quantity": 3}
        ],
        "recommended_tests": ["Chest X-Ray"],
        "notes": "Stay hydrated and take adequate rest.",
        "prescriber_name": "Dr. Nisha Patel",
        "prescriber_reg_number": "eba37f6b"
    },
    {
        "prescription_number": 3,
        "clinic": "Sunrise Medical Center",
        "date": "2024-11-24",
        "patient_name": "Neha Pandey",
        "patient_age": 47,
        "patient_sex": "Other",
        "symptoms": ["Shortness of breath", "Headache"],
        "medicines": [
            {"name": "Amoxicillin", "dosage": "250 mg", "form": "capsule", "frequency": "When required (PRN)", "duration": "3 days", "route": "Inhalation", "quantity": 3},
            {"name": "Ibuprofen", "dosage": "400 mg", "form": "tablet", "frequency": "Every 6 hours", "duration": "7 days", "route": "Oral", "quantity": 7}
        ],
        "recommended_tests": ["LFT (Liver Function Test)"],
        "notes": "Return if symptoms worsen.",
        "prescriber_name": "Dr. Suresh Desai",
        "prescriber_reg_number": "c7e372c0"
    },
    {
        "prescription_number": 4,
        "clinic": "Healing Hands Clinic",
        "date": "2025-05-25",
        "patient_name": "Ishaan Pandey",
        "patient_age": 82,
        "patient_sex": "Male",
        "symptoms": ["Cough", "Abdominal pain"],
        "medicines": [
            {"name": "Prednisolone", "dosage": "10 mg", "form": "tablet", "frequency": "When required (PRN)", "duration": "3 days", "route": "Oral", "quantity": 3},
            {"name": "Paracetamol", "dosage": "650 mg", "form": "tablet", "frequency": "Once at night", "duration": "7 days", "route": "Oral", "quantity": 7}
        ],
        "recommended_tests": ["KFT (Kidney Function Test)", "ECG"],
        "notes": "Follow up after completion of medication.",
        "prescriber_name": "Dr. Shreya Joshi",
        "prescriber_reg_number": "af01657e"
    },
    {
        "prescription_number": 5,
        "clinic": "Sunrise Medical Center",
        "date": "2024-12-16",
        "patient_name": "Meera Chopra",
        "patient_age": 83,
        "patient_sex": "Female",
        "symptoms": ["Fatigue", "Cough"],
        "medicines": [
            {"name": "Ranitidine", "dosage": "300 mg", "form": "tablet", "frequency": "Every 8 hours", "duration": "10 days", "route": "Oral", "quantity": 10},
            {"name": "Cetirizine", "dosage": "10 mg", "form": "tablet", "frequency": "Every 8 hours", "duration": "10 days", "route": "Oral", "quantity": 10}
        ],
        "recommended_tests": ["ECG"],
        "notes": "Follow up after completion of medication.",
        "prescriber_name": "Dr. Rahul Patel",
        "prescriber_reg_number": "02b96e1d"
    },
    {
        "prescription_number": 6,
        "clinic": "Healing Hands Clinic",
        "date": "2025-02-16",
        "patient_name": "Karan Pandey",
        "patient_age": 9,
        "patient_sex": "Female",
        "symptoms": ["Vomiting", "Abdominal pain", "Nausea", "Fatigue"],
        "medicines": [
            {"name": "Amoxicillin", "dosage": "500 mg", "form": "capsule", "frequency": "Once at night", "duration": "5 days", "route": "Inhalation", "quantity": 5},
            {"name": "Paracetamol", "dosage": "650 mg", "form": "tablet", "frequency": "Every 8 hours", "duration": "5 days", "route": "Topical", "quantity": 5}
        ],
        "recommended_tests": ["CBC (Complete Blood Count)", "CRP Test", "KFT (Kidney Function Test)"],
        "notes": "Stay hydrated and take adequate rest.",
        "prescriber_name": "Dr. Meera Iyer",
        "prescriber_reg_number": "f5de608e"
    },
    {
        "prescription_number": 7,
        "clinic": "City Health Clinic",
        "date": "2025-02-27",
        "patient_name": "Kabir Singh",
        "patient_age": 48,
        "patient_sex": "Male",
        "symptoms": ["Vomiting"],
        "medicines": [
            {"name": "Metformin", "dosage": "850 mg", "form": "tablet", "frequency": "Twice daily", "duration": "3 days", "route": "Oral", "quantity": 3}
        ],
        "recommended_tests": ["Urine Routine", "CBC (Complete Blood Count)"],
        "notes": "Follow up after completion of medication.",
        "prescriber_name": "Dr. Arvind Patel",
        "prescriber_reg_number": "05ef0a02"
    },
    {
        "prescription_number": 8,
        "clinic": "Wellness Care",
        "date": "2025-07-08",
        "patient_name": "Sneha Singh",
        "patient_age": 17,
        "patient_sex": "Other",
        "symptoms": ["Nausea", "Cough", "Fatigue", "Dizziness"],
        "medicines": [
            {"name": "Atorvastatin", "dosage": "20 mg", "form": "tablet", "frequency": "Once at night", "duration": "14 days", "route": "Inhalation", "quantity": 14},
            {"name": "Amoxicillin", "dosage": "250 mg", "form": "capsule", "frequency": "Twice daily", "duration": "3 days", "route": "Oral", "quantity": 3}
        ],
        "recommended_tests": ["Blood Glucose Fasting", "LFT (Liver Function Test)", "ECG"],
        "notes": "Stay hydrated and take adequate rest.",
        "prescriber_name": "Dr. Rahul Joshi",
        "prescriber_reg_number": "e0621311"
    },
    {
        "prescription_number": 9,
        "clinic": "Downtown Family Practice",
        "date": "2025-04-08",
        "patient_name": "Riya Sharma",
        "patient_age": 10,
        "patient_sex": "Other",
        "symptoms": ["Sore throat"],
        "medicines": [
            {"name": "Amoxicillin", "dosage": "250 mg", "form": "capsule", "frequency": "Thrice daily", "duration": "10 days", "route": "Oral", "quantity": 10},
            {"name": "Cefixime", "dosage": "200 mg", "form": "tablet", "frequency": "Every 6 hours", "duration": "14 days", "route": "Topical", "quantity": 14}
        ],
        "recommended_tests": ["CBC (Complete Blood Count)"],
        "notes": "Follow up after completion of medication.",
        "prescriber_name": "Dr. Vikram Gupta",
        "prescriber_reg_number": "d3f97e28"
    },
    {
        "prescription_number": 10,
        "clinic": "City Health Clinic",
        "date": "2024-12-04",
        "patient_name": "Diya Kumar",
        "patient_age": 85,
        "patient_sex": "Female",
        "symptoms": ["Runny nose", "Dizziness", "Abdominal pain"],
        "medicines": [
            {"name": "Metformin", "dosage": "500 mg", "form": "tablet", "frequency": "Twice daily", "duration": "5 days", "route": "Oral", "quantity": 5},
            {"name": "Cefixime", "dosage": "400 mg", "form": "tablet", "frequency": "Twice daily", "duration": "10 days", "route": "Oral", "quantity": 10},
            {"name": "Ibuprofen", "dosage": "400 mg", "form": "tablet", "frequency": "Twice daily", "duration": "3 days", "route": "Inhalation", "quantity": 3}
        ],
        "recommended_tests": ["CBC (Complete Blood Count)", "CRP Test", "Lipid Profile"],
        "notes": "Stay hydrated and take adequate rest.",
        "prescriber_name": "Dr. Nisha Patel",
        "prescriber_reg_number": "a5f2d41d"
    }
]

SAMPLE_DOCTORS = [
    {"name": "Dr. Shreya Gupta", "specialization": "General Physician", "registration_number": "eab9f811", "available_slots": ["09:00", "10:00", "11:00", "14:00", "15:00"]},
    {"name": "Dr. Nisha Patel", "specialization": "Internal Medicine", "registration_number": "eba37f6b", "available_slots": ["09:30", "10:30", "11:30", "14:30", "15:30"]},
    {"name": "Dr. Suresh Desai", "specialization": "Pulmonologist", "registration_number": "c7e372c0", "available_slots": ["10:00", "11:00", "12:00", "15:00", "16:00"]},
    {"name": "Dr. Rahul Patel", "specialization": "Cardiologist", "registration_number": "02b96e1d", "available_slots": ["08:00", "09:00", "10:00", "13:00", "14:00"]},
    {"name": "Dr. Meera Iyer", "specialization": "Pediatrician", "registration_number": "f5de608e", "available_slots": ["09:00", "10:00", "11:00", "14:00", "15:00"]}
]

SAMPLE_STUDENTS = [
    {"name": "Diya Sharma", "age": 36, "sex": "Male", "student_id": "STU001", "email": "diya.sharma@college.edu", "blood_group": "O+", "allergies": [], "chronic_conditions": []},
    {"name": "Sneha Nair", "age": 84, "sex": "Other", "student_id": "STU002", "email": "sneha.nair@college.edu", "blood_group": "A+", "allergies": ["Penicillin"], "chronic_conditions": ["Diabetes"]},
    {"name": "Neha Pandey", "age": 47, "sex": "Other", "student_id": "STU003", "email": "neha.pandey@college.edu", "blood_group": "B+", "allergies": [], "chronic_conditions": []},
    {"name": "Ishaan Pandey", "age": 82, "sex": "Male", "student_id": "STU004", "email": "ishaan.pandey@college.edu", "blood_group": "AB+", "allergies": [], "chronic_conditions": ["Hypertension"]},
    {"name": "Meera Chopra", "age": 83, "sex": "Female", "student_id": "STU005", "email": "meera.chopra@college.edu", "blood_group": "O-", "allergies": ["Sulfa drugs"], "chronic_conditions": []},
    {"name": "Karan Pandey", "age": 9, "sex": "Female", "student_id": "STU006", "email": "karan.pandey@college.edu", "blood_group": "A-", "allergies": [], "chronic_conditions": []},
    {"name": "Kabir Singh", "age": 48, "sex": "Male", "student_id": "STU007", "email": "kabir.singh@college.edu", "blood_group": "B-", "allergies": [], "chronic_conditions": []},
    {"name": "Sneha Singh", "age": 17, "sex": "Other", "student_id": "STU008", "email": "sneha.singh@college.edu", "blood_group": "AB-", "allergies": ["Aspirin"], "chronic_conditions": []},
    {"name": "Riya Sharma", "age": 10, "sex": "Other", "student_id": "STU009", "email": "riya.sharma@college.edu", "blood_group": "O+", "allergies": [], "chronic_conditions": []},
    {"name": "Diya Kumar", "age": 85, "sex": "Female", "student_id": "STU010", "email": "diya.kumar@college.edu", "blood_group": "A+", "allergies": [], "chronic_conditions": ["Arthritis"]}
]

SAMPLE_INVENTORY = [
    {"medicine_name": "Ranitidine", "dosage": "300 mg", "form": "tablet", "quantity_available": 500, "minimum_stock": 50, "unit_price": 2.50, "supplier": "PharmaCorp"},
    {"medicine_name": "Metformin", "dosage": "850 mg", "form": "tablet", "quantity_available": 300, "minimum_stock": 30, "unit_price": 3.00, "supplier": "MediSupply"},
    {"medicine_name": "Amoxicillin", "dosage": "250 mg", "form": "capsule", "quantity_available": 400, "minimum_stock": 40, "unit_price": 4.50, "supplier": "PharmaCorp"},
    {"medicine_name": "Amoxicillin", "dosage": "500 mg", "form": "capsule", "quantity_available": 350, "minimum_stock": 35, "unit_price": 6.00, "supplier": "PharmaCorp"},
    {"medicine_name": "Ibuprofen", "dosage": "400 mg", "form": "tablet", "quantity_available": 600, "minimum_stock": 60, "unit_price": 1.50, "supplier": "MediSupply"},
    {"medicine_name": "Prednisolone", "dosage": "10 mg", "form": "tablet", "quantity_available": 200, "minimum_stock": 20, "unit_price": 5.00, "supplier": "HealthFirst"},
    {"medicine_name": "Paracetamol", "dosage": "650 mg", "form": "tablet", "quantity_available": 800, "minimum_stock": 80, "unit_price": 1.00, "supplier": "GenericMeds"},
    {"medicine_name": "Cetirizine", "dosage": "10 mg", "form": "tablet", "quantity_available": 450, "minimum_stock": 45, "unit_price": 2.00, "supplier": "PharmaCorp"},
    {"medicine_name": "Atorvastatin", "dosage": "20 mg", "form": "tablet", "quantity_available": 250, "minimum_stock": 25, "unit_price": 8.00, "supplier": "HealthFirst"},
    {"medicine_name": "Cefixime", "dosage": "200 mg", "form": "tablet", "quantity_available": 180, "minimum_stock": 18, "unit_price": 7.50, "supplier": "MediSupply"},
    {"medicine_name": "Cefixime", "dosage": "400 mg", "form": "tablet", "quantity_available": 150, "minimum_stock": 15, "unit_price": 10.00, "supplier": "MediSupply"},
    {"medicine_name": "Metformin", "dosage": "500 mg", "form": "tablet", "quantity_available": 5, "minimum_stock": 30, "unit_price": 2.50, "supplier": "MediSupply"},  # Low stock!
    {"medicine_name": "Ibuprofen", "dosage": "200 mg", "form": "tablet", "quantity_available": 8, "minimum_stock": 50, "unit_price": 1.00, "supplier": "GenericMeds"}  # Low stock!
]
