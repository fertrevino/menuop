"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  const { signUp, signIn, signInWithGoogle, resendConfirmation } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, {
          data: { full_name: name },
        });
        if (error) {
          setError(error.message);
        } else {
          // Show email confirmation message instead of closing modal
          setShowEmailConfirmation(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
          router.push("/dashboard");
        }
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
    // Note: For OAuth, we don't reset loading here because the user will be redirected
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setError(null);
    const { error } = await resendConfirmation(email);
    if (error) {
      setError(error.message);
    }
    setResendLoading(false);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setIsSignUp(false);
    setError(null);
    setShowEmailConfirmation(false);
    setResendLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Modal container without backdrop click handler */}
      <div className="flex min-h-full items-center justify-center p-4 relative">
        {/* Backdrop with modern glass effect */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-xl transition-all duration-300 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(31,131,73,0.05) 50%, rgba(0,0,0,0.15) 100%)",
          }}
        ></div>

        {/* Background accents */}
        <div className="fixed top-20 left-20 w-32 h-32 bg-[#1F8349]/10 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
        <div className="fixed bottom-40 right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-1000 pointer-events-none"></div>

        {/* Modal */}
        <div className="relative bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-gray-600/30 transform transition-all duration-300 scale-100 hover:scale-[1.02] z-10">
          {/* Close button wrapper (absolute inside modal to avoid mobile Safari fixed issues) */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
            <button
              onClick={handleClose}
              aria-label="Close sign in modal"
              className="text-gray-400 hover:text-white transition-colors duration-200 rounded-lg p-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8349]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 hover:bg-gray-700/60 focus-visible:bg-gray-700/60 active:bg-gray-700/70"
            >
              <svg
                className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Modal content */}
          <div className="p-8">
            {showEmailConfirmation ? (
              // Email confirmation screen
              <div className="text-center">
                <div className="w-16 h-16 bg-[#1F8349]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-[#1F8349]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Check Your Email
                </h2>
                <p className="text-gray-300 mb-6">
                  We&apos;ve sent a confirmation link to{" "}
                  <span className="text-[#1F8349] font-medium">{email}</span>
                </p>
                <p className="text-gray-400 text-sm mb-8">
                  Please check your email and click the confirmation link to
                  activate your account. You may need to check your spam folder.
                </p>
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm mb-4">
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <button
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Got it
                  </button>
                  <button
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="w-full border border-gray-600 hover:border-[#1F8349] bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                  >
                    {resendLoading ? "Sending..." : "Resend Email"}
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailConfirmation(false);
                      setError(null);
                    }}
                    className="w-full text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Back to sign up
                  </button>
                </div>
              </div>
            ) : (
              // Regular sign in/up form
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-gray-300">
                    {isSignUp
                      ? "Join Menuop to create beautiful digital menus"
                      : "Sign in to manage your digital menus"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                      {error}
                    </div>
                  )}

                  {isSignUp && (
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F8349]/60 focus:border-[#1F8349]/60 transition-all duration-200 hover:bg-gray-700/70"
                        placeholder="Enter your full name"
                        required={isSignUp}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F8349]/60 focus:border-[#1F8349]/60 transition-all duration-200 hover:bg-gray-700/70"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F8349]/60 focus:border-[#1F8349]/60 transition-all duration-200 hover:bg-gray-700/70"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#1F8349]/25 transform hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer"
                  >
                    <span className="relative z-10">
                      {loading
                        ? "Loading..."
                        : isSignUp
                        ? "Create Account"
                        : "Sign In"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  </button>
                </form>

                {/* Toggle between sign in and sign up */}
                <div className="mt-6 text-center">
                  <p className="text-gray-400">
                    {isSignUp
                      ? "Already have an account?"
                      : "Don't have an account?"}{" "}
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[#1F8349] hover:text-[#2ea358] font-medium transition-colors cursor-pointer"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </div>

                {/* Modern divider with gradient */}
                <div className="mt-8 flex items-center">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600/60 to-transparent"></div>
                  <span className="px-4 text-sm text-gray-400 bg-gray-800/50 rounded-full border border-gray-600/30">
                    Or continue with
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600/60 to-transparent"></div>
                </div>

                {/* Social login buttons with modern glass effect */}
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-600/40 bg-gray-700/30 backdrop-blur-sm rounded-lg text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
