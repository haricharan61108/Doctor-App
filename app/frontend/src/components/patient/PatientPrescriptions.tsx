import { FileText, User, Calendar, Clock, AlertCircle, Pill } from "lucide-react";

interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  content: string;
  status: string;
  createdAt: string;
  issuedAt: string | null;
  expiresAt: string | null;
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  appointment?: {
    scheduledAt: string;
    status: string;
  };
}

interface PatientPrescriptionsProps {
  prescriptions: Prescription[];
}

export default function PatientPrescriptions({ prescriptions }: PatientPrescriptionsProps) {

  if (!prescriptions) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Prescriptions...</h3>
        <p className="text-gray-600">Please wait while we fetch your prescriptions</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Prescriptions</h2>
        <p className="text-sm text-gray-600 mt-1">
          {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""} on record
        </p>
      </div>

      <div className="space-y-5">
        {prescriptions.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescriptions Yet</h3>
            <p className="text-gray-600">Your prescriptions will appear here after doctor consultations</p>
          </div>
        ) : (
          prescriptions.map((presc) => (
            <div
              key={presc.id}
              className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100 rounded-2xl p-5 md:p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              {/* Header Section */}
              <div className="flex items-start gap-4 mb-5 pb-5 border-b-2 border-blue-100">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Medical Prescription
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{formatDate(presc.createdAt)}</span>
                    </div>
                    {presc.appointment && (
                      <>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Appointment: {formatDateTime(presc.appointment.scheduledAt)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="mb-5">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Prescribed by</p>
                      <p className="text-lg font-bold text-gray-900">{presc.doctor.name}</p>
                      <p className="text-sm text-gray-600">{presc.doctor.specialization}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescription Content */}
              <div className="mb-5">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-bold text-gray-900">Prescription Details</h4>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                      {presc.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Created Date */}
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 text-blue-600 mb-1.5">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">Created</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">
                    {formatDate(presc.createdAt)}
                  </p>
                </div>

                {/* Issued Date */}
                {presc.issuedAt && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                    <div className="flex items-center gap-2 text-green-600 mb-1.5">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">Issued</span>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">
                      {formatDate(presc.issuedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
