import { Heart, User, FileText, Calendar, AlertTriangle, Activity } from "lucide-react";
import { HealthStats } from "./patientDemoData";

interface PatientHealthStatsProps {
  healthStats: HealthStats;
}

export default function PatientHealthStats({ healthStats }: PatientHealthStatsProps) {
  return (
    <>
      {/* Health Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <User className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-500 font-medium truncate">Age / Sex</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{healthStats.age} / {healthStats.sex}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-red-100 rounded-lg flex-shrink-0">
              <Heart className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-500 font-medium truncate">Blood Group</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{healthStats.blood_group}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-green-100 rounded-lg flex-shrink-0">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-500 font-medium truncate">Prescriptions</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{healthStats.prescription_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-500 font-medium truncate">Appointments</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">{healthStats.appointment_count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Health Metrics - Optional display if data exists */}
      {(healthStats.weight || healthStats.height || healthStats.bmi) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8">
          {healthStats.weight && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Weight</p>
                  <p className="text-2xl font-bold text-blue-600">{healthStats.weight}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          )}

          {healthStats.height && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">Height</p>
                  <p className="text-2xl font-bold text-purple-600">{healthStats.height}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          )}

          {healthStats.bmi && (
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium mb-1">BMI</p>
                  <p className="text-2xl font-bold text-green-600">{healthStats.bmi}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Allergies & Conditions Alert */}
      {(healthStats.allergies?.length > 0 || healthStats.chronic_conditions?.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 md:mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {healthStats.allergies?.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-semibold text-yellow-900">Allergies</p>
                <p className="text-sm text-yellow-800 break-words">{healthStats.allergies.join(", ")}</p>
              </div>
            )}
            {healthStats.chronic_conditions?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-yellow-900">Chronic Conditions</p>
                <p className="text-sm text-yellow-800 break-words">{healthStats.chronic_conditions.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
