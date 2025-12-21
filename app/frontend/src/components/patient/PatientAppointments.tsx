import { Calendar, Clock, Stethoscope, MapPin, Video, Phone } from "lucide-react";
import { Appointment } from "./patientDemoData";

interface PatientAppointmentsProps {
  appointments: Appointment[];
  onBookAppointment: () => void;
}

export default function PatientAppointments({ appointments, onBookAppointment }: PatientAppointmentsProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type?: string): string => {
    switch (type) {
      case "video":
        return "text-purple-600 bg-purple-50";
      case "phone":
        return "text-green-600 bg-green-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  // Separate upcoming and past appointments
  const upcomingAppointments = appointments.filter(apt => apt.status === "scheduled");
  const pastAppointments = appointments.filter(apt => apt.status !== "scheduled");

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Appointments</h2>
          <p className="text-sm text-gray-600 mt-1">
            {upcomingAppointments.length} upcoming, {pastAppointments.length} past
          </p>
        </div>
        <button
          onClick={onBookAppointment}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
        >
          <Calendar className="h-4 w-4" />
          Book New Appointment
        </button>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Appointments
          </h3>
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex-shrink-0">
                      <Stethoscope className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-base md:text-lg truncate">
                            {apt.doctor_name}
                          </h4>
                          <p className="text-sm text-gray-600">{apt.doctor_specialization}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)} flex-shrink-0`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{apt.reason}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{apt.time}</span>
                        </div>
                        {apt.location && (
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${getTypeColor(apt.type)}`}>
                            {getTypeIcon(apt.type)}
                            <span className="font-medium text-xs">{apt.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 lg:flex-col lg:w-24">
                    <button className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                      Join
                    </button>
                    <button className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Past Appointments
          </h3>
          <div className="space-y-3">
            {pastAppointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-gray-200 rounded-lg flex-shrink-0">
                      <Stethoscope className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">{apt.doctor_name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(apt.status)} flex-shrink-0`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{apt.reason}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">{apt.date}</p>
                    <p className="text-xs text-gray-600">{apt.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
          <p className="text-gray-600 mb-6">Book your first appointment to get started</p>
          <button
            onClick={onBookAppointment}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2 font-medium"
          >
            <Calendar className="h-4 w-4" />
            Book Your First Appointment
          </button>
        </div>
      )}
    </div>
  );
}
