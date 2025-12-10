from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from models import (
    User, UserLogin, Prescription, PrescriptionCreate, Appointment, AppointmentCreate,
    MedicalRecord, AISummary, ProvenanceLink, InventoryItem, InventoryUpdate,
    DispenseRequest, Doctor, Student, Medicine
)
from sample_data import SAMPLE_PRESCRIPTIONS, SAMPLE_DOCTORS, SAMPLE_STUDENTS, SAMPLE_INVENTORY
from ai_service import ai_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'healthcare_ai_db')]

# Create the main app
app = FastAPI(title="Healthcare AI Platform", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Helper function to serialize datetime
def serialize_doc(doc: dict) -> dict:
    """Serialize MongoDB document for JSON response"""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == '_id':
            continue
        if isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result

# ==================== AUTH ENDPOINTS (Mock) ====================

@api_router.post("/auth/login")
async def mock_login(login_data: UserLogin):
    """Mock login - just returns user info based on role selection"""
    user_id = str(uuid.uuid4())
    return {
        "id": user_id,
        "name": login_data.name,
        "role": login_data.role,
        "token": f"mock_token_{user_id}"
    }

@api_router.get("/auth/roles")
async def get_available_roles():
    """Get available user roles"""
    return {
        "roles": [
            {"id": "student", "name": "Student", "description": "Access health records and book appointments"},
            {"id": "doctor", "name": "Doctor", "description": "Manage patients and prescriptions"},
            {"id": "pharmacist", "name": "Pharmacist", "description": "Process orders and manage inventory"}
        ]
    }

# ==================== STUDENTS ENDPOINTS ====================

@api_router.get("/students")
async def get_students():
    """Get all students"""
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    return students

@api_router.get("/students/{student_id}")
async def get_student(student_id: str):
    """Get student by ID"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@api_router.get("/students/by-name/{name}")
async def get_student_by_name(name: str):
    """Get student by name"""
    student = await db.students.find_one({"name": name}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@api_router.get("/students/{student_id}/health-stats")
async def get_student_health_stats(student_id: str):
    """Get health statistics for a student"""
    student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get prescription count
    prescription_count = await db.prescriptions.count_documents({"patient_name": student["name"]})
    
    # Get appointment count
    appointment_count = await db.appointments.count_documents({"student_id": student_id})
    
    # Get recent prescriptions
    recent_prescriptions = await db.prescriptions.find(
        {"patient_name": student["name"]},
        {"_id": 0}
    ).sort("date", -1).limit(3).to_list(3)
    
    return {
        "student": student,
        "prescription_count": prescription_count,
        "appointment_count": appointment_count,
        "recent_prescriptions": recent_prescriptions,
        "blood_group": student.get("blood_group", "Unknown"),
        "allergies": student.get("allergies", []),
        "chronic_conditions": student.get("chronic_conditions", [])
    }

# ==================== DOCTORS ENDPOINTS ====================

@api_router.get("/doctors")
async def get_doctors():
    """Get all doctors"""
    doctors = await db.doctors.find({}, {"_id": 0}).to_list(1000)
    return doctors

@api_router.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    """Get doctor by ID"""
    doctor = await db.doctors.find_one({"id": doctor_id}, {"_id": 0})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@api_router.get("/doctors/{doctor_id}/queue")
async def get_doctor_queue(doctor_id: str):
    """Get appointment queue for a doctor"""
    appointments = await db.appointments.find(
        {"doctor_id": doctor_id, "status": {"$in": ["scheduled", "in-progress"]}},
        {"_id": 0}
    ).sort("date", 1).to_list(100)
    return appointments

@api_router.get("/doctors/{doctor_id}/patients")
async def get_doctor_patients(doctor_id: str):
    """Get all patients (students) who have had appointments with this doctor"""
    appointments = await db.appointments.find(
        {"doctor_id": doctor_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Get unique patient IDs
    patient_ids = list(set([apt["student_id"] for apt in appointments]))
    
    patients = await db.students.find(
        {"id": {"$in": patient_ids}},
        {"_id": 0}
    ).to_list(100)
    
    return patients

# ==================== APPOINTMENTS ENDPOINTS ====================

@api_router.get("/appointments")
async def get_appointments(student_id: Optional[str] = None, doctor_id: Optional[str] = None):
    """Get appointments with optional filters"""
    query = {}
    if student_id:
        query["student_id"] = student_id
    if doctor_id:
        query["doctor_id"] = doctor_id
    
    appointments = await db.appointments.find(query, {"_id": 0}).to_list(1000)
    return appointments

@api_router.post("/appointments")
async def create_appointment(appointment: AppointmentCreate):
    """Create a new appointment"""
    apt_dict = appointment.model_dump()
    apt_dict["id"] = str(uuid.uuid4())
    apt_dict["status"] = "scheduled"
    apt_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.appointments.insert_one(apt_dict)
    return apt_dict

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str, notes: Optional[str] = None):
    """Update appointment status"""
    update_data = {"status": status}
    if notes:
        update_data["notes"] = notes
    
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    updated = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    return updated

# ==================== PRESCRIPTIONS ENDPOINTS ====================

@api_router.get("/prescriptions")
async def get_prescriptions(patient_name: Optional[str] = None, status: Optional[str] = None):
    """Get prescriptions with optional filters"""
    query = {}
    if patient_name:
        query["patient_name"] = patient_name
    if status:
        query["status"] = status
    
    prescriptions = await db.prescriptions.find(query, {"_id": 0}).to_list(1000)
    return prescriptions

@api_router.get("/prescriptions/{prescription_id}")
async def get_prescription(prescription_id: str):
    """Get prescription by ID"""
    prescription = await db.prescriptions.find_one({"id": prescription_id}, {"_id": 0})
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription

@api_router.post("/prescriptions")
async def create_prescription(prescription: PrescriptionCreate, doctor_name: str, doctor_reg: str):
    """Create a new prescription"""
    # Get next prescription number
    last_prescription = await db.prescriptions.find_one(
        sort=[("prescription_number", -1)]
    )
    next_number = (last_prescription.get("prescription_number", 0) + 1) if last_prescription else 1
    
    presc_dict = prescription.model_dump()
    presc_dict["id"] = str(uuid.uuid4())
    presc_dict["prescription_number"] = next_number
    presc_dict["prescriber_name"] = doctor_name
    presc_dict["prescriber_reg_number"] = doctor_reg
    presc_dict["date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    presc_dict["status"] = "pending"
    presc_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    # Convert medicines to dict format
    presc_dict["medicines"] = [m if isinstance(m, dict) else m.model_dump() for m in presc_dict["medicines"]]
    
    await db.prescriptions.insert_one(presc_dict)
    
    # Create dispense request
    dispense_request = {
        "id": str(uuid.uuid4()),
        "prescription_id": presc_dict["id"],
        "patient_name": presc_dict["patient_name"],
        "medicines": presc_dict["medicines"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.dispense_requests.insert_one(dispense_request)
    
    # Remove MongoDB _id before returning
    presc_dict.pop("_id", None)
    return presc_dict

@api_router.put("/prescriptions/{prescription_id}/status")
async def update_prescription_status(prescription_id: str, status: str):
    """Update prescription status"""
    result = await db.prescriptions.update_one(
        {"id": prescription_id},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    updated = await db.prescriptions.find_one({"id": prescription_id}, {"_id": 0})
    return updated

# ==================== MEDICAL RECORDS ENDPOINTS ====================

@api_router.get("/medical-records")
async def get_medical_records(patient_name: Optional[str] = None):
    """Get medical records with optional patient filter"""
    query = {}
    if patient_name:
        query["patient_name"] = patient_name
    
    records = await db.medical_records.find(query, {"_id": 0}).to_list(1000)
    return records

@api_router.get("/medical-records/{record_id}")
async def get_medical_record(record_id: str):
    """Get medical record by ID"""
    record = await db.medical_records.find_one({"id": record_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record

@api_router.post("/medical-records")
async def create_medical_record(record: MedicalRecord):
    """Create a new medical record"""
    record_dict = record.model_dump()
    record_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.medical_records.insert_one(record_dict)
    return record_dict

# ==================== AI SUMMARIES ENDPOINTS ====================

@api_router.get("/ai-summaries")
async def get_ai_summaries(patient_name: Optional[str] = None):
    """Get AI-generated summaries with provenance links"""
    query = {}
    if patient_name:
        query["patient_name"] = patient_name
    
    summaries = await db.ai_summaries.find(query, {"_id": 0}).to_list(1000)
    return summaries

@api_router.get("/ai-summaries/{summary_id}")
async def get_ai_summary(summary_id: str):
    """Get AI summary by ID with full provenance details"""
    summary = await db.ai_summaries.find_one({"id": summary_id}, {"_id": 0})
    if not summary:
        raise HTTPException(status_code=404, detail="AI summary not found")
    
    # Parse the summary for display with provenance links
    display_data = ai_service.parse_summary_for_display(
        summary.get("summary_text", ""),
        summary.get("provenance_links", [])
    )
    
    return {
        **summary,
        "display_data": display_data
    }

@api_router.get("/ai-summaries/patient/{patient_name}")
async def get_patient_ai_summary(patient_name: str):
    """Get AI summary for a specific patient"""
    summary = await db.ai_summaries.find_one({"patient_name": patient_name}, {"_id": 0})
    if not summary:
        raise HTTPException(status_code=404, detail="AI summary not found for this patient")
    
    # Parse the summary for display
    display_data = ai_service.parse_summary_for_display(
        summary.get("summary_text", ""),
        summary.get("provenance_links", [])
    )
    
    return {
        **summary,
        "display_data": display_data
    }

@api_router.post("/ai-summaries/generate/{prescription_id}")
async def generate_ai_summary(prescription_id: str):
    """Generate AI summary with provenance for a prescription"""
    prescription = await db.prescriptions.find_one({"id": prescription_id}, {"_id": 0})
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Convert prescription to extraction format
    extracted_data = {
        "patient_name": prescription.get("patient_name", ""),
        "age": prescription.get("patient_age", 0),
        "sex": prescription.get("patient_sex", ""),
        "date": prescription.get("date", ""),
        "symptoms": prescription.get("symptoms", []),
        "diagnosis": None,
        "medicines": prescription.get("medicines", []),
        "recommended_tests": prescription.get("recommended_tests", []),
        "advice": prescription.get("notes", ""),
        "prescriber_name": prescription.get("prescriber_name", ""),
        "prescriber_reg": prescription.get("prescriber_reg_number", ""),
        "clinic": prescription.get("clinic", "")
    }
    
    # Generate summary with provenance
    summary_text, provenance_links = ai_service.generate_summary_with_provenance(
        extracted_data, prescription_id
    )
    
    # Create AI summary document
    ai_summary = {
        "id": str(uuid.uuid4()),
        "patient_id": prescription.get("patient_id", ""),
        "patient_name": prescription.get("patient_name", ""),
        "summary_text": summary_text,
        "provenance_links": provenance_links,
        "raw_data": extracted_data,
        "prescription_id": prescription_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Check if summary already exists for this patient
    existing = await db.ai_summaries.find_one({"patient_name": prescription.get("patient_name")})
    if existing:
        await db.ai_summaries.update_one(
            {"patient_name": prescription.get("patient_name")},
            {"$set": ai_summary}
        )
    else:
        await db.ai_summaries.insert_one(ai_summary)
    
    # Parse for display
    display_data = ai_service.parse_summary_for_display(summary_text, provenance_links)
    
    return {
        **ai_summary,
        "display_data": display_data
    }

@api_router.get("/provenance/{source_type}/{source_id}")
async def get_provenance_source(source_type: str, source_id: str):
    """Get the original source document for a provenance link"""
    collection_map = {
        "prescription": "prescriptions",
        "medical_record": "medical_records",
        "lab_result": "lab_results"
    }
    
    collection_name = collection_map.get(source_type)
    if not collection_name:
        raise HTTPException(status_code=400, detail="Invalid source type")
    
    doc = await db[collection_name].find_one({"id": source_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Source document not found")
    
    return doc

# ==================== INVENTORY ENDPOINTS ====================

@api_router.get("/inventory")
async def get_inventory():
    """Get all inventory items"""
    items = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.get("/inventory/low-stock")
async def get_low_stock_items():
    """Get items with stock below minimum"""
    items = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    low_stock = [item for item in items if item.get("quantity_available", 0) < item.get("minimum_stock", 10)]
    return low_stock

@api_router.get("/inventory/{item_id}")
async def get_inventory_item(item_id: str):
    """Get inventory item by ID"""
    item = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@api_router.put("/inventory/{item_id}")
async def update_inventory(item_id: str, update: InventoryUpdate):
    """Update inventory quantity"""
    result = await db.inventory.update_one(
        {"id": item_id},
        {"$set": {
            "quantity_available": update.quantity_available,
            "last_restocked": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    updated = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    return updated

# ==================== DISPENSE REQUESTS ENDPOINTS ====================

@api_router.get("/dispense-requests")
async def get_dispense_requests(status: Optional[str] = None):
    """Get dispense requests with optional status filter"""
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.dispense_requests.find(query, {"_id": 0}).to_list(1000)
    return requests

@api_router.put("/dispense-requests/{request_id}/approve")
async def approve_dispense_request(request_id: str, pharmacist_id: str, notes: Optional[str] = None):
    """Approve a dispense request"""
    request = await db.dispense_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Dispense request not found")
    
    # Update inventory
    for medicine in request.get("medicines", []):
        await db.inventory.update_one(
            {"medicine_name": medicine["name"], "dosage": medicine["dosage"]},
            {"$inc": {"quantity_available": -medicine.get("quantity", 1)}}
        )
    
    # Update request status
    await db.dispense_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "approved",
            "pharmacist_id": pharmacist_id,
            "pharmacist_notes": notes
        }}
    )
    
    # Update prescription status
    await db.prescriptions.update_one(
        {"id": request["prescription_id"]},
        {"$set": {"status": "approved"}}
    )
    
    updated = await db.dispense_requests.find_one({"id": request_id}, {"_id": 0})
    return updated

@api_router.put("/dispense-requests/{request_id}/dispense")
async def dispense_medication(request_id: str, pharmacist_id: str):
    """Mark medication as dispensed"""
    request = await db.dispense_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Dispense request not found")
    
    await db.dispense_requests.update_one(
        {"id": request_id},
        {"$set": {"status": "dispensed", "pharmacist_id": pharmacist_id}}
    )
    
    # Update prescription status
    await db.prescriptions.update_one(
        {"id": request["prescription_id"]},
        {"$set": {"status": "dispensed"}}
    )
    
    updated = await db.dispense_requests.find_one({"id": request_id}, {"_id": 0})
    return updated

@api_router.put("/dispense-requests/{request_id}/reject")
async def reject_dispense_request(request_id: str, pharmacist_id: str, notes: str):
    """Reject a dispense request"""
    await db.dispense_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": "rejected",
            "pharmacist_id": pharmacist_id,
            "pharmacist_notes": notes
        }}
    )
    
    updated = await db.dispense_requests.find_one({"id": request_id}, {"_id": 0})
    return updated

# ==================== SEEDING ENDPOINT ====================

@api_router.post("/seed-database")
async def seed_database():
    """Seed database with sample data and generate AI summaries"""
    # Clear existing data
    await db.prescriptions.delete_many({})
    await db.doctors.delete_many({})
    await db.students.delete_many({})
    await db.inventory.delete_many({})
    await db.ai_summaries.delete_many({})
    await db.dispense_requests.delete_many({})
    await db.appointments.delete_many({})
    
    # Seed doctors
    doctors_with_ids = []
    for doc in SAMPLE_DOCTORS:
        doc_with_id = {**doc, "id": str(uuid.uuid4())}
        doctors_with_ids.append(doc_with_id)
    await db.doctors.insert_many(doctors_with_ids)
    
    # Seed students
    students_with_ids = []
    for student in SAMPLE_STUDENTS:
        student_with_id = {**student, "id": str(uuid.uuid4())}
        students_with_ids.append(student_with_id)
    await db.students.insert_many(students_with_ids)
    
    # Seed inventory
    inventory_with_ids = []
    for item in SAMPLE_INVENTORY:
        item_with_id = {
            **item,
            "id": str(uuid.uuid4()),
            "last_restocked": datetime.now(timezone.utc).isoformat()
        }
        inventory_with_ids.append(item_with_id)
    await db.inventory.insert_many(inventory_with_ids)
    
    # Seed prescriptions and generate AI summaries
    prescriptions_with_ids = []
    ai_summaries = []
    dispense_requests = []
    
    for presc in SAMPLE_PRESCRIPTIONS:
        presc_id = str(uuid.uuid4())
        presc_with_id = {
            **presc,
            "id": presc_id,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        prescriptions_with_ids.append(presc_with_id)
        
        # Create dispense request
        dispense_request = {
            "id": str(uuid.uuid4()),
            "prescription_id": presc_id,
            "patient_name": presc["patient_name"],
            "medicines": presc["medicines"],
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        dispense_requests.append(dispense_request)
        
        # Generate AI summary with provenance
        extracted_data = {
            "patient_name": presc.get("patient_name", ""),
            "age": presc.get("patient_age", 0),
            "sex": presc.get("patient_sex", ""),
            "date": presc.get("date", ""),
            "symptoms": presc.get("symptoms", []),
            "diagnosis": None,
            "medicines": presc.get("medicines", []),
            "recommended_tests": presc.get("recommended_tests", []),
            "advice": presc.get("notes", ""),
            "prescriber_name": presc.get("prescriber_name", ""),
            "prescriber_reg": presc.get("prescriber_reg_number", ""),
            "clinic": presc.get("clinic", "")
        }
        
        summary_text, provenance_links = ai_service.generate_summary_with_provenance(
            extracted_data, presc_id
        )
        
        # Find student ID
        student = next((s for s in students_with_ids if s["name"] == presc["patient_name"]), None)
        patient_id = student["id"] if student else ""
        
        ai_summary = {
            "id": str(uuid.uuid4()),
            "patient_id": patient_id,
            "patient_name": presc.get("patient_name", ""),
            "summary_text": summary_text,
            "provenance_links": provenance_links,
            "raw_data": extracted_data,
            "prescription_id": presc_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        ai_summaries.append(ai_summary)
    
    await db.prescriptions.insert_many(prescriptions_with_ids)
    await db.ai_summaries.insert_many(ai_summaries)
    await db.dispense_requests.insert_many(dispense_requests)
    
    # Create some sample appointments
    sample_appointments = []
    for i, student in enumerate(students_with_ids[:5]):
        doctor = doctors_with_ids[i % len(doctors_with_ids)]
        appointment = {
            "id": str(uuid.uuid4()),
            "student_id": student["id"],
            "student_name": student["name"],
            "doctor_id": doctor["id"],
            "doctor_name": doctor["name"],
            "date": "2025-08-15",
            "time": doctor["available_slots"][0],
            "reason": "General checkup",
            "status": "scheduled",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        sample_appointments.append(appointment)
    
    await db.appointments.insert_many(sample_appointments)
    
    return {
        "message": "Database seeded successfully",
        "counts": {
            "doctors": len(doctors_with_ids),
            "students": len(students_with_ids),
            "prescriptions": len(prescriptions_with_ids),
            "inventory_items": len(inventory_with_ids),
            "ai_summaries": len(ai_summaries),
            "dispense_requests": len(dispense_requests),
            "appointments": len(sample_appointments)
        }
    }

# ==================== ROOT ENDPOINT ====================

@api_router.get("/")
async def root():
    return {
        "message": "Healthcare AI Platform API",
        "version": "1.0.0",
        "endpoints": [
            "/api/auth/login",
            "/api/auth/roles",
            "/api/students",
            "/api/doctors",
            "/api/appointments",
            "/api/prescriptions",
            "/api/medical-records",
            "/api/ai-summaries",
            "/api/inventory",
            "/api/dispense-requests",
            "/api/seed-database"
        ]
    }

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
