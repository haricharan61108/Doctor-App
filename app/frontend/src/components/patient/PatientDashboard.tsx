import { useState, useEffect } from "react";
import { Calendar, FileText, User, FolderOpen } from "lucide-react";
import PatientHealthStats from "./PatientHealthStats";
import PatientAppointments from "./PatientAppointments";
import PatientPrescriptions from "./PatientPrescriptions";
import PatientMedicalRecords from "./PatientMedicalRecords";
import PatientBookingModal, { BookingData } from "./PatientBookingModal";
import {
  mockHealthStats,
  Doctor,
} from "./patientDemoData";
import patientApi from "../../services/patientApi";
import Dialog from "../common/Dialog";

interface PatientDashboardProps {
  userName: string;
}

export default function PatientDashboard({ userName }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("appointments");
  const [showBookingModal, setShowBookingModal] = useState(false);

  // State for API data
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // In a real app, these would come from API calls
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [uploadedFilesCount, setUploadedFilesCount] = useState<number>(0);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsData = await patientApi.getAllDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDialog({
          isOpen: true,
          title: 'Error Loading Doctors',
          message: 'Failed to load doctors. Please try again.',
          type: 'error'
        });
      }
    };

    fetchDoctors();
    fetchAppointments();
    fetchPrescriptions();
    fetchUploadedFilesCount();
  }, []);

  const fetchUploadedFilesCount = async () => {
    try {
      const files = await patientApi.getUploadedFiles();
      setUploadedFilesCount(files.length);
    } catch (error) {
      console.error('Error fetching uploaded files count:', error);
    }
  };
  
  //to fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const appointmentsData = await patientApi.getMyAppointments();

      const transformedAppointments = appointmentsData.map((apt: any) =>
        ({
              id: apt.id,
              doctor_name: apt.doctor.name,
              doctor_specialization: apt.doctor.specialization || 'General Medicine',
              date: new Date(apt.scheduledAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              time: new Date(apt.scheduledAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              reason: 'Consultation', 
              status: apt.status === 'BOOKED' ? 'scheduled' :
                      apt.status === 'COMPLETED' ? 'completed' :
                      apt.status === 'CANCELLED' ? 'cancelled' : 'scheduled',
              location: 'Health Center', 
              type: 'in-person' as const
            }));

            setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setDialog({
        isOpen: true,
        title: 'Error Loading Appointments',
        message: 'Failed to load appointments. Please try again.',
        type: 'error'
      });
    }finally {
      setLoadingAppointments(false);
    }
  }

  const fetchPrescriptions = async() => {
    try {
      setLoadingPrescriptions(true);
      const prescriptionsData = await patientApi.getMyPrescriptions();
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setDialog({
        isOpen: true,
        title: 'Error Loading Prescriptions',
        message: 'Failed to load prescriptions. Please try again.',
        type: 'error'
      });
    } finally {
      setLoadingPrescriptions(false);
    }
  }

  const handleBookAppointment = async (bookingData: BookingData) => {
    console.log("Booking appointment:", bookingData);

    try {
      // Use the ISO timestamp directly if available, otherwise convert the time
      let scheduledAt: string;

      if (bookingData.startTimeISO) {
        // Use the original ISO timestamp from the backend
        scheduledAt = bookingData.startTimeISO;
      } else {
        // Fallback: Convert 12-hour time format to 24-hour format for ISO string
        const convertTo24Hour = (time12h: string): string => {
          const [time, modifier] = time12h.split(' ');
          let [hours, minutes] = time.split(':');

          if (hours === '12') {
            hours = '00';
          }

          if (modifier === 'PM') {
            hours = String(parseInt(hours, 10) + 12);
          }

          return `${hours.padStart(2, '0')}:${minutes}:00`;
        };

        const time24 = convertTo24Hour(bookingData.time);
        scheduledAt = `${bookingData.date}T${time24}`;
      }

      const result = await patientApi.bookAppointment({
        doctorId: bookingData.doctor_id,
        scheduledAt: scheduledAt,
        duration: 30,
        timingId: bookingData.timingId,
      });

      setDialog({
        isOpen: true,
        title: 'Appointment Booked Successfully',
        message: `${result.message}\n\nDoctor: ${result.appointment.doctor.name}\nDate: ${bookingData.date}\nTime: ${bookingData.time}`,
        type: 'success'
      });

      // Optionally refresh appointments list here
      await fetchAppointments();
      setShowBookingModal(false);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to book appointment';
      setDialog({
        isOpen: true,
        title: 'Booking Failed',
        message: `Error: ${errorMessage}`,
        type: 'error'
      });
    }
  };

  const tabs = [
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      count: appointments.filter((a) => a.status === "scheduled").length,
    },
    {
      id: "prescriptions",
      label: "Prescriptions",
      icon: FileText,
      count: prescriptions.length,
    },
    {
      id: "records",
      label: "Medical Records",
      icon: FolderOpen,
      count: uploadedFilesCount,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Portal</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back, {userName}!</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">{userName}</span>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
                Patient
              </span>
            </div>
          </div>
        </div>

        {/* Health Stats */}
        <PatientHealthStats healthStats={mockHealthStats} />

        {/* Main Content with Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-max sm:min-w-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 md:px-6 py-3 md:py-4 font-medium text-sm md:text-base flex items-center justify-center gap-2 transition relative ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          activeTab === tab.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-6">
            {activeTab === "appointments" && (
              <PatientAppointments
                appointments={appointments}
                onBookAppointment={() => setShowBookingModal(true)}
              />
            )}

            {activeTab === "prescriptions" && (
              <PatientPrescriptions prescriptions={prescriptions || []} />
            )}

            {activeTab === "records" && <PatientMedicalRecords records={[]} />}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {appointments.filter((a) => a.status === "scheduled").length}
            </p>
            <p className="text-xs md:text-sm text-gray-600">Upcoming</p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FolderOpen className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{uploadedFilesCount}</p>
            <p className="text-xs md:text-sm text-gray-600">Records</p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <PatientBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        doctors={doctors}
        onBookAppointment={handleBookAppointment}
      />
    </div>
  );
}
