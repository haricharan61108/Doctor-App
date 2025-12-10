import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Stethoscope, Pill, GraduationCap, Calendar, FileText, Package, 
  AlertTriangle, CheckCircle, Clock, User, Activity, Heart,
  ChevronRight, LogOut, Home, Users, ClipboardList, Link,
  Beaker, ArrowRight, Info
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// API Functions
const api = {
  // Auth
  login: (data) => axios.post(`${API}/auth/login`, data),
  getRoles: () => axios.get(`${API}/auth/roles`),
  
  // Students
  getStudents: () => axios.get(`${API}/students`),
  getStudent: (id) => axios.get(`${API}/students/${id}`),
  getStudentByName: (name) => axios.get(`${API}/students/by-name/${name}`),
  getStudentHealthStats: (id) => axios.get(`${API}/students/${id}/health-stats`),
  
  // Doctors
  getDoctors: () => axios.get(`${API}/doctors`),
  getDoctor: (id) => axios.get(`${API}/doctors/${id}`),
  getDoctorQueue: (id) => axios.get(`${API}/doctors/${id}/queue`),
  getDoctorPatients: (id) => axios.get(`${API}/doctors/${id}/patients`),
  
  // Appointments
  getAppointments: (params) => axios.get(`${API}/appointments`, { params }),
  createAppointment: (data) => axios.post(`${API}/appointments`, data),
  updateAppointmentStatus: (id, status, notes) => 
    axios.put(`${API}/appointments/${id}/status?status=${status}${notes ? `&notes=${notes}` : ''}`),
  
  // Prescriptions
  getPrescriptions: (params) => axios.get(`${API}/prescriptions`, { params }),
  getPrescription: (id) => axios.get(`${API}/prescriptions/${id}`),
  createPrescription: (data, doctorName, doctorReg) => 
    axios.post(`${API}/prescriptions?doctor_name=${doctorName}&doctor_reg=${doctorReg}`, data),
  updatePrescriptionStatus: (id, status) => 
    axios.put(`${API}/prescriptions/${id}/status?status=${status}`),
  
  // AI Summaries
  getAISummaries: (params) => axios.get(`${API}/ai-summaries`, { params }),
  getAISummary: (id) => axios.get(`${API}/ai-summaries/${id}`),
  getPatientAISummary: (name) => axios.get(`${API}/ai-summaries/patient/${encodeURIComponent(name)}`),
  generateAISummary: (prescriptionId) => axios.post(`${API}/ai-summaries/generate/${prescriptionId}`),
  
  // Provenance
  getProvenanceSource: (type, id) => axios.get(`${API}/provenance/${type}/${id}`),
  
  // Inventory
  getInventory: () => axios.get(`${API}/inventory`),
  getLowStockItems: () => axios.get(`${API}/inventory/low-stock`),
  updateInventory: (id, data) => axios.put(`${API}/inventory/${id}`, data),
  
  // Dispense Requests
  getDispenseRequests: (params) => axios.get(`${API}/dispense-requests`, { params }),
  approveDispenseRequest: (id, pharmacistId, notes) => 
    axios.put(`${API}/dispense-requests/${id}/approve?pharmacist_id=${pharmacistId}${notes ? `&notes=${notes}` : ''}`),
  dispenseRequest: (id, pharmacistId) => 
    axios.put(`${API}/dispense-requests/${id}/dispense?pharmacist_id=${pharmacistId}`),
  rejectDispenseRequest: (id, pharmacistId, notes) => 
    axios.put(`${API}/dispense-requests/${id}/reject?pharmacist_id=${pharmacistId}&notes=${notes}`),
  
  // Seed
  seedDatabase: () => axios.post(`${API}/seed-database`),
};

// Role Selection Page
const RoleSelection = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedRole || !name) return;
    setLoading(true);
    try {
      const response = await api.login({ role: selectedRole, name });
      onLogin(response.data);
    } catch (error) {
      console.error("Login failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" data-testid="role-selection">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Heart className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Healthcare AI Platform</CardTitle>
          <CardDescription>Select your role to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="name-input"
            />
          </div>
          <div className="space-y-2">
            <Label>Select Role</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "student", icon: GraduationCap, label: "Student", desc: "Access health records & book appointments" },
                { id: "doctor", icon: Stethoscope, label: "Doctor", desc: "Manage patients & prescriptions" },
                { id: "pharmacist", icon: Pill, label: "Pharmacist", desc: "Process orders & manage inventory" }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                    selectedRole === role.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  data-testid={`role-${role.id}`}
                >
                  <role.icon className={`h-6 w-6 ${selectedRole === role.id ? "text-blue-600" : "text-gray-500"}`} />
                  <div>
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={!selectedRole || !name || loading}
            data-testid="login-btn"
          >
            {loading ? "Logging in..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Navigation Header
const Header = ({ user, onLogout }) => {
  const roleIcons = {
    student: GraduationCap,
    doctor: Stethoscope,
    pharmacist: Pill
  };
  const RoleIcon = roleIcons[user.role];

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-blue-600" />
          <span className="font-semibold text-lg">Healthcare AI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <RoleIcon className="h-5 w-5 text-gray-500" />
            <span className="font-medium">{user.name}</span>
            <Badge variant="outline" className="capitalize">{user.role}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} data-testid="logout-btn">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

// Provenance Link Component - Clickable link that shows source
const ProvenanceText = ({ segment, onViewSource }) => {
  if (segment.type === "text") {
    return <span>{segment.content}</span>;
  }
  
  if (segment.type === "provenance_link" && segment.provenance) {
    return (
      <button
        onClick={() => onViewSource(segment.provenance)}
        className="text-blue-600 hover:text-blue-800 underline decoration-dotted underline-offset-2 cursor-pointer inline-flex items-center gap-0.5"
        title={`Source: ${segment.provenance.source_field}`}
        data-testid={`provenance-link-${segment.field_type}`}
      >
        {segment.content}
        <Link className="h-3 w-3 ml-0.5" />
      </button>
    );
  }
  
  return <span className="font-medium">{segment.content}</span>;
};

// AI Summary Display with Provenance Links
const AISummaryView = ({ summary, onClose }) => {
  const [sourceData, setSourceData] = useState(null);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [selectedProvenance, setSelectedProvenance] = useState(null);

  const handleViewSource = async (provenance) => {
    setSelectedProvenance(provenance);
    try {
      const response = await api.getProvenanceSource(provenance.source_type, provenance.source_id);
      setSourceData(response.data);
      setShowSourceDialog(true);
    } catch (error) {
      console.error("Failed to fetch source:", error);
    }
  };

  const displayData = summary.display_data || { segments: [], provenance_links: [] };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            AI-Generated Clinical Summary
          </CardTitle>
          <CardDescription>
            Click on any highlighted text to view the original clinical source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {displayData.segments.map((segment, idx) => (
                <ProvenanceText key={idx} segment={segment} onViewSource={handleViewSource} />
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Info className="h-4 w-4" />
              <span>This summary contains {displayData.provenance_links?.length || 0} traceable clinical facts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(displayData.provenance_links || []).slice(0, 8).map((link, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => handleViewSource(link)}
                >
                  {link.field_name}: {link.value.substring(0, 20)}{link.value.length > 20 ? '...' : ''}
                </Badge>
              ))}
              {(displayData.provenance_links || []).length > 8 && (
                <Badge variant="secondary">+{displayData.provenance_links.length - 8} more</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Original Clinical Source
            </DialogTitle>
            <DialogDescription>
              {selectedProvenance && (
                <span>Field: <code className="bg-gray-100 px-1 rounded">{selectedProvenance.source_field}</code></span>
              )}
            </DialogDescription>
          </DialogHeader>
          {sourceData && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  This data was extracted from Prescription #{sourceData.prescription_number}
                </AlertDescription>
              </Alert>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(sourceData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Student Dashboard
const StudentDashboard = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [healthStats, setHealthStats] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({ doctor_id: "", date: "", time: "", reason: "" });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, doctorsRes] = await Promise.all([
        api.getStudents(),
        api.getDoctors()
      ]);
      setStudents(studentsRes.data);
      setDoctors(doctorsRes.data);
      
      // Auto-select first student for demo
      if (studentsRes.data.length > 0) {
        const student = studentsRes.data[0];
        setSelectedStudent(student);
        const [statsRes, prescsRes, apptsRes] = await Promise.all([
          api.getStudentHealthStats(student.id),
          api.getPrescriptions({ patient_name: student.name }),
          api.getAppointments({ student_id: student.id })
        ]);
        setHealthStats(statsRes.data);
        setPrescriptions(prescsRes.data);
        setAppointments(apptsRes.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const [statsRes, prescsRes, apptsRes] = await Promise.all([
        api.getStudentHealthStats(student.id),
        api.getPrescriptions({ patient_name: student.name }),
        api.getAppointments({ student_id: student.id })
      ]);
      setHealthStats(statsRes.data);
      setPrescriptions(prescsRes.data);
      setAppointments(apptsRes.data);
    } catch (error) {
      console.error("Failed to load student data:", error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedStudent || !bookingData.doctor_id) return;
    const doctor = doctors.find(d => d.id === bookingData.doctor_id);
    try {
      await api.createAppointment({
        student_id: selectedStudent.id,
        student_name: selectedStudent.name,
        doctor_id: bookingData.doctor_id,
        doctor_name: doctor?.name || "",
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.reason
      });
      setShowBooking(false);
      setBookingData({ doctor_id: "", date: "", time: "", reason: "" });
      loadData();
    } catch (error) {
      console.error("Failed to book appointment:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6" data-testid="student-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Health Portal</h1>
          <p className="text-gray-500">Welcome, {user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedStudent?.id || ""} onValueChange={(id) => {
            const student = students.find(s => s.id === id);
            if (student) handleSelectStudent(student);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedStudent && healthStats && (
        <>
          {/* Health Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age / Sex</p>
                    <p className="font-semibold">{selectedStudent.age} / {selectedStudent.sex}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Group</p>
                    <p className="font-semibold">{healthStats.blood_group || "Unknown"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prescriptions</p>
                    <p className="font-semibold">{healthStats.prescription_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Appointments</p>
                    <p className="font-semibold">{healthStats.appointment_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Allergies & Conditions */}
          {(healthStats.allergies?.length > 0 || healthStats.chronic_conditions?.length > 0) && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="flex gap-4">
                {healthStats.allergies?.length > 0 && (
                  <span><strong>Allergies:</strong> {healthStats.allergies.join(", ")}</span>
                )}
                {healthStats.chronic_conditions?.length > 0 && (
                  <span><strong>Conditions:</strong> {healthStats.chronic_conditions.join(", ")}</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="appointments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="records">Medical Records</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">My Appointments</h2>
                <Button onClick={() => setShowBooking(true)} data-testid="book-appointment-btn">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
              <div className="grid gap-4">
                {appointments.length === 0 ? (
                  <Card><CardContent className="p-6 text-center text-gray-500">No appointments scheduled</CardContent></Card>
                ) : (
                  appointments.map(apt => (
                    <Card key={apt.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Stethoscope className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{apt.doctor_name}</p>
                            <p className="text-sm text-gray-500">{apt.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{apt.date}</p>
                          <p className="text-sm text-gray-500">{apt.time}</p>
                        </div>
                        <Badge variant={
                          apt.status === "completed" ? "default" :
                          apt.status === "scheduled" ? "secondary" :
                          apt.status === "in-progress" ? "default" : "outline"
                        }>
                          {apt.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              <h2 className="text-lg font-semibold">My Prescriptions</h2>
              <div className="grid gap-4">
                {prescriptions.length === 0 ? (
                  <Card><CardContent className="p-6 text-center text-gray-500">No prescriptions found</CardContent></Card>
                ) : (
                  prescriptions.map(presc => (
                    <Card key={presc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Prescription #{presc.prescription_number}</p>
                              <p className="text-sm text-gray-500">{presc.date} - {presc.clinic}</p>
                            </div>
                          </div>
                          <Badge variant={
                            presc.status === "dispensed" ? "default" :
                            presc.status === "approved" ? "secondary" : "outline"
                          }>
                            {presc.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong>Symptoms:</strong> {presc.symptoms?.join(", ")}</p>
                          <p><strong>Medications:</strong></p>
                          <ul className="list-disc list-inside pl-2">
                            {presc.medicines?.map((med, idx) => (
                              <li key={idx}>{med.name} {med.dosage} - {med.frequency} for {med.duration}</li>
                            ))}
                          </ul>
                          <p><strong>Prescribed by:</strong> {presc.prescriber_name}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
              <h2 className="text-lg font-semibold">Medical Records</h2>
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  Medical records will be displayed here
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Book Appointment Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>Schedule an appointment with a doctor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Doctor</Label>
              <Select value={bookingData.doctor_id} onValueChange={(v) => setBookingData({...bookingData, doctor_id: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={bookingData.date} onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={bookingData.time} onValueChange={(v) => setBookingData({...bookingData, time: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.find(d => d.id === bookingData.doctor_id)?.available_slots?.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    )) || <SelectItem value="09:00">09:00</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason for Visit</Label>
              <Textarea
                placeholder="Describe your symptoms or reason for visit"
                value={bookingData.reason}
                onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBooking(false)}>Cancel</Button>
            <Button onClick={handleBookAppointment}>Book Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Doctor Dashboard
const DoctorDashboard = ({ user }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [queue, setQueue] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSummary, setPatientSummary] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    patient_name: "",
    patient_age: 0,
    patient_sex: "",
    symptoms: [],
    medicines: [],
    recommended_tests: [],
    notes: "",
    clinic: ""
  });
  const [newSymptom, setNewSymptom] = useState("");
  const [newMedicine, setNewMedicine] = useState({ name: "", dosage: "", form: "tablet", frequency: "", duration: "", route: "Oral", quantity: 1 });
  const [newTest, setNewTest] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const doctorsRes = await api.getDoctors();
      setDoctors(doctorsRes.data);
      if (doctorsRes.data.length > 0) {
        const doctor = doctorsRes.data[0];
        setSelectedDoctor(doctor);
        const [queueRes, patientsRes] = await Promise.all([
          api.getDoctorQueue(doctor.id),
          api.getDoctorPatients(doctor.id)
        ]);
        setQueue(queueRes.data);
        setPatients(patientsRes.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    try {
      const [queueRes, patientsRes] = await Promise.all([
        api.getDoctorQueue(doctor.id),
        api.getDoctorPatients(doctor.id)
      ]);
      setQueue(queueRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error("Failed to load doctor data:", error);
    }
  };

  const handleViewPatientSummary = async (patient) => {
    setSelectedPatient(patient);
    try {
      const summaryRes = await api.getPatientAISummary(patient.name);
      setPatientSummary(summaryRes.data);
      setShowSummaryDialog(true);
    } catch (error) {
      console.error("Failed to load patient summary:", error);
      setPatientSummary(null);
      setShowSummaryDialog(true);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.updateAppointmentStatus(appointmentId, status);
      loadData();
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  const handleAddSymptom = () => {
    if (newSymptom.trim()) {
      setPrescriptionData({
        ...prescriptionData,
        symptoms: [...prescriptionData.symptoms, newSymptom.trim()]
      });
      setNewSymptom("");
    }
  };

  const handleAddMedicine = () => {
    if (newMedicine.name.trim()) {
      setPrescriptionData({
        ...prescriptionData,
        medicines: [...prescriptionData.medicines, { ...newMedicine }]
      });
      setNewMedicine({ name: "", dosage: "", form: "tablet", frequency: "", duration: "", route: "Oral", quantity: 1 });
    }
  };

  const handleAddTest = () => {
    if (newTest.trim()) {
      setPrescriptionData({
        ...prescriptionData,
        recommended_tests: [...prescriptionData.recommended_tests, newTest.trim()]
      });
      setNewTest("");
    }
  };

  const handleCreatePrescription = async () => {
    if (!selectedDoctor) {
      alert("Please select a doctor first");
      return;
    }
    if (!prescriptionData.patient_name) {
      alert("Please enter patient name");
      return;
    }
    try {
      await api.createPrescription(
        prescriptionData,
        selectedDoctor.name,
        selectedDoctor.registration_number
      );
      setShowPrescriptionDialog(false);
      setPrescriptionData({
        patient_name: "",
        patient_age: 0,
        patient_sex: "",
        symptoms: [],
        medicines: [],
        recommended_tests: [],
        notes: "",
        clinic: ""
      });
      loadData();
      alert("Prescription created successfully!");
    } catch (error) {
      console.error("Failed to create prescription:", error);
      alert("Failed to create prescription. Please try again.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6" data-testid="doctor-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctor Portal</h1>
          <p className="text-gray-500">Welcome, {user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDoctor?.id || ""} onValueChange={(id) => {
            const doctor = doctors.find(d => d.id === id);
            if (doctor) handleSelectDoctor(doctor);
          }}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPrescriptionDialog(true)} data-testid="write-prescription-btn">
            <FileText className="h-4 w-4 mr-2" />
            Write Prescription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Queue */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Appointment Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {queue.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No appointments in queue</p>
                ) : (
                  queue.map((apt, idx) => (
                    <Card key={apt.id} className={idx === 0 ? "border-blue-500 border-2" : ""}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{apt.student_name}</span>
                          <Badge variant={apt.status === "in-progress" ? "default" : "secondary"}>
                            {apt.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{apt.reason}</p>
                        <div className="flex gap-2">
                          {apt.status === "scheduled" && (
                            <Button size="sm" onClick={() => handleUpdateAppointmentStatus(apt.id, "in-progress")}>
                              Start
                            </Button>
                          )}
                          {apt.status === "in-progress" && (
                            <Button size="sm" onClick={() => handleUpdateAppointmentStatus(apt.id, "completed")}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Patient List with AI Summaries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patients with AI Clinical Summaries
            </CardTitle>
            <CardDescription>
              Click &quot;View Summary&quot; to see AI-generated summaries with provenance links to original clinical data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {patients.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No patients found</p>
                ) : (
                  patients.map(patient => (
                    <Card key={patient.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500">{patient.age} yrs, {patient.sex} • {patient.student_id}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPatientSummary(patient)}
                            data-testid={`view-summary-${patient.name.replace(/\s/g, '-')}`}
                          >
                            <Activity className="h-4 w-4 mr-1" />
                            View Summary
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>AI Clinical Summary - {selectedPatient?.name}</DialogTitle>
            <DialogDescription>
              AI-generated summary with traceable provenance links
            </DialogDescription>
          </DialogHeader>
          {patientSummary ? (
            <AISummaryView summary={patientSummary} onClose={() => setShowSummaryDialog(false)} />
          ) : (
            <Alert>
              <AlertDescription>No AI summary available for this patient yet.</AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Write Prescription Dialog */}
      <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Write Digital Prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input
                  value={prescriptionData.patient_name}
                  onChange={(e) => setPrescriptionData({...prescriptionData, patient_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={prescriptionData.patient_age}
                  onChange={(e) => setPrescriptionData({...prescriptionData, patient_age: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={prescriptionData.patient_sex} onValueChange={(v) => setPrescriptionData({...prescriptionData, patient_sex: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Clinic</Label>
              <Input
                value={prescriptionData.clinic}
                onChange={(e) => setPrescriptionData({...prescriptionData, clinic: e.target.value})}
                placeholder="Clinic name"
              />
            </div>

            <div className="space-y-2">
              <Label>Symptoms</Label>
              <div className="flex gap-2">
                <Input value={newSymptom} onChange={(e) => setNewSymptom(e.target.value)} placeholder="Add symptom" />
                <Button type="button" onClick={handleAddSymptom}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {prescriptionData.symptoms.map((s, idx) => (
                  <Badge key={idx} variant="secondary">
                    {s}
                    <button onClick={() => setPrescriptionData({
                      ...prescriptionData,
                      symptoms: prescriptionData.symptoms.filter((_, i) => i !== idx)
                    })} className="ml-1">×</button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Medications</Label>
              <div className="grid grid-cols-6 gap-2">
                <Input placeholder="Name" value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} />
                <Input placeholder="Dosage" value={newMedicine.dosage} onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})} />
                <Input placeholder="Frequency" value={newMedicine.frequency} onChange={(e) => setNewMedicine({...newMedicine, frequency: e.target.value})} />
                <Input placeholder="Duration" value={newMedicine.duration} onChange={(e) => setNewMedicine({...newMedicine, duration: e.target.value})} />
                <Input type="number" placeholder="Qty" value={newMedicine.quantity} onChange={(e) => setNewMedicine({...newMedicine, quantity: parseInt(e.target.value) || 1})} />
                <Button type="button" onClick={handleAddMedicine}>Add</Button>
              </div>
              <div className="space-y-2 mt-2">
                {prescriptionData.medicines.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{m.name} {m.dosage} - {m.frequency} for {m.duration} (Qty: {m.quantity})</span>
                    <button onClick={() => setPrescriptionData({
                      ...prescriptionData,
                      medicines: prescriptionData.medicines.filter((_, i) => i !== idx)
                    })} className="text-red-500">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recommended Tests</Label>
              <div className="flex gap-2">
                <Input value={newTest} onChange={(e) => setNewTest(e.target.value)} placeholder="Add test" />
                <Button type="button" onClick={handleAddTest}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {prescriptionData.recommended_tests.map((t, idx) => (
                  <Badge key={idx} variant="secondary">
                    {t}
                    <button onClick={() => setPrescriptionData({
                      ...prescriptionData,
                      recommended_tests: prescriptionData.recommended_tests.filter((_, i) => i !== idx)
                    })} className="ml-1">×</button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes / Advice</Label>
              <Textarea
                value={prescriptionData.notes}
                onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}
                placeholder="Clinical notes and advice"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrescriptionDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePrescription}>Create Prescription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Pharmacist Dashboard
const PharmacistDashboard = ({ user }) => {
  const [dispenseRequests, setDispenseRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [pharmacistNotes, setPharmacistNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [requestsRes, inventoryRes, lowStockRes] = await Promise.all([
        api.getDispenseRequests(),
        api.getInventory(),
        api.getLowStockItems()
      ]);
      setDispenseRequests(requestsRes.data);
      setInventory(inventoryRes.data);
      setLowStockItems(lowStockRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestDialog(true);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    try {
      await api.approveDispenseRequest(selectedRequest.id, user.id, pharmacistNotes);
      setShowRequestDialog(false);
      setPharmacistNotes("");
      loadData();
    } catch (error) {
      console.error("Failed to approve request:", error);
    }
  };

  const handleDispenseRequest = async () => {
    if (!selectedRequest) return;
    try {
      await api.dispenseRequest(selectedRequest.id, user.id);
      setShowRequestDialog(false);
      loadData();
    } catch (error) {
      console.error("Failed to dispense:", error);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !pharmacistNotes) return;
    try {
      await api.rejectDispenseRequest(selectedRequest.id, user.id, pharmacistNotes);
      setShowRequestDialog(false);
      setPharmacistNotes("");
      loadData();
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  const handleUpdateStock = async (itemId, newQuantity) => {
    try {
      await api.updateInventory(itemId, { quantity_available: newQuantity });
      loadData();
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const pendingRequests = dispenseRequests.filter(r => r.status === "pending");
  const approvedRequests = dispenseRequests.filter(r => r.status === "approved");

  return (
    <div className="container mx-auto p-4 space-y-6" data-testid="pharmacist-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pharmacist Portal</h1>
          <p className="text-gray-500">Welcome, {user.name}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong className="text-red-600">Low Stock Alert!</strong> {lowStockItems.length} items are below minimum stock level:
            <span className="ml-2">
              {lowStockItems.map(item => `${item.medicine_name} ${item.dosage} (${item.quantity_available} left)`).join(", ")}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="font-semibold text-2xl">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ready to Dispense</p>
                <p className="font-semibold text-2xl">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Inventory Items</p>
                <p className="font-semibold text-2xl">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="font-semibold text-2xl">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Prescription Requests</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Requests ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {pendingRequests.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No pending requests</p>
                    ) : (
                      pendingRequests.map(request => (
                        <Card key={request.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewRequest(request)}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{request.patient_name}</p>
                                <p className="text-sm text-gray-500">
                                  {request.medicines?.length || 0} medication(s)
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Ready to Dispense */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Ready to Dispense ({approvedRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {approvedRequests.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No approved requests</p>
                    ) : (
                      approvedRequests.map(request => (
                        <Card key={request.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewRequest(request)}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{request.patient_name}</p>
                                <p className="text-sm text-gray-500">
                                  {request.medicines?.length || 0} medication(s) - Ready
                                </p>
                              </div>
                              <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); handleDispenseRequest(); }}>
                                Dispense
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Medicine</th>
                      <th className="text-left p-3">Dosage</th>
                      <th className="text-left p-3">Form</th>
                      <th className="text-left p-3">Available</th>
                      <th className="text-left p-3">Min Stock</th>
                      <th className="text-left p-3">Price</th>
                      <th className="text-left p-3">Supplier</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id} className={`border-b ${item.quantity_available < item.minimum_stock ? 'bg-red-50' : ''}`}>
                        <td className="p-3 font-medium">{item.medicine_name}</td>
                        <td className="p-3">{item.dosage}</td>
                        <td className="p-3">{item.form}</td>
                        <td className="p-3">
                          <span className={item.quantity_available < item.minimum_stock ? 'text-red-600 font-bold' : ''}>
                            {item.quantity_available}
                          </span>
                        </td>
                        <td className="p-3">{item.minimum_stock}</td>
                        <td className="p-3">${item.unit_price?.toFixed(2)}</td>
                        <td className="p-3">{item.supplier}</td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStock(item.id, item.quantity_available + 50)}
                          >
                            Restock +50
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Prescription Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium">{selectedRequest.patient_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Medications</p>
                <div className="space-y-2 mt-2">
                  {selectedRequest.medicines?.map((med, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{med.name} {med.dosage}</p>
                      <p className="text-sm text-gray-500">
                        {med.frequency} for {med.duration} • Qty: {med.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={selectedRequest.status === "pending" ? "secondary" : "default"}>
                  {selectedRequest.status}
                </Badge>
              </div>
              {selectedRequest.status === "pending" && (
                <div className="space-y-2">
                  <Label>Pharmacist Notes (optional)</Label>
                  <Textarea
                    value={pharmacistNotes}
                    onChange={(e) => setPharmacistNotes(e.target.value)}
                    placeholder="Add any notes..."
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={handleRejectRequest} disabled={!pharmacistNotes}>
                  Reject
                </Button>
                <Button onClick={handleApproveRequest}>
                  Approve
                </Button>
              </>
            )}
            {selectedRequest?.status === "approved" && (
              <Button onClick={handleDispenseRequest}>
                Mark as Dispensed
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <RoleSelection onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      {user.role === "student" && <StudentDashboard user={user} />}
      {user.role === "doctor" && <DoctorDashboard user={user} />}
      {user.role === "pharmacist" && <PharmacistDashboard user={user} />}
    </div>
  );
}

export default App;
