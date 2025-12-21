import { FileText, Pill, AlertCircle, Download, Eye } from "lucide-react";
import { Prescription } from "./patientDemoData";

interface PatientPrescriptionsProps {
  prescriptions: Prescription[];
}

export default function PatientPrescriptions({ prescriptions }: PatientPrescriptionsProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "dispensed":
        return "bg-green-100 text-green-700 border-green-200";
      case "approved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "dispensed":
        return "✓";
      case "approved":
        return "✓";
      case "pending":
        return "⏳";
      case "completed":
        return "✓";
      default:
        return "○";
    }
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
                      Prescription #{presc.prescription_number}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs md:text-sm text-gray-600">
                      <span>{presc.date}</span>
                      <span>•</span>
                      <span>{presc.clinic}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(presc.status)} flex-shrink-0 flex items-center gap-1.5 self-start sm:self-center`}
                >
                  <span>{getStatusIcon(presc.status)}</span>
                  {presc.status}
                </span>
              </div>

              {/* Body */}
              <div className="space-y-4">
                {/* Symptoms */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-900">Symptoms</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presc.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs md:text-sm font-medium border border-red-100"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-900">Medications</p>
                  </div>
                  <div className="space-y-2.5">
                    {presc.medicines.map((med, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4 rounded-lg border border-blue-100"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Pill className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                              {med.name}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs md:text-sm text-gray-700">
                              <div>
                                <span className="font-medium text-gray-600">Dosage:</span>{" "}
                                <span className="font-semibold">{med.dosage}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Frequency:</span>{" "}
                                <span>{med.frequency}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Duration:</span>{" "}
                                <span>{med.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {presc.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
                    <p className="text-xs font-semibold text-amber-900 mb-1">Important Notes</p>
                    <p className="text-xs md:text-sm text-amber-800 leading-relaxed">{presc.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                  <div className="text-xs md:text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Prescribed by:</span>{" "}
                    {presc.prescriber_name}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs md:text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm font-medium flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
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
              {prescriptions.filter((p) => p.status === "dispensed").length}
            </p>
            <p className="text-xs md:text-sm text-green-700 font-medium mt-1">Dispensed</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-blue-600">
              {prescriptions.filter((p) => p.status === "approved").length}
            </p>
            <p className="text-xs md:text-sm text-blue-700 font-medium mt-1">Approved</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">
              {prescriptions.filter((p) => p.status === "pending").length}
            </p>
            <p className="text-xs md:text-sm text-yellow-700 font-medium mt-1">Pending</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-gray-600">
              {prescriptions.filter((p) => p.status === "completed").length}
            </p>
            <p className="text-xs md:text-sm text-gray-700 font-medium mt-1">Completed</p>
          </div>
        </div>
      )}
    </div>
  );
}
