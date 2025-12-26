import { FileText, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { PatientFile } from "../../services/doctorApi";
import { useState } from "react";

interface FileCardProps {
  file: PatientFile;
}

export default function FileCard({ file }: FileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* File Info Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-red-100 rounded">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {file.fileName}
              </h4>
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                <span>{formatFileSize(file.fileSize)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700 ml-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* PDF Viewer (Expandable) */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <iframe
              src={file.downloadUrl || file.fileUrl}
              width="100%"
              height="500px"
              title={file.fileName}
              className="bg-white"
            />
          </div>
          <a
            href={file.downloadUrl || file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
          >
            Open in new tab →
          </a>
        </div>
      )}
    </div>
  );
}
