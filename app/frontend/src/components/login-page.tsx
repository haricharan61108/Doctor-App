"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

/**
 * LoginPage Component - Production-ready Healthcare Login
 *
 * INTEGRATION GUIDE:
 * 1. Google OAuth: Replace `onGoogleLogin()` placeholder with actual Google Sign-In logic
 *    - Import: import { signInWithPopup } from 'firebase/auth'
 *    - Or use: `window.location.href = `${GOOGLE_OAUTH_URL}?client_id=${CLIENT_ID}...`
 *
 * 2. Backend API: Replace `mockApiCall()` with actual authentication endpoint
 *    - Doctor/Pharmacist: POST /api/auth/login with { email, password, role }
 *    - Return: { token, user, expiresIn }
 *
 * 3. State Management: Integrate with your auth context/provider
 *    - Replace `onLogin()` callback with context.setUser(response)
 *
 * 4. Token Storage: Replace localStorage with secure http-only cookies in production
 */

type Role = "doctor" | "patient" | "pharmacist"

interface LoginCredentials {
  role: Role
  credentials: {
    email?: string
    password?: string
  }
}

interface LoginPageProps {
  onLogin?: (data: LoginCredentials) => Promise<void> | void
  onGoogleLogin?: () => Promise<void> | void
  initialRole?: Role
}

interface FormErrors {
  email?: string
  password?: string
  server?: string
}

/**
 * Custom hook for form validation
 */
function useFormValidation() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState({ email: false, password: false })

  const validateEmail = useCallback((value: string): string | undefined => {
    if (!value.trim()) {
      return "Email is required"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address"
    }
    return undefined
  }, [])

  const validatePassword = useCallback((value: string): string | undefined => {
    if (!value) {
      return "Password is required"
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters"
    }
    return undefined
  }, [])

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    newErrors.email = validateEmail(email)
    newErrors.password = validatePassword(password)
    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }, [email, password, validateEmail, validatePassword])

  const handleBlur = useCallback(
    (field: "email" | "password") => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      if (field === "email") {
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
      } else {
        setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
      }
    },
    [email, password, validateEmail, validatePassword],
  )

  const reset = useCallback(() => {
    setEmail("")
    setPassword("")
    setErrors({})
    setTouched({ email: false, password: false })
  }, [])

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    setErrors,
    touched,
    validate,
    handleBlur,
    reset,
  }
}

/**
 * Mock API call - Replace with actual backend call
 */
async function mockApiCall(credentials: { email: string; password: string; role: Role }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "123",
          email: credentials.email,
          role: credentials.role,
          name: credentials.email.split("@")[0],
        },
      })
    }, 1000)
  })
}

export default function LoginPage({ onLogin, onGoogleLogin, initialRole = "patient" }: LoginPageProps) {
  const [currentRole, setCurrentRole] = useState<Role>(initialRole)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(
    typeof window !== "undefined" ? localStorage.getItem("remember-role") === "true" : false,
  )
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
  )

  const form = useFormValidation()
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const handleRoleChange = (newRole: Role) => {
    if (isLoading) return
    setCurrentRole(newRole)
    form.reset()
    form.setErrors({})
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      try {
        // Get user info from Google
        const userInfo = await axios.get(
          `https://www.googleapis.com/oauth2/v3/userinfo`,
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        )

        // Send to backend for authentication
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'
        const response = await axios.post(`${backendUrl}/api/auth/google`, {
          token: tokenResponse.access_token,
          userInfo: userInfo.data
        })

        // Call the onLogin callback with the response
        await onLogin?.({
          role: 'patient',
          credentials: {
            email: userInfo.data.email
          }
        })
      } catch (error) {
        console.error('Google login error:', error)
        form.setErrors({ server: "Google sign-in failed. Please try again." })
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      form.setErrors({ server: "Google sign-in failed. Please try again." })
    },
  })

  const handleGoogleClick = () => {
    if (isLoading) return
    googleLogin()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.validate() || isLoading) return

    setIsLoading(true)
    form.setErrors({})

    try {
      if (rememberMe) {
        localStorage.setItem("remember-role", "true")
      } else {
        localStorage.removeItem("remember-role")
      }

      // Call mock API (replace with real backend call)
      await mockApiCall({
        email: form.email,
        password: form.password,
        role: currentRole,
      })

      // Call the onLogin callback
      await onLogin?.({
        role: currentRole,
        credentials: {
          email: form.email,
          password: form.password,
        },
      })

      form.reset()
    } catch (error) {
      form.setErrors({
        server: "Authentication failed. Please check your credentials and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const roles: Role[] = ["doctor", "patient", "pharmacist"]
  const roleLabels = {
    doctor: "Doctor",
    patient: "Patient",
    pharmacist: "Pharmacist",
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
      `}</style>
      <div
        className={`min-h-screen font-sans transition-colors duration-300 ${
          isDarkMode ? "bg-slate-950 text-slate-50" : "bg-white text-slate-900"
        }`}
      >
        {/* Dark mode toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-lg transition-colors z-10 ${
          isDarkMode
            ? "bg-slate-800 text-amber-400 hover:bg-slate-700"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>

      <div className="flex min-h-screen">
        {/* Left side - Branding illustration (hidden on mobile) */}
        <div
          className={`hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 ${
            isDarkMode ? "bg-indigo-950" : "bg-gradient-to-br from-indigo-500 to-teal-500"
          }`}
        >
          <div className="max-w-md text-center">
            <div className="mb-8">
              <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto" fill="none">
                <rect width="120" height="120" rx="24" fill="currentColor" opacity="0.1" />
                <path
                  d="M60 40C48.95 40 40 48.95 40 60c0 11.05 8.95 20 20 20s20-8.95 20-20c0-11.05-8.95-20-20-20z"
                  fill="white"
                  opacity="0.8"
                />
                <path
                  d="M80 75c0-3.31 1.79-6.2 4.46-7.76-3.16-1.4-6.7-2.24-10.46-2.24-13.25 0-24 10.75-24 24v4h30v-18z"
                  fill="white"
                  opacity="0.6"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">HealthHub</h1>
            <p className={`text-base sm:text-lg ${isDarkMode ? "text-indigo-200" : "text-indigo-50"}`}>
              Secure access to your healthcare platform
            </p>
          </div>
        </div>

        {/* Right side - Login form */}
        <div
          className={`w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 ${
            isDarkMode ? "bg-slate-900" : "bg-slate-50"
          }`}
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo - Only visible on mobile */}
            <div className="lg:hidden mb-6 text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-indigo-600" : "bg-indigo-500"}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <span className="text-lg font-bold">HealthHub</span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h2>
              <p className={`text-xs sm:text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Sign in to your account to continue
              </p>
            </div>

            {/* Role tabs */}
            <div
              className={`flex gap-1 mb-6 sm:mb-8 p-1 rounded-lg ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
              role="tablist"
              aria-label="User role selection"
            >
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={isLoading}
                  className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ease-in-out transform ${
                    currentRole === role
                      ? "bg-indigo-600 text-white shadow-lg scale-105"
                      : isDarkMode
                        ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                        : "bg-transparent text-slate-600 hover:text-slate-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  role="tab"
                  aria-selected={currentRole === role}
                  aria-controls={`${role}-panel`}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>

            {/* Server error */}
            {form.errors.server && (
              <div
                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm font-medium">{form.errors.server}</p>
              </div>
            )}

            {/* Patient role - Google Sign-in */}
            {currentRole === "patient" && (
              <div
                id="patient-panel"
                role="tabpanel"
                aria-labelledby="patient-tab"
                className="animate-fadeIn"
              >
                <button
                  onClick={handleGoogleClick}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 mb-4 ${
                    isDarkMode
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
                      : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300"
                  } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  aria-label="Sign in with Google"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Doctor & Pharmacist role - Email/Password */}
            {(currentRole === "doctor" || currentRole === "pharmacist") && (
              <div
                id={`${currentRole}-panel`}
                role="tabpanel"
                aria-labelledby={`${currentRole}-tab`}
                className="animate-fadeIn"
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => form.setEmail(e.target.value)}
                      onBlur={() => form.handleBlur("email")}
                      disabled={isLoading}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        form.touched.email && form.errors.email
                          ? isDarkMode
                            ? "border-red-500 bg-red-950 text-red-100"
                            : "border-red-300 bg-red-50"
                          : isDarkMode
                            ? "border-slate-700 bg-slate-800 text-white"
                            : "border-slate-300 bg-white"
                      } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                      aria-describedby={form.errors.email ? "email-error" : undefined}
                    />
                    {form.touched.email && form.errors.email && (
                      <p id="email-error" className="mt-1 text-xs sm:text-sm text-red-500" role="alert">
                        {form.errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-medium">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        ref={passwordInputRef}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => form.setPassword(e.target.value)}
                        onBlur={() => form.handleBlur("password")}
                        disabled={isLoading}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          form.touched.password && form.errors.password
                            ? isDarkMode
                              ? "border-red-500 bg-red-950 text-red-100"
                              : "border-red-300 bg-red-50"
                            : isDarkMode
                              ? "border-slate-700 bg-slate-800 text-white"
                              : "border-slate-300 bg-white"
                        } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                        aria-describedby={form.errors.password ? "password-error" : undefined}
                      />
                    </div>
                    {form.touched.password && form.errors.password && (
                      <p id="password-error" className="mt-1 text-xs sm:text-sm text-red-500" role="alert">
                        {form.errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        aria-label="Remember me on this device"
                      />
                      <span className="text-xs sm:text-sm">Remember me</span>
                    </label>
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault()
                        // TODO: Implement forgot password flow
                      }}
                      className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit button */}
                  <button
                    ref={submitButtonRef}
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isLoading ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg active:scale-95"
                    } ${
                      isDarkMode
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                    aria-label={isLoading ? "Signing in..." : "Sign in"}
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Footer */}
            <div className={`mt-6 sm:mt-8 text-center text-xs sm:text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              <p>
                Don't have an account?{" "}
                <a
                  href="#signup"
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Navigate to signup
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
