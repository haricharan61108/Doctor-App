import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Log for debugging
console.log('Environment check:', {
  hasClientId: !!GOOGLE_CLIENT_ID,
  clientIdLength: GOOGLE_CLIENT_ID.length,
  allEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
});

if (!GOOGLE_CLIENT_ID) {
  console.error('⚠️ REACT_APP_GOOGLE_CLIENT_ID is not set!');
  console.error('Please add it to your .env file and restart the development server.');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Only render GoogleOAuthProvider if we have a client ID
if (GOOGLE_CLIENT_ID) {
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
} else {
  // Render without GoogleOAuthProvider as fallback
  root.render(
    <React.StrictMode>
      <div style={{
        padding: '20px',
        margin: '50px auto',
        maxWidth: '600px',
        backgroundColor: '#fee',
        border: '2px solid #c00',
        borderRadius: '8px'
      }}>
        <h2>⚠️ Configuration Error</h2>
        <p>Google OAuth Client ID is missing!</p>
        <p>Please follow these steps:</p>
        <ol>
          <li>Make sure <code>.env</code> file exists in the frontend folder</li>
          <li>Add: <code>REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here</code></li>
          <li>Restart the development server with <code>npm start</code></li>
        </ol>
        <p><small>Current .env file location: <code>app/frontend/.env</code></small></p>
      </div>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
