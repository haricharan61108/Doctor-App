import { useEffect, useState } from 'react';
import { X, FileText, User, Calendar, Clock, AlertCircle } from 'lucide-react';
import patientApi, { Prescription } from '../../services/patientApi';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string | null;
}

export default function PrescriptionModal({ isOpen, onClose, appointmentId }: PrescriptionModalProps) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchPrescription();
    }
  }, [isOpen, appointmentId]);

  const fetchPrescription = async () => {
    if (!appointmentId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await patientApi.getPrescriptionByAppointment(appointmentId);
      setPrescription(data);
    } catch (err: any) {
      console.error('Error fetching prescription:', err);
      setError(err.response?.data?.error || 'Failed to load prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return 'Ready for Pickup';
      case 'PENDING':
        return 'Pending';
      case 'PICKED_UP':
        return 'Picked Up';
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Prescription Details</h2>
              <p className="text-blue-100 text-sm">View your medical prescription</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading prescription...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && prescription && (
            <div className="space-y-6">
              {/* Doctor Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Prescribed by</h3>
                    <p className="text-lg font-bold text-gray-900">{prescription.doctor.name}</p>
                    <p className="text-sm text-gray-600">{prescription.doctor.specialization}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(prescription.status)}`}>
                  {getStatusText(prescription.status)}
                </span>
              </div>

              {/* Prescription Content */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Prescription
                </h3>
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {prescription.content}
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
                    {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {prescription.issuedAt && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Issued On</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {new Date(prescription.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
