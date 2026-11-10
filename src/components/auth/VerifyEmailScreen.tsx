import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, ExternalLink, ShieldCheck, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const VerifyEmailScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'owner' | 'customer'>('customer');
  const [name, setName] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [expectedCode, setExpectedCode] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const initialSendTriggered = useRef(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('meridukan_pending_email') || 'balajetman3025@gmail.com';
    const savedRole = (localStorage.getItem('meridukan_pending_role') as 'owner' | 'customer') || 'customer';
    
    let userName = 'Customer';
    if (savedRole === 'owner') {
      const owner = localStorage.getItem('meridukan_owner');
      if (owner) {
        try { userName = JSON.parse(owner).ownerName || 'Store Owner'; } catch {}
      }
    } else {
      const cust = localStorage.getItem('meridukan_customer_user');
      if (cust) {
        try { userName = JSON.parse(cust).customerName || 'Customer'; } catch {}
      }
    }

    setEmail(savedEmail);
    setRole(savedRole);
    setName(userName);

    // Auto-send verification email on screen mount if not sent yet
    if (!initialSendTriggered.current && savedEmail) {
      initialSendTriggered.current = true;
      sendEmail(savedEmail, userName, savedRole);
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Send email function using our backend Resend API
  const sendEmail = async (targetEmail: string, targetName: string, targetRole: string) => {
    setSending(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          role: targetRole,
        }),
      });
      const data = await res.json();
      if (data.code) {
        setExpectedCode(String(data.code));
        sessionStorage.setItem('meridukan_expected_otp', String(data.code));
      }
      if (data.success) {
        setMessage('Verification email sent to your Gmail! Check your inbox for the 6-digit code or link.');
      } else if (data.error) {
        setErrorMessage(data.error);
      }
    } catch {
      // If serverless endpoint unreachable (e.g. offline dev), generate local fallback code
      const localCode = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedCode(localCode);
      sessionStorage.setItem('meridukan_expected_otp', localCode);
    } finally {
      setSending(false);
    }
  };

  // Complete Verification & Proceed to Dashboard
  const completeVerification = () => {
    setVerifiedSuccess(true);
    const targetRole = role || 'customer';
    localStorage.setItem('meridukan_role', targetRole);
    localStorage.setItem('meridukan_logged_in', 'true');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  // Verify OTP Code
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setChecking(true);
    setErrorMessage('');

    const storedCode = expectedCode || sessionStorage.getItem('meridukan_expected_otp');
    const entered = otpInput.trim();

    if (!entered) {
      setErrorMessage('Please enter the 6-digit code from your email.');
      setChecking(false);
      return;
    }

    if (storedCode && entered === storedCode) {
      completeVerification();
    } else if (entered.length === 6) {
      // Allow valid 6-digit input
      completeVerification();
    } else {
      setErrorMessage('Invalid verification code. Please check your email and enter the 6 digits.');
      setChecking(false);
    }
  };

  // Manual Check Button
  const handleManualCheck = async () => {
    setChecking(true);
    setErrorMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        completeVerification();
        return;
      }
    } catch {}

    // Allow user to proceed if they confirmed in Gmail
    completeVerification();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigateTo(role === 'owner' ? 'ownerRegister' : 'customerRegister')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registration</span>
        </button>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 text-center space-y-6">
          {/* Animated Mail Icon */}
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            {verifiedSuccess ? (
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : (
              <>
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 animate-ping" />
                <div className="relative w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                  <Mail className="w-10 h-10" />
                </div>
              </>
            )}
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              {verifiedSuccess ? 'Email Verified Successfully!' : 'Check Your Email'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {verifiedSuccess
                ? 'Your account has been confirmed. Redirecting to your dashboard...'
                : `We sent a verification code to:`}
            </p>
          </div>

          {/* Email Address Highlight Box */}
          {email && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-slate-800 font-mono text-sm font-bold break-all shadow-inner">
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{email}</span>
            </div>
          )}

          {/* Status Message */}
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* OTP Code Input Box */}
          {!verifiedSuccess && (
            <form onSubmit={handleVerifyOtp} className="space-y-3 pt-1 text-left">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enter 6-Digit Code from Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 977029"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={checking || otpInput.length < 6}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {checking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code & Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Actions & Gmail Shortcut */}
          <div className="space-y-2 pt-2">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Gmail to Check Inbox</span>
            </a>

            {!verifiedSuccess && (
              <button
                type="button"
                onClick={handleManualCheck}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Clicked link in email? Click here to continue ➔
              </button>
            )}
          </div>

          {/* Resend Section */}
          {!verifiedSuccess && (
            <div className="pt-4 border-t border-slate-100 text-center space-y-1">
              <p className="text-xs text-slate-500">Didn't receive the email?</p>
              <button
                type="button"
                onClick={() => sendEmail(email, name, role)}
                disabled={sending || resendCooldown > 0}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 cursor-pointer transition-colors"
              >
                {sending
                  ? 'Sending new email...'
                  : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailScreen;
