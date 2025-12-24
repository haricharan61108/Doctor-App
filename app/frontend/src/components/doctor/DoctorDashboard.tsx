import { Stethoscope, Users, FileText, Clock, Calendar, User, Mail,
  Phone } from "lucide-react";
  import { useState, useEffect } from "react";
  import doctorApi, { Appointment } from "../../services/doctorApi";
  import AppointmentDetailModal from "./AppointmentDetailModal";

interface DoctorDashboardProps {
  userName: string;
}

export default function DoctorDashboard({ userName }: DoctorDashboardProps) {

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const[loading, setLoading] = useState(true);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(()=> {
    const fetchAppointments = async()=> {
      try {
        setLoading(true);
        const data = await doctorApi.getAllAppointments();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        alert('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  },[]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Doctor Portal</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Welcome, Dr. {userName}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border 
  border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total
  Patients</p>
                  <p className="text-2xl font-bold 
  text-gray-900">{appointments.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border 
  border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 
  font-medium">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(apt => new Date(apt.scheduledAt)
  > new Date()).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border 
  border-gray-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 
  font-medium">Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(apt => {
                      const today = new Date().toDateString();
                      return new Date(apt.scheduledAt).toDateString() ===
  today;
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-xl shadow-sm border 
  border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r 
  from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex 
  items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Your Appointments
              </h2>
              <p className="text-sm text-gray-600 mt-1">All booked
  appointments with patients</p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 
  border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 
  text-gray-300" />
                  <p className="text-lg font-semibold">No appointments
  yet</p>
                  <p className="text-sm mt-2">Your booked appointments
  will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4
  hover:shadow-md transition-shadow cursor-pointer hover:border-blue-400"
                      onClick={() => {
                        setSelectedAppointmentId(appointment.id);
                        setIsModalOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-gradient-to-br 
  from-blue-100 to-indigo-100 rounded-lg">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold 
  text-gray-900">
                                {appointment.patient.name || 'Patient'}
                              </h3>
                              <span className="px-3 py-1 bg-green-100 
  text-green-700 text-xs font-semibold rounded-full">
                                {appointment.status}
                              </span>
                            </div>

                            <div className="space-y-1 text-sm 
  text-gray-600">
                              {appointment.patient.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{appointment.patient.email}</span>
                                </div>
                              )}
                              {appointment.patient.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{appointment.patient.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="flex items-center gap-2 
  text-gray-900 font-semibold mb-1">
                            <Calendar className="h-4 w-4 text-gray-500" />

  <span>{formatDate(appointment.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 
  text-gray-600 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />

  <span>{formatTime(appointment.scheduledAt)}</span>
                            <span className="text-gray-400">•</span>
                            <span>{appointment.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointmentId(null);
          }}
          appointmentId={selectedAppointmentId}
        />
      )}
    </div>
  );
}
