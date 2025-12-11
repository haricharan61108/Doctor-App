# Google OAuth Setup Guide

## 🔐 Setting Up Google OAuth Credentials

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create a New Project (or select existing)
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it: `Doctor App` or similar
4. Click "Create"

### Step 3: Enable Google+ API
1. In the sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - **User Type**: External (for testing)
   - **App name**: Doctor App
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **Save and Continue**
   - Scopes: Add `email` and `profile` (click "Add or Remove Scopes")
   - Test users: Add your Gmail for testing
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: Doctor App Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (frontend URL)
     - `http://localhost:3001` (backend URL)
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/callback`
   - Click **Create**

### Step 5: Copy Your Credentials
You'll see a modal with:
- **Client ID**: Copy this
- **Client Secret**: Copy this (not needed for frontend-only flow)

Example Client ID format:
```
441904792720-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

### Step 6: Update Environment Variables

**Backend** (`.env`):
```bash
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE"
JWT_SECRET="your_secure_random_string_here"
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env` or `.env.local`):
```bash
REACT_APP_GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE"
REACT_APP_BACKEND_URL=http://localhost:3001
```

### Step 7: Test Your Setup
1. Start backend: `bun run index.ts`
2. Start frontend: `npm start`
3. Click "Continue with Google" on the login page
4. You should see Google's OAuth consent screen

## 🔒 Security Notes

### For Development:
- Use `http://localhost` URLs
- Test with Gmail accounts added to "Test users"

### For Production:
- Use HTTPS URLs only
- Update authorized origins and redirect URIs
- Verify OAuth consent screen is published
- Use environment-specific credentials
- Never commit `.env` files to version control

## 🐛 Common Issues

### Issue: "redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in your Google Console exactly matches the one your app is using (including protocol and port).

### Issue: "Access blocked: This app's request is invalid"
**Solution**: Make sure you've added your email to "Test users" in the OAuth consent screen.

### Issue: "idpiframe_initialization_failed"
**Solution**: Check that your Client ID is correct and that cookies are enabled.

## 📝 Testing the Flow

1. **Backend health check**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Test Google token verification** (after getting token from frontend):
   ```bash
   curl -X POST http://localhost:3001/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"token": "YOUR_GOOGLE_ID_TOKEN"}'
   ```

## 🎯 What Happens During Auth:

1. User clicks "Continue with Google"
2. Google OAuth popup opens
3. User logs in with Google
4. Google returns an ID token to frontend
5. Frontend sends token to backend `/api/auth/google`
6. Backend verifies token with Google
7. Backend creates/updates patient in database
8. Backend returns JWT token + patient data
9. Frontend stores JWT and redirects to dashboard

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
