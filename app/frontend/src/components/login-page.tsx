"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { GoogleLogin } from '@react-oauth/google'
import { Heart } from 'lucide-react'

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
    idToken?: string
    name?: string
    googleId?: string
    avatarUrl?: string
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

      // Clear errors on successful login
      form.setErrors({})
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
              <Heart className="mx-auto text-white" size={120} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">UHealth</h1>
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-red-600" : "bg-red-500"}`}>
                  <Heart className="h-5 w-5 text-white" fill="white" />
                </div>
                <span className="text-lg font-bold">UHealth</span>
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
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      setIsLoading(true)
                      try {
                        if (credentialResponse.credential) {
                          await onLogin?.({
                            role: 'patient',
                            credentials: {
                              idToken: credentialResponse.credential
                            }
                          })
                        } else {
                          form.setErrors({ server: "No credential received from Google." })
                        }
                      } catch (error) {
                        console.error('Google login error:', error)
                        form.setErrors({ server: "Google sign-in failed. Please try again." })
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    onError={() => {
                      form.setErrors({ server: "Google sign-in failed. Please try again." })
                    }}
                    useOneTap
                    theme={isDarkMode ? "filled_black" : "outline"}
                    size="large"
                    text="continue_with"
                    shape="rectangular"
                    width="384"
                  />
                </div>
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
              
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
