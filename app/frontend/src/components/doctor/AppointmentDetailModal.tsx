import { X, User, Mail, Phone, Calendar, Clock, FileText, Upload, Send } from "lucide-react";
import { useState, useEffect } from "react";
import doctorApi, { AppointmentDetail } from "../../services/doctorApi";
import PrescriptionCard from "./PrescriptionCard";
import FileCard from "./FileCard";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
}

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointmentId
}: AppointmentDetailModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState<AppointmentDetail | null>(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await doctorApi.getAppointmentDetails(appointmentId);
      setAppointmentData(data);
    } catch (err: any) {
      console.error('Error fetching appointment details:', err);
      setError(err.response?.data?.error || 'Failed to load appointment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPrescription = async () => {
    if (!prescriptionText.trim()) {
      setError('Please enter prescription content');
      return;
    }

    if (!appointmentData) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await doctorApi.createPrescription({
        patientId: appointmentData.patient.id,
        appointmentId: appointmentData.id,
        content: prescriptionText
      });

      // Refresh appointment details to show new prescription
      await fetchAppointmentDetails();

      // Clear the form and show success message
      setPrescriptionText("");
      setSuccessMessage('Prescription created successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error creating prescription:', err);
      setError(err.response?.data?.error || 'Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-3xl">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6" />
                  <div>
                    <h2 className="text-xl font-bold">Appointment Details</h2>
                    {appointmentData && (
                      <p className="text-sm text-blue-100 mt-1">
                        {formatDate(appointmentData.scheduledAt)} at {formatTime(appointmentData.scheduledAt)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error && !appointmentData ? (
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                  <button
                    onClick={fetchAppointmentDetails}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : appointmentData ? (
                <div className="p-6 space-y-6">
                  {/* Patient Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-600 rounded-lg">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {appointmentData.patient.name || 'Patient'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {appointmentData.patient.email && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">{appointmentData.patient.email}</span>
                            </div>
                          )}
                          {appointmentData.patient.phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">{appointmentData.patient.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{appointmentData.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              {appointmentData.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                      {successMessage}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && appointmentData && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Prescription History */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Prescription History</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {appointmentData.patient.prescriptions.length}
                      </span>
                    </div>

                    {appointmentData.patient.prescriptions.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600">No previous prescriptions for this patient</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointmentData.patient.prescriptions.map((prescription) => (
                          <PrescriptionCard key={prescription.id} prescription={prescription} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Uploaded Files */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Upload className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">Medical Documents</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {appointmentData.patient.uploadedFiles.length}
                      </span>
                    </div>

                    {appointmentData.patient.uploadedFiles.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Upload className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600">Patient hasn't uploaded any medical documents</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {appointmentData.patient.uploadedFiles.map((file) => (
                          <FileCard key={file.id} file={file} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Create New Prescription */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Send className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-bold text-gray-900">Create New Prescription</h3>
                    </div>

                    <textarea
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      placeholder="Enter prescription details here...&#10;&#10;Example:&#10;- Medication: Amoxicillin 500mg&#10;- Dosage: 3 times daily&#10;- Duration: 7 days&#10;- Instructions: Take after meals"
                      className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                      disabled={isSubmitting}
                    />

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-600">
                        {prescriptionText.length} characters
                      </span>
                      <button
                        onClick={handleSubmitPrescription}
                        disabled={isSubmitting || !prescriptionText.trim()}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit Prescription</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
