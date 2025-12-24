import { FileText, User, Calendar, Clock, AlertCircle, Eye } from "lucide-react";

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
      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 
border-dashed border-gray-200">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading
 Prescriptions...</h3>
        <p className="text-gray-600">Please wait while we fetch your
prescriptions</p>
      </div>
    );
  }
  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case "READY_FOR_PICKUP":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "PICKED_UP":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status.toUpperCase()) {
      case "READY_FOR_PICKUP":
        return "Ready for Pickup";
      case "PENDING":
        return "Pending";
      case "PICKED_UP":
        return "Picked Up";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

      <div className="space-y-4 md:space-y-5">
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
              className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex-shrink-0">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                      Prescription #{presc.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs md:text-sm text-gray-600">
                      <span>{formatDate(presc.createdAt)}</span>
                      {presc.appointment && (
                        <>
                          <span>•</span>
                          <span>Appointment: {formatDate(presc.appointment.scheduledAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(presc.status)} flex-shrink-0 self-start sm:self-center`}
                >
                  {getStatusText(presc.status)}
                </span>
              </div>

              {/* Body */}
              <div className="space-y-4">
                {/* Doctor Information */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Prescribed by</h4>
                      <p className="text-base md:text-lg font-bold text-gray-900">{presc.doctor.name}</p>
                      <p className="text-sm text-gray-600">{presc.doctor.specialization}</p>
                    </div>
                  </div>
                </div>

                {/* Prescription Content */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Prescription Details
                  </h4>
                  <div className="bg-white p-4 rounded border border-gray-100">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {presc.content}
                    </p>
                  </div>
                </div>

                {/* Dates Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Created On</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {formatDate(presc.createdAt)}
                    </p>
                  </div>

                  {presc.issuedAt && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Issued On</span>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {formatDate(presc.issuedAt)}
                      </p>
                    </div>
                  )}

                  {presc.expiresAt && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-700 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Expires On</span>
                      </div>
                      <p className="text-yellow-900 font-semibold">
                        {formatDate(presc.expiresAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                  <div className="text-xs md:text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Prescription ID:</span>{" "}
                    {presc.id}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {prescriptions.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-green-600">
              {prescriptions.filter((p) => p.status.toUpperCase() === "PICKED_UP").length}
            </p>
            <p className="text-xs md:text-sm text-green-700 font-medium mt-1">Picked Up</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-blue-600">
              {prescriptions.filter((p) => p.status.toUpperCase() === "READY_FOR_PICKUP").length}
            </p>
            <p className="text-xs md:text-sm text-blue-700 font-medium mt-1">Ready</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">
              {prescriptions.filter((p) => p.status.toUpperCase() === "PENDING").length}
            </p>
            <p className="text-xs md:text-sm text-yellow-700 font-medium mt-1">Pending</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-gray-600">
              {prescriptions.filter((p) => p.status.toUpperCase() === "COMPLETED").length}
            </p>
            <p className="text-xs md:text-sm text-gray-700 font-medium mt-1">Completed</p>
          </div>
        </div>
      )}
    </div>
  );
}
