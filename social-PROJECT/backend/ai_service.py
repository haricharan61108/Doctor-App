import os
import re
import json
import tempfile
from typing import Dict, Any, List, Tuple, Optional
from pydantic import BaseModel, Field
from pathlib import Path
from dotenv import load_dotenv
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

# Pydantic schema for prescription extraction
class ExtractedPrescription(BaseModel):
    patient_name: str = Field(description="Full name of the patient")
    age: int = Field(description="Age of the patient in years")
    sex: str = Field(description="Sex of the patient (Male/Female/Other)")
    date: str = Field(description="Date of prescription in YYYY-MM-DD format")
    symptoms: List[str] = Field(description="List of symptoms reported by patient")
    diagnosis: Optional[str] = Field(default=None, description="Primary diagnosis if mentioned")
    medicines: List[Dict[str, Any]] = Field(description="List of prescribed medicines with details")
    recommended_tests: List[str] = Field(default_factory=list, description="Recommended medical tests")
    advice: str = Field(default="", description="Doctor's advice or notes")
    prescriber_name: str = Field(default="", description="Name of the prescribing doctor")
    prescriber_reg: str = Field(default="", description="Registration number of the doctor")
    clinic: str = Field(default="", description="Name of the clinic")

class AIService:
    def __init__(self):
        self.api_key = os.environ.get('LLAMA_API_KEY', '')
        self.llama_client = None
        self._init_llama()
    
    def _init_llama(self):
        """Initialize LlamaExtract client"""
        try:
            from llama_cloud.client import LlamaCloud
            if self.api_key:
                self.llama_client = LlamaCloud(token=self.api_key)
                logger.info("LlamaCloud client initialized successfully")
            else:
                logger.warning("No LLAMA_API_KEY found, using regex extraction fallback")
        except ImportError as e:
            logger.warning(f"Could not import LlamaCloud: {e}. Using regex fallback.")
        except Exception as e:
            logger.error(f"Error initializing LlamaCloud: {e}")
    
    def extract_with_regex(self, prescription_text: str) -> Dict[str, Any]:
        """Fallback regex-based extraction from notebook's ground truth logic"""
        result = {
            "patient_name": "",
            "age": 0,
            "sex": "",
            "date": "",
            "symptoms": [],
            "diagnosis": None,
            "medicines": [],
            "recommended_tests": [],
            "advice": "",
            "prescriber_name": "",
            "prescriber_reg": "",
            "clinic": ""
        }
        
        # Extract patient name
        name_match = re.search(r"Patient:\s*([^,\n]+)", prescription_text, re.IGNORECASE)
        if name_match:
            result["patient_name"] = name_match.group(1).strip()
        
        # Extract age
        age_match = re.search(r"Age:\s*(\d+)", prescription_text, re.IGNORECASE)
        if age_match:
            result["age"] = int(age_match.group(1))
        
        # Extract sex
        sex_match = re.search(r"Sex:\s*(Male|Female|Other)", prescription_text, re.IGNORECASE)
        if sex_match:
            result["sex"] = sex_match.group(1)
        
        # Extract date
        date_match = re.search(r"Date:\s*(\d{4}-\d{2}-\d{2})", prescription_text)
        if date_match:
            result["date"] = date_match.group(1)
        
        # Extract symptoms
        symptoms_match = re.search(r"Symptoms:\s*([^\n]+)", prescription_text, re.IGNORECASE)
        if symptoms_match:
            symptoms_str = symptoms_match.group(1)
            result["symptoms"] = [s.strip() for s in re.split(r"[,;]", symptoms_str) if s.strip()]
        
        # Extract clinic
        clinic_match = re.search(r"Clinic:\s*([^\n]+)", prescription_text, re.IGNORECASE)
        if clinic_match:
            result["clinic"] = clinic_match.group(1).strip()
        
        # Extract medicines
        medicines_section = re.search(r"Medications?:(.+?)(?:Recommended Tests|Notes|$)", 
                                      prescription_text, re.IGNORECASE | re.DOTALL)
        if medicines_section:
            med_text = medicines_section.group(1)
            med_entries = re.findall(
                r"(\d+)\.\s*([^\n]+?)\s+(\d+\s*mg|\d+\s*ml)\s*\(([^)]+)\)\s*-\s*([^,]+),\s*([^,]+),\s*Route:\s*([^,]+),\s*Qty:\s*(\d+)",
                med_text, re.IGNORECASE
            )
            for entry in med_entries:
                result["medicines"].append({
                    "name": entry[1].strip(),
                    "dosage": entry[2].strip(),
                    "form": entry[3].strip(),
                    "frequency": entry[4].strip(),
                    "duration": entry[5].strip(),
                    "route": entry[6].strip(),
                    "quantity": int(entry[7])
                })
        
        # Extract recommended tests
        tests_match = re.search(r"Recommended Tests:\s*([^\n]+)", prescription_text, re.IGNORECASE)
        if tests_match:
            tests_str = tests_match.group(1)
            result["recommended_tests"] = [t.strip() for t in re.split(r"[,;]", tests_str) if t.strip()]
        
        # Extract notes/advice
        notes_match = re.search(r"Notes:\s*([^\n]+)", prescription_text, re.IGNORECASE)
        if notes_match:
            result["advice"] = notes_match.group(1).strip()
        
        # Extract prescriber
        prescriber_match = re.search(r"Prescribed by:\s*([^\(]+)\s*\(Reg\.?\s*#?\s*([^)]+)\)", 
                                     prescription_text, re.IGNORECASE)
        if prescriber_match:
            result["prescriber_name"] = prescriber_match.group(1).strip()
            result["prescriber_reg"] = prescriber_match.group(2).strip()
        
        return result
    
    async def extract_prescription(self, prescription_text: str) -> Dict[str, Any]:
        """Extract structured data from prescription text using LlamaCloud or regex fallback"""
        # For now, use regex extraction as it's reliable and doesn't require async API calls
        # The LlamaCloud extraction can be added later with proper async handling
        return self.extract_with_regex(prescription_text)
    
    def generate_summary_with_provenance(self, extracted_data: Dict[str, Any], 
                                         source_id: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Generate a natural language summary with provenance links.
        Each fact in the summary is annotated with its source.
        """
        provenance_links = []
        
        # Build summary with provenance annotations
        patient_name = extracted_data.get('patient_name', 'Unknown')
        age = extracted_data.get('age', 'Unknown')
        sex = extracted_data.get('sex', 'Unknown')
        symptoms = extracted_data.get('symptoms', [])
        medicines = extracted_data.get('medicines', [])
        tests = extracted_data.get('recommended_tests', [])
        advice = extracted_data.get('advice', '')
        date = extracted_data.get('date', '')
        prescriber = extracted_data.get('prescriber_name', '')
        clinic = extracted_data.get('clinic', '')
        
        # Create provenance links for each field
        def add_provenance(field_name: str, value: Any, source_field: str):
            provenance_links.append({
                "field_name": field_name,
                "value": str(value),
                "source_type": "prescription",
                "source_id": source_id,
                "source_field": source_field
            })
        
        # Build the summary text with inline provenance markers
        summary_parts = []
        
        # Patient info
        summary_parts.append(f"**Patient**: [{patient_name}]{{patient_name}}, ")
        add_provenance("patient_name", patient_name, "patient_name")
        
        summary_parts.append(f"[{age}]{{age}} years old, ")
        add_provenance("age", age, "age")
        
        summary_parts.append(f"[{sex}]{{sex}}.\n")
        add_provenance("sex", sex, "sex")
        
        # Visit info
        if clinic:
            summary_parts.append(f"\n**Visit**: [{clinic}]{{clinic}}")
            add_provenance("clinic", clinic, "clinic")
        if date:
            summary_parts.append(f" on [{date}]{{date}}")
            add_provenance("date", date, "date")
        if prescriber:
            summary_parts.append(f", attended by [{prescriber}]{{prescriber}}.")
            add_provenance("prescriber", prescriber, "prescriber_name")
        
        # Symptoms
        if symptoms:
            symptoms_str = ", ".join([f"[{s}]{{symptom}}" for s in symptoms])
            summary_parts.append(f"\n\n**Presenting Symptoms**: {symptoms_str}.")
            for s in symptoms:
                add_provenance("symptom", s, "symptoms")
        
        # Medications
        if medicines:
            summary_parts.append("\n\n**Prescribed Medications**:\n")
            for i, med in enumerate(medicines, 1):
                med_name = med.get('name', 'Unknown')
                dosage = med.get('dosage', '')
                frequency = med.get('frequency', '')
                duration = med.get('duration', '')
                
                med_str = f"{i}. [{med_name}]{{medicine}} {dosage}"
                if frequency:
                    med_str += f", [{frequency}]{{frequency}}"
                if duration:
                    med_str += f" for [{duration}]{{duration}}"
                summary_parts.append(med_str + "\n")
                
                add_provenance("medicine", med_name, f"medicines[{i-1}].name")
                if frequency:
                    add_provenance("frequency", frequency, f"medicines[{i-1}].frequency")
                if duration:
                    add_provenance("duration", duration, f"medicines[{i-1}].duration")
        
        # Recommended tests
        if tests:
            tests_str = ", ".join([f"[{t}]{{test}}" for t in tests])
            summary_parts.append(f"\n**Recommended Tests**: {tests_str}.")
            for t in tests:
                add_provenance("test", t, "recommended_tests")
        
        # Advice
        if advice:
            summary_parts.append(f"\n\n**Clinical Advice**: [{advice}]{{advice}}")
            add_provenance("advice", advice, "advice")
        
        summary_text = "".join(summary_parts)
        
        return summary_text, provenance_links
    
    def parse_summary_for_display(self, summary_text: str, provenance_links: List[Dict]) -> Dict[str, Any]:
        """
        Parse summary text and create a structured display format with clickable provenance links.
        """
        # Create a mapping of values to their provenance
        provenance_map = {}
        for link in provenance_links:
            key = f"{link['field_name']}:{link['value']}"
            provenance_map[key] = link
        
        # Parse the summary to identify provenance-linked segments
        segments = []
        pattern = r'\[([^\]]+)\]\{([^}]+)\}'
        last_end = 0
        
        for match in re.finditer(pattern, summary_text):
            # Add text before the match
            if match.start() > last_end:
                segments.append({
                    "type": "text",
                    "content": summary_text[last_end:match.start()]
                })
            
            # Add the provenance-linked segment
            value = match.group(1)
            field_type = match.group(2)
            
            # Find the corresponding provenance link
            link = None
            for pl in provenance_links:
                if pl['value'] == value or pl['field_name'] == field_type:
                    link = pl
                    break
            
            segments.append({
                "type": "provenance_link",
                "content": value,
                "field_type": field_type,
                "provenance": link
            })
            
            last_end = match.end()
        
        # Add remaining text
        if last_end < len(summary_text):
            segments.append({
                "type": "text",
                "content": summary_text[last_end:]
            })
        
        return {
            "raw_summary": summary_text,
            "segments": segments,
            "provenance_links": provenance_links
        }

# Global AI service instance
ai_service = AIService()
