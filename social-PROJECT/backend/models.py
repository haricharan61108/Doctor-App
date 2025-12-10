from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str  # student, doctor, pharmacist
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    role: str
    name: str

# Medicine Model
class Medicine(BaseModel):
    name: str
    dosage: str
    form: str
    frequency: str
    duration: str
    route: str
    quantity: int

# Prescription Model
class Prescription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prescription_number: int
    clinic: str
    date: str
    patient_name: str
    patient_age: int
    patient_sex: str
    symptoms: List[str]
    medicines: List[Medicine]
    recommended_tests: List[str]
    notes: str
    prescriber_name: str
    prescriber_reg_number: str
    status: str = "pending"  # pending, approved, dispensed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PrescriptionCreate(BaseModel):
    patient_name: str
    patient_age: int
    patient_sex: str
    symptoms: List[str]
    medicines: List[Medicine]
    recommended_tests: List[str]
    notes: str
    clinic: str

# Appointment Model
class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    student_name: str
    doctor_id: str
    doctor_name: str
    date: str
    time: str
    reason: str
    status: str = "scheduled"  # scheduled, in-progress, completed, cancelled
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    student_id: str
    student_name: str
    doctor_id: str
    doctor_name: str
    date: str
    time: str
    reason: str

# Medical Record Model
class MedicalRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    patient_name: str
    record_type: str  # prescription, lab_result, diagnosis
    description: str
    details: Dict[str, Any]
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Provenance Link Model
class ProvenanceLink(BaseModel):
    field_name: str
    value: str
    source_type: str  # prescription, medical_record, lab_result
    source_id: str
    source_field: str

# AI Summary with Provenance Model
class AISummary(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    patient_name: str
    summary_text: str
    provenance_links: List[ProvenanceLink]
    raw_data: Dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Inventory Model
class InventoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    medicine_name: str
    dosage: str
    form: str
    quantity_available: int
    minimum_stock: int = 10
    unit_price: float
    supplier: str
    last_restocked: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InventoryUpdate(BaseModel):
    quantity_available: int

# Dispense Request Model
class DispenseRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prescription_id: str
    patient_name: str
    medicines: List[Medicine]
    status: str = "pending"  # pending, approved, dispensed, rejected
    pharmacist_id: Optional[str] = None
    pharmacist_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Doctor Model
class Doctor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    specialization: str
    registration_number: str
    available_slots: List[str] = []

# Student/Patient Model  
class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age: int
    sex: str
    student_id: str
    email: str
    blood_group: Optional[str] = None
    allergies: List[str] = []
    chronic_conditions: List[str] = []
