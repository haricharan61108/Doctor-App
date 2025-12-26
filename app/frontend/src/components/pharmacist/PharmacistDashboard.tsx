import { useState, useEffect } from "react";
import {
  Pill,
  PackageCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Search,
  Loader2,
  History
} from "lucide-react";
import pharmacistApi, { Prescription } from "../../services/pharmacistApi";
import Dialog from "../common/Dialog";

interface PharmacistDashboardProps {
  userName: string;
}

export default function PharmacistDashboard({ userName }: PharmacistDashboardProps) {
  const [activeTab, setActiveTab] = useState<"ready" | "history">("ready");
  const [readyPrescriptions, setReadyPrescriptions] = useState<Prescription[]>([]);
  const [historyPrescriptions, setHistoryPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const [ready, history] = await Promise.all([
        pharmacistApi.getReadyPrescriptions(),
        pharmacistApi.getPurchasedPrescriptions()
      ]);
      setReadyPrescriptions(ready);
      setHistoryPrescriptions(history);
    } catch (error: any) {
      console.error("Error fetching prescriptions:", error);
      setDialog({
        isOpen: true,
        title: 'Error Loading Data',
        message: error.message || 'Failed to load prescriptions',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPurchased = (prescription: Prescription) => {
    setDialog({
      isOpen: true,
      title: 'Confirm Pickup',
      message: `Confirm that ${prescription.patient.name} has picked up this prescription?`,
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        try {
          await pharmacistApi.markAsPurchased(prescription.id);
          setDialog({
            isOpen: true,
            title: 'Success',
            message: 'Prescription marked as purchased successfully!',
            type: 'success'
          });
          // Refresh the lists
          await fetchPrescriptions();
        } catch (error: any) {
          setDialog({
            isOpen: true,
            title: 'Error',
            message: error.message || 'Failed to mark prescription as purchased',
            type: 'error'
          });
        }
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 0) return { text: 'Expired', color: 'text-red-600' };
    if (hours < 24) return { text: `${hours}h remaining`, color: 'text-orange-600' };

    const days = Math.floor(hours / 24);
    return { text: `${days}d ${hours % 24}h remaining`, color: 'text-green-600' };
  };

  const filteredReadyPrescriptions = readyPrescriptions.filter(p =>
    p.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistoryPrescriptions = historyPrescriptions.filter(p =>
    p.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PrescriptionCard = ({ prescription, showPickupButton }: { prescription: Prescription; showPickupButton: boolean }) => {
    const timeRemaining = getTimeRemaining(prescription.expiresAt);

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{prescription.patient.name}</h3>
              <p className="text-sm text-gray-500">{prescription.patient.email}</p>
              {prescription.patient.phone && (
                <p className="text-sm text-gray-500">📞 {prescription.patient.phone}</p>
              )}
            </div>
          </div>
          {showPickupButton ? (
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-medium ${timeRemaining.color}`}>
                <Clock className="inline h-3 w-3 mr-1" />
                {timeRemaining.text}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Dispensed</span>
            </div>
          )}
        </div>

        {/* Prescription Content */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">Prescription Details:</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{prescription.content}</p>
        </div>

        {/* Doctor Info */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <User className="h-4 w-4 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Dr. {prescription.doctor.name}</p>
            {prescription.doctor.specialization && (
              <p className="text-xs text-gray-600">{prescription.doctor.specialization}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <div>
              <p className="font-medium">Issued</p>
              <p>{formatDate(prescription.issuedAt)}</p>
              <p className="text-gray-500">{formatTime(prescription.issuedAt)}</p>
            </div>
          </div>
          {prescription.dispensedAt ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <div>
                <p className="font-medium">Dispensed</p>
                <p>{formatDate(prescription.dispensedAt)}</p>
                <p className="text-gray-500">{formatTime(prescription.dispensedAt)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
              <div>
                <p className="font-medium">Expires</p>
                <p>{formatDate(prescription.expiresAt)}</p>
                <p className="text-gray-500">{formatTime(prescription.expiresAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {showPickupButton && (
          <button
            onClick={() => handleMarkAsPurchased(prescription)}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
          >
            <PackageCheck className="h-4 w-4" />
            Mark as Picked Up
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pharmacist Portal</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Welcome, {userName}</p>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <Pill className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">{userName}</span>
              <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
                Pharmacist
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Ready for Pickup</p>
                <p className="text-3xl font-bold text-blue-900">{readyPrescriptions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Dispensed Today</p>
                <p className="text-3xl font-bold text-green-900">
                  {historyPrescriptions.filter(p => {
                    const today = new Date().toDateString();
                    return p.dispensedAt && new Date(p.dispensedAt).toDateString() === today;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <History className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Total Dispensed</p>
                <p className="text-3xl font-bold text-purple-900">{historyPrescriptions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, email, or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("ready")}
                className={`flex-1 px-6 py-4 font-medium text-sm md:text-base flex items-center justify-center gap-2 transition ${
                  activeTab === "ready"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Clock className="h-5 w-5" />
                Ready for Pickup
                {readyPrescriptions.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "ready" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}>
                    {readyPrescriptions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 px-6 py-4 font-medium text-sm md:text-base flex items-center justify-center gap-2 transition ${
                  activeTab === "history"
                    ? "bg-green-50 text-green-600 border-b-2 border-green-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <History className="h-5 w-5" />
                Dispensed History
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">Loading prescriptions...</p>
              </div>
            ) : (
              <>
                {activeTab === "ready" && (
                  <>
                    {filteredReadyPrescriptions.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Prescriptions Ready</h3>
                        <p className="text-gray-600">
                          {searchQuery ? "No prescriptions match your search" : "All prescriptions have been dispensed"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredReadyPrescriptions.map((prescription) => (
                          <PrescriptionCard
                            key={prescription.id}
                            prescription={prescription}
                            showPickupButton={true}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "history" && (
                  <>
                    {filteredHistoryPrescriptions.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <History className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
                        <p className="text-gray-600">
                          {searchQuery ? "No dispensed prescriptions match your search" : "Dispensed prescriptions will appear here"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredHistoryPrescriptions.map((prescription) => (
                          <PrescriptionCard
                            key={prescription.id}
                            prescription={prescription}
                            showPickupButton={false}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
