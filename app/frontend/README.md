# Healthcare AI Platform - Student Frontend

A consolidated React + Tailwind CSS frontend for the Healthcare AI Platform student portal.

## Features

### Student Portal
- **Login Page**: Multi-role login with name-based authentication
- **Dashboard**:
  - Health statistics overview (Age, Blood Group, Prescriptions, Appointments)
  - Allergies and chronic conditions alerts
- **Appointments Management**:
  - View all appointments
  - Book new appointments with doctors
  - Track appointment status (scheduled, in-progress, completed)
- **Prescriptions View**:
  - View all prescriptions with details
  - See medications, dosages, and frequencies
  - Track prescription status
- **Medical Records**: Placeholder for future implementation

## Tech Stack

- **React 18**: Frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **Lucide React**: Icon library

## Project Structure

```
app/frontend/
├── src/
│   ├── App.js          # Main application (all components in one file)
│   ├── index.js        # Entry point
│   └── index.css       # Global styles with Tailwind directives
├── public/             # Static assets
├── .env                # Environment variables
└── package.json        # Dependencies
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update `REACT_APP_BACKEND_URL` if needed (default: http://localhost:3001)

3. **Start development server:**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner

## API Endpoints

The frontend expects the following backend API endpoints:

- `POST /api/auth/login` - User authentication
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `GET /api/students/:id/health-stats` - Get student health statistics
- `GET /api/doctors` - List all doctors
- `GET /api/appointments` - Get appointments (with optional query params)
- `POST /api/appointments` - Create new appointment
- `GET /api/prescriptions` - Get prescriptions (with optional query params)

## Component Architecture

All components are consolidated in a single `App.js` file:

1. **LoginPage**: Role selection and authentication
2. **Header**: Top navigation with user info and logout
3. **StudentDashboard**: Main dashboard with tabs
   - Appointments tab
   - Prescriptions tab
   - Medical Records tab (placeholder)
4. **App**: Main component with routing logic

## Styling

- Uses Tailwind CSS for all styling
- Custom color palette based on blue/indigo theme
- Responsive design with mobile-first approach
- Custom animations and transitions

## Future Enhancements

- Add Doctor dashboard
- Add Pharmacist dashboard
- Implement medical records functionality
- Add search and filtering
- Implement real-time notifications
- Add data export features
