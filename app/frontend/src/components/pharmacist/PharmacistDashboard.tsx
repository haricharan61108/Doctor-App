import { Pill, PackageCheck, FileText, Users } from "lucide-react";

interface PharmacistDashboardProps {
  userName: string;
}

export default function PharmacistDashboard({ userName }: PharmacistDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pharmacist Portal</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Welcome, {userName}</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pill className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Pharmacist Dashboard Coming Soon
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're developing a comprehensive pharmacy management system. The pharmacist dashboard
              will include prescription verification, medication dispensing, inventory management,
              and patient consultations.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Prescription Review</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <PackageCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Medication Dispensing</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <Pill className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Inventory Management</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Patient Consultations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
