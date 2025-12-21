import { FileText, Download, Eye, Paperclip } from "lucide-react";
import { MedicalRecord } from "./patientDemoData";
import React, { useState, useEffect } from "react";
import { Upload, Trash2, AlertCircle, Loader2 } from "lucide-react";
import patientApi, { PatientFile } from "../../services/patientApi";

interface PatientMedicalRecordsProps {
  records: MedicalRecord[];
}

export default function PatientMedicalRecords({ records }: PatientMedicalRecordsProps) {
  const [uploadedFiles, setUploadedFiles] = useState<PatientFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async() => {
    try {
      setLoadingFiles(true);
      const files = await patientApi.getUploadedFiles();
      setUploadedFiles(files);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      setError('Failed to load uploaded files');
    }finally {
      setLoadingFiles(false);
    }
  }

  const handleFileUpload = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return ;
    }

    if(file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return ;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const result = await patientApi.uploadPrescriptionFile(file);

      setUploadedFiles(prev => [result.file, ...prev]);
      alert(result.message);

      event.target.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      return;
    }

    try {
      await patientApi.deleteUploadedFile(fileId);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      alert('File deleted successfully');
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(err.response?.data?.error || 'Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "lab report":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "diagnostic test":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "imaging":
        return "bg-green-100 text-green-700 border-green-200";
      case "prescription":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "lab report":
        return "🧪";
      case "diagnostic test":
        return "📊";
      case "imaging":
        return "🔬";
      case "prescription":
        return "💊";
      default:
        return "📄";
    }
  };

  return (
    <div>
     {/* File Upload Section */}
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
    <div className="flex flex-col sm:flex-row items-start sm:items-center 
  justify-between gap-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Upload
  Prescription</h3>
        <p className="text-sm text-gray-600">Upload PDF files (max
  10MB)</p>
      </div>
      <label className="relative">
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg 
  hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2
   disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as
  HTMLInputElement;
            input?.click();
          }}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload PDF
            </>
          )}
        </button>
      </label>
    </div>
    {/* Error Message */}
    {error && (
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg
  flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
   />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )}
  </div>

      {/* Uploaded Files Section */}
      {loadingFiles ? (
        <div className="text-center py-8 mb-6">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-600 mt-2">Loading files...</p>
        </div>
      ) : uploadedFiles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded Prescriptions ({uploadedFiles.length})
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {file.fileName}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${file.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">View</span>
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.fileName)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Medical Records</h2>
        <p className="text-sm text-gray-600 mt-1">
          {records.length} record{records.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medical Records Yet</h3>
          <p className="text-gray-600">Your medical records and test results will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Main Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">{getTypeIcon(record.type)}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                        {record.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(
                          record.type
                        )} flex-shrink-0`}
                      >
                        {record.type}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-3 text-xs md:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {record.date}
                        </span>
                        <span>•</span>
                        <span>{record.doctor}</span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">{record.summary}</p>

                      {/* Attachments */}
                      {record.attachments && record.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {record.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200 text-xs"
                            >
                              <Paperclip className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-700 font-medium">{attachment}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:w-28">
                  <button className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs md:text-sm font-medium flex items-center justify-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm font-medium flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Records by Type Summary */}
      {records.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {["Lab Report", "Diagnostic Test", "Imaging", "Prescription"].map((type) => {
            const count = records.filter(
              (r) => r.type.toLowerCase() === type.toLowerCase()
            ).length;
            return (
              <div
                key={type}
                className={`rounded-lg p-3 md:p-4 text-center border ${getTypeColor(type)}`}
              >
                <div className="text-2xl mb-1">{getTypeIcon(type)}</div>
                <p className="text-2xl md:text-3xl font-bold mb-1">{count}</p>
                <p className="text-xs font-medium">{type}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
