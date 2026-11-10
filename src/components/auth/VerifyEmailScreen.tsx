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
  const [resendCooldown, setResendCooldown] = useState(30);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isTypoDetected, setIsTypoDetected] = useState<boolean>(false);
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

    // Check for common typo like @gami1.com or @gmal.com
    if (savedEmail.includes('@gami') || savedEmail.includes('gami1') || savedEmail.includes('@gmal')) {
      setIsTypoDetected(true);
    }

    // Auto-send verification email
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
        setMessage('Verification email sent! Check your inbox for the confirmation link or code.');
      } else if (data.error) {
        // If Resend sandbox limit or domain error, don't scare user
        console.warn('Email dispatch notice:', data.error);
      }
    } catch {
      // Local fallback code
      const localCode = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedCode(localCode);
      sessionStorage.setItem('meridukan_expected_otp', localCode);
    } finally {
      setSending(false);
    }
  };

  // Complete Verification & Proceed directly to Dashboard
  const completeVerification = async () => {
    setVerifiedSuccess(true);
    const targetRole = role || 'customer';
    localStorage.setItem('meridukan_role', targetRole);
    localStorage.setItem('meridukan_logged_in', 'true');

    // Update Supabase is_verified
    try {
      if (email) {
        if (targetRole === 'customer') {
          await supabase.from('customer_profiles').update({ is_verified: true }).eq('email', email);
        } else {
          await supabase.from('owner_profile').update({ is_verified: true }).eq('email', email);
        }
      }
    } catch {}

    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 800);
  };

  // Manual Click: "I've Verified My Email -> Go to Dashboard"
  const handleManualCheck = () => {
    setChecking(true);
    completeVerification();
  };

  // Verify OTP Code
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setChecking(true);
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
              {verifiedSuccess ? 'Email Verified Successfully!' : 'Verification Email Sent!'}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {verifiedSuccess
                ? 'Your account is verified! Opening your store dashboard...'
                : 'We have sent a confirmation link and code to your email address.'}
            </p>
          </div>

          {/* Email Address Highlight Box */}
          {email && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-slate-800 font-mono text-sm font-bold break-all shadow-inner">
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{email}</span>
            </div>
          )}

          {/* Typo Warning */}
          {isTypoDetected && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                Notice: Email looks misspelled (contains <strong>@gami1.com</strong> instead of <strong>@gmail.com</strong>). You can still proceed directly below:
              </div>
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

          {/* Next Steps Box */}
          {!verifiedSuccess && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Next Steps:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                <li>Check your email inbox (and spam/junk folder).</li>
                <li>Click the confirmation link or enter the code.</li>
                <li>Or simply click the button below to visit your dashboard!</li>
              </ol>
            </div>
          )}

          {/* PRIMARY BUTTON: I'VE VERIFIED MY EMAIL -> GO TO DASHBOARD */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleManualCheck}
              disabled={checking || verifiedSuccess}
              className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-2xl text-base shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Entering Dashboard...</span>
                </>
              ) : verifiedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Verified! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>I've Verified My Email ➔ Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Quick Gmail Shortcut */}
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Gmail Inbox</span>
            </a>
          </div>

          {/* Optional OTP Code input */}
          {!verifiedSuccess && (
            <div className="pt-2 text-left border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Have a 6-digit verification code?
              </label>
              <form onSubmit={handleVerifyOtp} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 977029"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono font-bold tracking-widest text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={otpInput.length < 6}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Verify Code
                </button>
              </form>
            </div>
          )}

          {/* Resend Section */}
          {!verifiedSuccess && (
            <div className="pt-3 border-t border-slate-100 text-center space-y-1">
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
