import { FileText, Calendar, Clock } from "lucide-react";
import { PrescriptionDetail } from "../../services/doctorApi";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface PrescriptionCardProps {
  prescription: PrescriptionDetail;
}

export default function PrescriptionCard({ prescription }: PrescriptionCardProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'READY_FOR_PICKUP':
        return 'bg-green-100 text-green-700';
      case 'PURCHASED':
        return 'bg-blue-100 text-blue-700';
      case 'EXPIRED':
        return 'bg-red-100 text-red-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-900">
            {prescription.appointment
              ? `Prescription - ${formatDate(prescription.appointment.scheduledAt)}`
              : 'Prescription'}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
          {prescription.status.replace('_', ' ')}
        </span>
      </div>

      {/* Date/Time Info */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Created: {formatDate(prescription.createdAt)}</span>
        </div>
        {prescription.issuedAt && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Issued: {formatTime(prescription.issuedAt)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded p-3 mb-3">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          {prescription.content}
        </p>
      </div>

      {/* PDF Viewer */}
      {prescription.pdfUrl && (
        <div className="mt-3">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <iframe
              src={`${API_URL}${prescription.pdfUrl}`}
              width="100%"
              height="400px"
              title="Prescription PDF"
              className="bg-white"
              onError={(e) => console.error('Failed to load PDF:', e)}
            />
          </div>
          <a
            href={`${API_URL}${prescription.pdfUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
          >
            Open PDF in new tab →
          </a>
        </div>
      )}
    </div>
  );
}
