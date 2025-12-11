import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  GraduationCap,
  Stethoscope,
  Pill,
  Calendar,
  FileText,
  User,
  LogOut,
  AlertTriangle,
  Clock
} from "lucide-react";
import LoginPage from "./components/login-page";

// ==================== TYPE DEFINITIONS ====================
interface Student {
  id: string;
  name: string;
  age: number;
  sex: string;
  student_id: string;
}

interface HealthStats {
  blood_group: string;
  prescription_count: number;
  appointment_count: number;
  allergies: string[];
  chronic_conditions: string[];
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Appointment {
  id: string;
  student_id: string;
  doctor_name: string;
  date: string;
  time: string;
  reason: string;
  status: string;
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  prescription_number: string;
  patient_name: string;
  date: string;
  clinic: string;
  symptoms: string[];
  medicines: Medicine[];
  prescriber_name: string;
  status: string;
}

interface UserData {
  role: string;
  name: string;
  id: string;
}

interface LoginData {
  role: string;
  name: string;
}

interface BookingData {
  doctor_id: string;
  date: string;
  time: string;
  reason: string;
}

interface AppointmentCreationData extends BookingData {
  student_id: string;
  student_name: string;
  doctor_name: string;
}

interface MockApiResponse<T> {
  data: T;
}

// ==================== MOCK DATA ====================
const MOCK_DATA: {
  students: Student[];
  healthStats: { [key: string]: HealthStats };
  doctors: Doctor[];
  appointments: { [key: string]: Appointment[] };
  prescriptions: { [key: string]: Prescription[] };
} = {
  students: [
    { id: "S001", name: "John Smith", age: 21, sex: "Male", student_id: "STU001" },
    { id: "S002", name: "Emma Johnson", age: 22, sex: "Female", student_id: "STU002" },
    { id: "S003", name: "Michael Brown", age: 20, sex: "Male", student_id: "STU003" }
  ],

  healthStats: {
    "S001": {
      blood_group: "O+",
      prescription_count: 3,
      appointment_count: 5,
      allergies: ["Penicillin", "Peanuts"],
      chronic_conditions: ["Asthma"]
    },
    "S002": {
      blood_group: "A+",
      prescription_count: 2,
      appointment_count: 3,
      allergies: [],
      chronic_conditions: []
    },
    "S003": {
      blood_group: "B+",
      prescription_count: 1,
      appointment_count: 2,
      allergies: ["Shellfish"],
      chronic_conditions: ["Diabetes Type 2"]
    }
  },

  doctors: [
    { id: "D001", name: "Dr. Sarah Williams", specialization: "General Medicine" },
    { id: "D002", name: "Dr. James Anderson", specialization: "Cardiology" },
    { id: "D003", name: "Dr. Maria Garcia", specialization: "Dermatology" },
    { id: "D004", name: "Dr. Robert Chen", specialization: "Orthopedics" }
  ],

  appointments: {
    "S001": [
      {
        id: "A001",
        student_id: "S001",
        doctor_name: "Dr. Sarah Williams",
        date: "2025-12-15",
        time: "09:00",
        reason: "Regular checkup",
        status: "scheduled"
      },
      {
        id: "A002",
        student_id: "S001",
        doctor_name: "Dr. James Anderson",
        date: "2025-12-10",
        time: "14:00",
        reason: "Chest pain consultation",
        status: "completed"
      },
      {
        id: "A003",
        student_id: "S001",
        doctor_name: "Dr. Sarah Williams",
        date: "2025-12-12",
        time: "10:00",
        reason: "Follow-up visit",
        status: "in-progress"
      }
    ],
    "S002": [
      {
        id: "A004",
        student_id: "S002",
        doctor_name: "Dr. Maria Garcia",
        date: "2025-12-20",
        time: "11:00",
        reason: "Skin rash examination",
        status: "scheduled"
      }
    ],
    "S003": [
      {
        id: "A005",
        student_id: "S003",
        doctor_name: "Dr. Sarah Williams",
        date: "2025-12-18",
        time: "15:00",
        reason: "Diabetes management",
        status: "scheduled"
      }
    ]
  },

  prescriptions: {
    "John Smith": [
      {
        id: "P001",
        prescription_number: "RX001",
        patient_name: "John Smith",
        date: "2025-11-28",
        clinic: "University Health Center",
        symptoms: ["Fever", "Cough", "Sore throat"],
        medicines: [
          { name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily", duration: "7 days" },
          { name: "Paracetamol", dosage: "650mg", frequency: "As needed", duration: "5 days" }
        ],
        prescriber_name: "Dr. Sarah Williams",
        status: "dispensed"
      },
      {
        id: "P002",
        prescription_number: "RX002",
        patient_name: "John Smith",
        date: "2025-12-01",
        clinic: "University Health Center",
        symptoms: ["Asthma attack"],
        medicines: [
          { name: "Albuterol Inhaler", dosage: "90mcg", frequency: "2 puffs every 4-6 hours", duration: "30 days" }
        ],
        prescriber_name: "Dr. James Anderson",
        status: "approved"
      },
      {
        id: "P003",
        prescription_number: "RX003",
        patient_name: "John Smith",
        date: "2025-12-05",
        clinic: "University Health Center",
        symptoms: ["Headache", "Eye strain"],
        medicines: [
          { name: "Ibuprofen", dosage: "400mg", frequency: "Twice daily", duration: "3 days" }
        ],
        prescriber_name: "Dr. Sarah Williams",
        status: "pending"
      }
    ],
    "Emma Johnson": [
      {
        id: "P004",
        prescription_number: "RX004",
        patient_name: "Emma Johnson",
        date: "2025-12-03",
        clinic: "University Health Center",
        symptoms: ["Acne"],
        medicines: [
          { name: "Benzoyl Peroxide Gel", dosage: "5%", frequency: "Once daily at night", duration: "30 days" }
        ],
        prescriber_name: "Dr. Maria Garcia",
        status: "dispensed"
      }
    ],
    "Michael Brown": [
      {
        id: "P005",
        prescription_number: "RX005",
        patient_name: "Michael Brown",
        date: "2025-12-07",
        clinic: "University Health Center",
        symptoms: ["High blood sugar", "Fatigue"],
        medicines: [
          { name: "Metformin", dosage: "500mg", frequency: "Twice daily with meals", duration: "30 days" },
          { name: "Vitamin D3", dosage: "1000 IU", frequency: "Once daily", duration: "30 days" }
        ],
        prescriber_name: "Dr. Sarah Williams",
        status: "approved"
      }
    ]
  }
};

// Mock API with delays to simulate real API
const mockApi = {
  login: (data: LoginData): Promise<MockApiResponse<UserData>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            role: data.role,
            name: data.name,
            id: data.role === "student" ? "S001" : data.role === "doctor" ? "D001" : "PH001"
          }
        });
      }, 500);
    });
  },

  getStudents: (): Promise<MockApiResponse<Student[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: MOCK_DATA.students });
      }, 300);
    });
  },

  getStudentHealthStats: (id: string): Promise<MockApiResponse<HealthStats>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: MOCK_DATA.healthStats[id] || {} as HealthStats });
      }, 300);
    });
  },

  getDoctors: (): Promise<MockApiResponse<Doctor[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: MOCK_DATA.doctors });
      }, 300);
    });
  },

  getAppointments: (params: { student_id: string }): Promise<MockApiResponse<Appointment[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const appointments = MOCK_DATA.appointments[params.student_id] || [];
        resolve({ data: appointments });
      }, 300);
    });
  },

  createAppointment: (data: AppointmentCreationData): Promise<MockApiResponse<Appointment>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAppointment: Appointment = {
          id: `A${Date.now()}`,
          student_id: data.student_id,
          doctor_name: data.doctor_name,
          date: data.date,
          time: data.time,
          reason: data.reason,
          status: "scheduled"
        };
        // Add to mock data
        if (!MOCK_DATA.appointments[data.student_id]) {
          MOCK_DATA.appointments[data.student_id] = [];
        }
        MOCK_DATA.appointments[data.student_id].push(newAppointment);
        resolve({ data: newAppointment });
      }, 500);
    });
  },

  getPrescriptions: (params: { patient_name: string }): Promise<MockApiResponse<Prescription[]>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prescriptions = MOCK_DATA.prescriptions[params.patient_name] || [];
        resolve({ data: prescriptions });
      }, 300);
    });
  }
};

// ==================== LOGIN PAGE ====================
// Using imported LoginPage component from components/login-page.tsx

// ==================== HEADER COMPONENT ====================
interface HeaderProps {
  user: UserData;
  onLogout: () => void;
}

function Header({ user, onLogout }: HeaderProps) {
  const roleIcons: { [key: string]: typeof GraduationCap } = {
    student: GraduationCap,
    doctor: Stethoscope,
    pharmacist: Pill
  };
  const RoleIcon = roleIcons[user.role];

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="h-7 w-7 text-blue-600" />
          <span className="font-bold text-xl text-gray-900">Healthcare AI</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">DEMO MODE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
            <RoleIcon className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">{user.name}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded capitalize">
              {user.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ==================== STUDENT DASHBOARD ====================
interface StudentDashboardProps {
  user: UserData;
}

function StudentDashboard({ user }: StudentDashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState<string>("appointments");
  const [showBooking, setShowBooking] = useState<boolean>(false);
  const [bookingData, setBookingData] = useState<BookingData>({ doctor_id: "", date: "", time: "", reason: "" });
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, doctorsRes] = await Promise.all([
        mockApi.getStudents(),
        mockApi.getDoctors()
      ]);
      setStudents(studentsRes.data);
      setDoctors(doctorsRes.data);

      // Auto-select first student
      if (studentsRes.data.length > 0) {
        const student = studentsRes.data[0];
        setSelectedStudent(student);
        const [statsRes, prescsRes, apptsRes] = await Promise.all([
          mockApi.getStudentHealthStats(student.id),
          mockApi.getPrescriptions({ patient_name: student.name }),
          mockApi.getAppointments({ student_id: student.id })
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

  const handleSelectStudent = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setSelectedStudent(student);
    setLoading(true);
    try {
      const [statsRes, prescsRes, apptsRes] = await Promise.all([
        mockApi.getStudentHealthStats(student.id),
        mockApi.getPrescriptions({ patient_name: student.name }),
        mockApi.getAppointments({ student_id: student.id })
      ]);
      setHealthStats(statsRes.data);
      setPrescriptions(prescsRes.data);
      setAppointments(apptsRes.data);
    } catch (error) {
      console.error("Failed to load student data:", error);
    }
    setLoading(false);
  };

  const handleBookAppointment = async () => {
    if (!selectedStudent || !bookingData.doctor_id || !bookingData.date || !bookingData.time) {
      alert("Please fill all fields");
      return;
    }
    const doctor = doctors.find(d => d.id === bookingData.doctor_id);
    try {
      await mockApi.createAppointment({
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
      alert("Appointment booked successfully!");
      loadData();
    } catch (error) {
      console.error("Failed to book appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "scheduled": return "bg-blue-100 text-blue-700";
      case "in-progress": return "bg-yellow-100 text-yellow-700";
      case "dispensed": return "bg-green-100 text-green-700";
      case "approved": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading && !selectedStudent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Health Portal</h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
          </div>
          {students.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Select Student:</label>
              <select
                value={selectedStudent?.id || ""}
                onChange={(e) => handleSelectStudent(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedStudent && healthStats && (
          <>
            {/* Health Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Age / Sex</p>
                    <p className="text-xl font-bold text-gray-900">{selectedStudent.age} / {selectedStudent.sex}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Blood Group</p>
                    <p className="text-xl font-bold text-gray-900">{healthStats.blood_group || "Unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Prescriptions</p>
                    <p className="text-xl font-bold text-gray-900">{healthStats.prescription_count || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Appointments</p>
                    <p className="text-xl font-bold text-gray-900">{healthStats.appointment_count || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Allergies & Conditions Alert */}
            {(healthStats.allergies?.length > 0 || healthStats.chronic_conditions?.length > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  {healthStats.allergies?.length > 0 && (
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Allergies:</span> {healthStats.allergies.join(", ")}
                    </p>
                  )}
                  {healthStats.chronic_conditions?.length > 0 && (
                    <p className="text-sm text-yellow-800 mt-1">
                      <span className="font-semibold">Conditions:</span> {healthStats.chronic_conditions.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200">
                {[
                  { id: "appointments", label: "Appointments", icon: Calendar },
                  { id: "prescriptions", label: "Prescriptions", icon: FileText },
                  { id: "records", label: "Medical Records", icon: FileText }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-4 font-medium text-sm flex items-center justify-center gap-2 transition ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Appointments Tab */}
                {activeTab === "appointments" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
                      <button
                        onClick={() => setShowBooking(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Book Appointment
                      </button>
                    </div>

                    <div className="space-y-4">
                      {appointments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No appointments scheduled</p>
                        </div>
                      ) : (
                        appointments.map(apt => (
                          <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                  <Stethoscope className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{apt.doctor_name}</p>
                                  <p className="text-sm text-gray-600 mt-1">{apt.reason}</p>
                                </div>
                              </div>
                              <div className="text-right mr-4">
                                <p className="font-medium text-gray-900">{apt.date}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {apt.time}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                {apt.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Prescriptions Tab */}
                {activeTab === "prescriptions" && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">My Prescriptions</h2>
                    <div className="space-y-4">
                      {prescriptions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No prescriptions found</p>
                        </div>
                      ) : (
                        prescriptions.map(presc => (
                          <div key={presc.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                  <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">Prescription #{presc.prescription_number}</p>
                                  <p className="text-sm text-gray-600">{presc.date} • {presc.clinic}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(presc.status)}`}>
                                {presc.status}
                              </span>
                            </div>

                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="font-semibold text-gray-700">Symptoms:</p>
                                <p className="text-gray-600">{presc.symptoms?.join(", ") || "N/A"}</p>
                              </div>

                              <div>
                                <p className="font-semibold text-gray-700 mb-2">Medications:</p>
                                <ul className="space-y-2">
                                  {presc.medicines?.map((med, idx) => (
                                    <li key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                                      <Pill className="h-4 w-4 text-gray-500 mt-0.5" />
                                      <span className="text-gray-700">
                                        {med.name} {med.dosage} - {med.frequency} for {med.duration}
                                      </span>
                                    </li>
                                  )) || <p className="text-gray-500">No medications</p>}
                                </ul>
                              </div>

                              <div className="pt-3 border-t border-gray-200">
                                <p className="text-gray-600">
                                  <span className="font-semibold">Prescribed by:</span> {presc.prescriber_name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Medical Records Tab */}
                {activeTab === "records" && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Medical records will be displayed here</p>
                    <p className="text-sm mt-2">This feature is coming soon</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
              <p className="text-gray-600 text-sm mt-1">Schedule an appointment with a doctor</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                <select
                  value={bookingData.doctor_id}
                  onChange={(e) => setBookingData({ ...bookingData, doctor_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select time</option>
                    {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                <textarea
                  placeholder="Describe your symptoms or reason for visit"
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBooking(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN APP COMPONENT ====================
function App() {
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogin = async (credentials: { role: string; credentials: { email?: string; password?: string } }) => {
    // Adapter function to convert new LoginPage credentials to UserData format
    // Map "patient" from LoginPage to "student" for compatibility with existing app logic
    const mappedRole = credentials.role === "patient" ? "student" : credentials.role;

    const userData: UserData = {
      role: mappedRole,
      name: credentials.credentials.email?.split('@')[0] || mappedRole + " User",
      id: mappedRole === "student" ? "S001" : mappedRole === "doctor" ? "D001" : "PH001"
    };
    setUser(userData);
  };

  const handleGoogleLogin = async () => {
    // Handle Google login for patients (map to "student" role)
    const userData: UserData = {
      role: "student",
      name: "Student User",
      id: "S001"
    };
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} initialRole="patient" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      {user.role === "student" && <StudentDashboard user={user} />}
      {user.role !== "student" && (
        <div className="container mx-auto p-8 text-center">
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600">
              {user.role === "doctor" && "Doctor dashboard will be available soon."}
              {user.role === "pharmacist" && "Pharmacist dashboard will be available soon."}
            </p>
            <p className="text-sm text-gray-500 mt-4">Currently using mock data for demonstration</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
