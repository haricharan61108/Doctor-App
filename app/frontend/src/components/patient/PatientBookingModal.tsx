import { useState, useEffect } from "react";
import { X, Calendar, Clock, Stethoscope, Star } from "lucide-react";
import { Doctor } from "./patientDemoData";
import patientApi, { DoctorTiming } from "../../services/patientApi";

interface PatientBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onBookAppointment: (data: BookingData) => void;
}

export interface BookingData {
  doctor_id: string;
  date: string;
  time: string;
  reason: string;
  timingId?: string;
  startTimeISO?: string; // Store the original ISO timestamp
}

export default function PatientBookingModal({
  isOpen,
  onClose,
  doctors,
  onBookAppointment,
}: PatientBookingModalProps) {
  const [bookingData, setBookingData] = useState<BookingData>({
    doctor_id: "",
    date: "",
    time: "",
    reason: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableTimings, setAvailableTimings] = useState<DoctorTiming[]>([]);
  const [loadingTimings, setLoadingTimings] = useState(false);

  // Fetch available timings when doctor or date changes
  useEffect(() => {
    const fetchTimings = async () => {
      if (bookingData.doctor_id && bookingData.date) {
        try {
          setLoadingTimings(true);
          const timings = await patientApi.getDoctorTimings(
            bookingData.doctor_id,
            bookingData.date
          );
          // Sort timings by startTime to ensure correct order
          const sortedTimings = timings.sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          setAvailableTimings(sortedTimings);
        } catch (error) {
          console.error('Error fetching timings:', error);
          setAvailableTimings([]);
        } finally {
          setLoadingTimings(false);
        }
      } else {
        setAvailableTimings([]);
      }
    };

    fetchTimings();
  }, [bookingData.doctor_id, bookingData.date]);

  // Convert timing to readable time format
  const formatTimeSlot = (timing: DoctorTiming): string => {
    const startTime = new Date(timing.startTime);
    return startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!bookingData.doctor_id) newErrors.doctor_id = "Please select a doctor";
    if (!bookingData.date) newErrors.date = "Please select a date";
    if (!bookingData.time) newErrors.time = "Please select a time";
    if (!bookingData.reason.trim()) newErrors.reason = "Please provide a reason for visit";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onBookAppointment(bookingData);
    handleClose();
  };

  const handleClose = () => {
    setBookingData({
      doctor_id: "",
      date: "",
      time: "",
      reason: "",
    });
    setErrors({});
    setAvailableTimings([]);
    onClose();
  };

  const selectedDoctor = doctors.find((d) => d.id === bookingData.doctor_id);

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Book Appointment</h2>
              <p className="text-sm text-gray-600">Schedule a consultation with a doctor</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <Stethoscope className="h-4 w-4 inline mr-1" />
              Select Doctor
            </label>
            <select
              value={bookingData.doctor_id}
              onChange={(e) => {
                setBookingData({ ...bookingData, doctor_id: e.target.value });
                setErrors({ ...errors, doctor_id: "" });
              }}
              className={`w-full px-4 py-3 border ${
                errors.doctor_id ? "border-red-300 bg-red-50" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
            >
              <option value="">Choose a doctor...</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} - {doc.specialization}
                </option>
              ))}
            </select>
            {errors.doctor_id && <p className="mt-1 text-sm text-red-600">{errors.doctor_id}</p>}

            {/* Doctor Info Card */}
            {selectedDoctor && (
              <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedDoctor.name}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                  </div>
                  {selectedDoctor.rating && (
                    <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-900">{selectedDoctor.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                min={today}
                value={bookingData.date}
                onChange={(e) => {
                  setBookingData({ ...bookingData, date: e.target.value });
                  setErrors({ ...errors, date: "" });
                }}
                className={`w-full px-4 py-3 border ${
                  errors.date ? "border-red-300 bg-red-50" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Time
              </label>
              <select
                value={bookingData.time}
                onChange={(e) => {
                  const selectedOption = e.target.selectedOptions[0];
                  const timingId = selectedOption.getAttribute('data-timing-id') || undefined;
                  const startTimeISO = selectedOption.getAttribute('data-start-time') || undefined;
                  setBookingData({
                    ...bookingData,
                    time: e.target.value,
                    timingId: timingId,
                    startTimeISO: startTimeISO
                  });
                  setErrors({ ...errors, time: "" });
                }}
                className={`w-full px-4 py-3 border ${
                  errors.time ? "border-red-300 bg-red-50" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
                disabled={loadingTimings || !bookingData.doctor_id || !bookingData.date}
              >
                <option value="">
                  {loadingTimings
                    ? "Loading available slots..."
                    : !bookingData.doctor_id
                    ? "Select a doctor first"
                    : !bookingData.date
                    ? "Select a date first"
                    : "Select time..."}
                </option>
                {availableTimings.length > 0 ? (
                  availableTimings.map((timing) => (
                    <option
                      key={timing.id}
                      value={formatTimeSlot(timing)}
                      data-timing-id={timing.id}
                      data-start-time={timing.startTime}
                    >
                      {formatTimeSlot(timing)}
                    </option>
                  ))
                ) : (
                  bookingData.doctor_id && bookingData.date && !loadingTimings && (
                    <option value="" disabled>No available slots for this date</option>
                  )
                )}
              </select>
              {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe your symptoms or reason for consultation..."
              value={bookingData.reason}
              onChange={(e) => {
                setBookingData({ ...bookingData, reason: e.target.value });
                setErrors({ ...errors, reason: "" });
              }}
              rows={4}
              className={`w-full px-4 py-3 border ${
                errors.reason ? "border-red-300 bg-red-50" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition`}
            />
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Be specific to help your doctor prepare for the consultation
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
