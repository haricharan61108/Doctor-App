# Healthcare Application Components

This directory contains all the organized components for the healthcare application, separated by user roles.

## Directory Structure

```
components/
├── patient/          # Patient-specific components
├── doctor/           # Doctor-specific components
├── pharmacist/       # Pharmacist-specific components
└── login-page.tsx    # Shared login component
```

## Patient Components

The patient folder contains a complete patient portal with the following features:

### Components

- **PatientDashboard.tsx** - Main dashboard component that orchestrates all patient views
- **PatientHealthStats.tsx** - Displays health metrics, blood group, BMI, allergies, etc.
- **PatientAppointments.tsx** - Shows upcoming and past appointments
- **PatientPrescriptions.tsx** - Lists all prescriptions with detailed medication info
- **PatientMedicalRecords.tsx** - Displays lab reports, imaging, and diagnostic tests
- **PatientBookingModal.tsx** - Modal for booking new appointments
- **patientDemoData.ts** - Mock data for demonstration

### Usage Example

```tsx
import { PatientDashboard } from "./components/patient";

function App() {
  return <PatientDashboard userName="John Smith" />;
}
```

### Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional medical-themed UI
- ✅ Health stats overview cards
- ✅ Upcoming vs past appointments separation
- ✅ Detailed prescription views with medications
- ✅ Medical records with attachments
- ✅ Appointment booking modal with validation
- ✅ Status badges and color coding
- ✅ Demo data included

## Doctor Components

Currently contains a placeholder dashboard. Full implementation coming soon.

### Planned Features

- Patient management
- Appointment scheduling
- Prescription writing
- Medical records access
- AI-powered patient summaries

## Pharmacist Components

Currently contains a placeholder dashboard. Full implementation coming soon.

### Planned Features

- Prescription review and verification
- Medication dispensing
- Inventory management
- Patient consultations

## Design System

All components follow a consistent design system:

### Colors

- **Primary (Blue)**: `bg-blue-600`, `text-blue-600`
- **Success (Green)**: `bg-green-600`, `text-green-600`
- **Warning (Yellow)**: `bg-yellow-600`, `text-yellow-600`
- **Danger (Red)**: `bg-red-600`, `text-red-600`
- **Info (Purple)**: `bg-purple-600`, `text-purple-600`

### Components

- **Cards**: White background, rounded-xl, shadow-sm, border
- **Buttons**: Rounded-lg, font-medium, transition effects
- **Status Badges**: Rounded-full, text-xs, font-semibold, border
- **Icons**: From lucide-react library

### Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl)

## Demo Data

The patient components use comprehensive demo data including:

- **Health Stats**: Blood group, BMI, allergies, chronic conditions
- **Appointments**: 8 sample appointments (upcoming and past)
- **Prescriptions**: 5 detailed prescriptions with medications
- **Medical Records**: 4 records (lab reports, imaging, tests)
- **Doctors**: 6 doctors with different specializations

## Integration Guide

### Replace with Real API

To integrate with your backend API:

1. Remove the demo data imports from `PatientDashboard.tsx`
2. Add API calls using fetch or axios:

```tsx
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/patient/health-stats');
    const data = await response.json();
    setHealthStats(data);
  };
  fetchData();
}, []);
```

3. Update the booking modal to call your API endpoint
4. Add error handling and loading states

## Styling

All components use Tailwind CSS for styling. Make sure your `tailwind.config.js` includes:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Icon Library

Components use `lucide-react` for icons. Install if not already available:

```bash
npm install lucide-react
```

## Future Enhancements

- [ ] Dark mode support
- [ ] Print prescription functionality
- [ ] Download medical records
- [ ] Video call integration for telemedicine
- [ ] Push notifications for appointments
- [ ] Multi-language support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
