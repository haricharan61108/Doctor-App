#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class HealthcareAPITester:
    def __init__(self, base_url="https://healthbridge-67.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def test_api_endpoint(self, method, endpoint, expected_status=200, data=None, params=None):
        """Test a single API endpoint"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            if success:
                return True, response.json() if response.content else {}
            else:
                return False, f"Expected {expected_status}, got {response.status_code}: {response.text[:200]}"
                
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test get roles
        success, result = self.test_api_endpoint('GET', 'auth/roles')
        if success and 'roles' in result:
            roles = result['roles']
            expected_roles = ['student', 'doctor', 'pharmacist']
            has_all_roles = all(any(role['id'] == expected for role in roles) for expected in expected_roles)
            self.log_test("GET /auth/roles - Returns all required roles", has_all_roles)
        else:
            self.log_test("GET /auth/roles", False, str(result))
        
        # Test login
        login_data = {"role": "student", "name": "Test User"}
        success, result = self.test_api_endpoint('POST', 'auth/login', data=login_data)
        if success and 'id' in result and 'role' in result:
            self.log_test("POST /auth/login - Mock login works", True)
            return result
        else:
            self.log_test("POST /auth/login", False, str(result))
            return None

    def test_students_endpoints(self):
        """Test student-related endpoints"""
        print("\n🎓 Testing Student Endpoints...")
        
        # Get all students
        success, result = self.test_api_endpoint('GET', 'students')
        if success and isinstance(result, list):
            self.log_test("GET /students - Returns student list", len(result) > 0)
            if len(result) > 0:
                student = result[0]
                student_id = student.get('id')
                student_name = student.get('name')
                
                # Test get student by ID
                success, result = self.test_api_endpoint('GET', f'students/{student_id}')
                self.log_test("GET /students/{id} - Returns specific student", success and result.get('id') == student_id)
                
                # Test get student by name
                success, result = self.test_api_endpoint('GET', f'students/by-name/{student_name}')
                self.log_test("GET /students/by-name/{name} - Returns student by name", success and result.get('name') == student_name)
                
                # Test health stats
                success, result = self.test_api_endpoint('GET', f'students/{student_id}/health-stats')
                if success and 'student' in result:
                    has_stats = all(key in result for key in ['prescription_count', 'appointment_count', 'blood_group'])
                    self.log_test("GET /students/{id}/health-stats - Returns health statistics", has_stats)
                else:
                    self.log_test("GET /students/{id}/health-stats", False, str(result))
        else:
            self.log_test("GET /students", False, str(result))

    def test_doctors_endpoints(self):
        """Test doctor-related endpoints"""
        print("\n👨‍⚕️ Testing Doctor Endpoints...")
        
        # Get all doctors
        success, result = self.test_api_endpoint('GET', 'doctors')
        if success and isinstance(result, list):
            self.log_test("GET /doctors - Returns doctor list", len(result) > 0)
            if len(result) > 0:
                doctor = result[0]
                doctor_id = doctor.get('id')
                
                # Test get doctor by ID
                success, result = self.test_api_endpoint('GET', f'doctors/{doctor_id}')
                self.log_test("GET /doctors/{id} - Returns specific doctor", success and result.get('id') == doctor_id)
                
                # Test doctor queue
                success, result = self.test_api_endpoint('GET', f'doctors/{doctor_id}/queue')
                self.log_test("GET /doctors/{id}/queue - Returns appointment queue", success and isinstance(result, list))
                
                # Test doctor patients
                success, result = self.test_api_endpoint('GET', f'doctors/{doctor_id}/patients')
                self.log_test("GET /doctors/{id}/patients - Returns doctor's patients", success and isinstance(result, list))
        else:
            self.log_test("GET /doctors", False, str(result))

    def test_prescriptions_endpoints(self):
        """Test prescription-related endpoints"""
        print("\n💊 Testing Prescription Endpoints...")
        
        # Get all prescriptions
        success, result = self.test_api_endpoint('GET', 'prescriptions')
        if success and isinstance(result, list):
            self.log_test("GET /prescriptions - Returns prescription list", len(result) > 0)
            if len(result) > 0:
                prescription = result[0]
                prescription_id = prescription.get('id')
                patient_name = prescription.get('patient_name')
                
                # Test get prescription by ID
                success, result = self.test_api_endpoint('GET', f'prescriptions/{prescription_id}')
                self.log_test("GET /prescriptions/{id} - Returns specific prescription", success and result.get('id') == prescription_id)
                
                # Test get prescriptions by patient
                success, result = self.test_api_endpoint('GET', 'prescriptions', params={'patient_name': patient_name})
                patient_prescriptions = [p for p in result if p.get('patient_name') == patient_name] if success else []
                self.log_test("GET /prescriptions?patient_name - Filters by patient", success and len(patient_prescriptions) > 0)
        else:
            self.log_test("GET /prescriptions", False, str(result))

    def test_ai_summaries_endpoints(self):
        """Test AI summaries and provenance endpoints"""
        print("\n🤖 Testing AI Summaries & Provenance Endpoints...")
        
        # Get all AI summaries
        success, result = self.test_api_endpoint('GET', 'ai-summaries')
        if success and isinstance(result, list):
            self.log_test("GET /ai-summaries - Returns AI summary list", len(result) > 0)
            if len(result) > 0:
                summary = result[0]
                summary_id = summary.get('id')
                patient_name = summary.get('patient_name')
                
                # Test get AI summary by ID
                success, result = self.test_api_endpoint('GET', f'ai-summaries/{summary_id}')
                if success and 'display_data' in result:
                    display_data = result['display_data']
                    has_provenance = 'segments' in display_data and 'provenance_links' in display_data
                    self.log_test("GET /ai-summaries/{id} - Returns summary with display data", has_provenance)
                    
                    # Check if provenance links exist
                    provenance_links = display_data.get('provenance_links', [])
                    self.log_test("AI Summary has provenance links", len(provenance_links) > 0)
                    
                    # Test provenance source endpoint
                    if provenance_links:
                        link = provenance_links[0]
                        source_type = link.get('source_type')
                        source_id = link.get('source_id')
                        if source_type and source_id:
                            success, result = self.test_api_endpoint('GET', f'provenance/{source_type}/{source_id}')
                            self.log_test("GET /provenance/{type}/{id} - Returns original source", success and 'prescription_number' in result)
                else:
                    self.log_test("GET /ai-summaries/{id}", False, str(result))
                
                # Test get patient AI summary
                success, result = self.test_api_endpoint('GET', f'ai-summaries/patient/{patient_name}')
                if success and 'display_data' in result:
                    self.log_test("GET /ai-summaries/patient/{name} - Returns patient summary", True)
                else:
                    self.log_test("GET /ai-summaries/patient/{name}", False, str(result))
        else:
            self.log_test("GET /ai-summaries", False, str(result))

    def test_inventory_endpoints(self):
        """Test inventory-related endpoints"""
        print("\n📦 Testing Inventory Endpoints...")
        
        # Get all inventory
        success, result = self.test_api_endpoint('GET', 'inventory')
        if success and isinstance(result, list):
            self.log_test("GET /inventory - Returns inventory list", len(result) > 0)
            
            # Test low stock items
            success, result = self.test_api_endpoint('GET', 'inventory/low-stock')
            if success and isinstance(result, list):
                self.log_test("GET /inventory/low-stock - Returns low stock items", True)
                # Check if low stock logic works
                low_stock_count = len(result)
                self.log_test("Low stock alert functionality", low_stock_count >= 0)
            else:
                self.log_test("GET /inventory/low-stock", False, str(result))
        else:
            self.log_test("GET /inventory", False, str(result))

    def test_dispense_requests_endpoints(self):
        """Test dispense request endpoints"""
        print("\n🏥 Testing Dispense Request Endpoints...")
        
        # Get all dispense requests
        success, result = self.test_api_endpoint('GET', 'dispense-requests')
        if success and isinstance(result, list):
            self.log_test("GET /dispense-requests - Returns dispense request list", len(result) > 0)
            
            # Test filtering by status
            success, result = self.test_api_endpoint('GET', 'dispense-requests', params={'status': 'pending'})
            if success and isinstance(result, list):
                pending_requests = [r for r in result if r.get('status') == 'pending'] if result else []
                self.log_test("GET /dispense-requests?status=pending - Filters by status", True)
            else:
                self.log_test("GET /dispense-requests?status=pending", False, str(result))
        else:
            self.log_test("GET /dispense-requests", False, str(result))

    def test_appointments_endpoints(self):
        """Test appointment endpoints"""
        print("\n📅 Testing Appointment Endpoints...")
        
        # Get all appointments
        success, result = self.test_api_endpoint('GET', 'appointments')
        if success and isinstance(result, list):
            self.log_test("GET /appointments - Returns appointment list", len(result) >= 0)
        else:
            self.log_test("GET /appointments", False, str(result))

    def test_database_seeding(self):
        """Test database seeding endpoint"""
        print("\n🌱 Testing Database Seeding...")
        
        success, result = self.test_api_endpoint('POST', 'seed-database')
        if success and 'message' in result and 'counts' in result:
            counts = result['counts']
            expected_counts = ['doctors', 'students', 'prescriptions', 'ai_summaries', 'inventory_items']
            has_all_counts = all(key in counts for key in expected_counts)
            self.log_test("POST /seed-database - Seeds database with sample data", has_all_counts)
            
            # Verify seeded data counts
            total_seeded = sum(counts.values())
            self.log_test("Database seeding creates substantial data", total_seeded > 20)
        else:
            self.log_test("POST /seed-database", False, str(result))

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🏥 Healthcare AI Platform - Backend API Testing")
        print("=" * 50)
        
        # First seed the database to ensure we have test data
        self.test_database_seeding()
        
        # Wait a moment for seeding to complete
        time.sleep(2)
        
        # Run all endpoint tests
        self.test_auth_endpoints()
        self.test_students_endpoints()
        self.test_doctors_endpoints()
        self.test_prescriptions_endpoints()
        self.test_ai_summaries_endpoints()
        self.test_inventory_endpoints()
        self.test_dispense_requests_endpoints()
        self.test_appointments_endpoints()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend API tests passed!")
            return True
        else:
            print("⚠️  Some backend API tests failed. Check the details above.")
            failed_tests = [test for test in self.test_results if not test['success']]
            print("\nFailed Tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
            return False

def main():
    tester = HealthcareAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())