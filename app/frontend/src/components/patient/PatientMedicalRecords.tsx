import { FileText, Download } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Upload, Trash2, AlertCircle, Loader2 } from "lucide-react";
import patientApi, { PatientFile } from "../../services/patientApi";
import Dialog from "../common/Dialog";

interface PatientMedicalRecordsProps {
  records: any[];
}

export default function PatientMedicalRecords({ records }: PatientMedicalRecordsProps) {
  const [uploadedFiles, setUploadedFiles] = useState<PatientFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

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
      setDialog({
        isOpen: true,
        title: 'Upload Successful',
        message: result.message,
        type: 'success'
      });

      event.target.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }

  const handleDeleteFile = (fileId: string, fileName: string) => {
    setDialog({
      isOpen: true,
      title: 'Delete File',
      message: `Are you sure you want to delete ${fileName}?`,
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          await patientApi.deleteUploadedFile(fileId);
          setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
          setDialog({
            isOpen: true,
            title: 'File Deleted',
            message: 'File deleted successfully',
            type: 'success'
          });
        } catch (err: any) {
          console.error('Error deleting file:', err);
          setError(err.response?.data?.error || 'Failed to delete file');
        }
      }
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        showCancel={dialog.showCancel}
      />

     {/* File Upload Section */}
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
    <div className="flex flex-col sm:flex-row items-start sm:items-center
  justify-between gap-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Upload Medical Records</h3>
        <p className="text-sm text-gray-600">Upload your previous medical records as PDF files (max 10MB)</p>
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
            Uploaded Medical Records ({uploadedFiles.length})
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
                    href={file.downloadUrl || file.fileUrl}
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

    </div>
  );
}
