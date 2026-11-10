import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, CheckCircle2, ArrowRight, RefreshCw, ExternalLink, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const VerifyEmailScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'owner' | 'customer'>('customer');
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('meridukan_pending_email') || '';
    const savedRole = (localStorage.getItem('meridukan_pending_role') as 'owner' | 'customer') || 'customer';
    setEmail(savedEmail);
    setRole(savedRole);
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Listen to Supabase Auth state changes when user clicks the verification link in email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (session.user.email_confirmed_at || event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        setVerifiedSuccess(true);
        const targetRole = role || 'customer';
        localStorage.setItem('meridukan_role', targetRole);
        localStorage.setItem('meridukan_logged_in', 'true');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      }
    });

    // Also auto-poll every 5 seconds in case verification happened in another tab
    const pollInterval = setInterval(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email_confirmed_at) {
          setVerifiedSuccess(true);
          const targetRole = role || 'customer';
          localStorage.setItem('meridukan_role', targetRole);
          localStorage.setItem('meridukan_logged_in', 'true');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [role]);

  // Manual Check Button
  const handleCheckVerification = async () => {
    setChecking(true);
    setErrorMessage('');
    setMessage('');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        // Try refreshing session
        const { data: sessionData } = await supabase.auth.refreshSession();
        if (sessionData?.user?.email_confirmed_at) {
          setVerifiedSuccess(true);
          const targetRole = role || 'customer';
          localStorage.setItem('meridukan_role', targetRole);
          localStorage.setItem('meridukan_logged_in', 'true');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 800);
          return;
        }
      }

      if (user && user.email_confirmed_at) {
        setVerifiedSuccess(true);
        const targetRole = role || 'customer';
        localStorage.setItem('meridukan_role', targetRole);
        localStorage.setItem('meridukan_logged_in', 'true');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } else {
        setErrorMessage(
          'Verification pending: We haven\'t received your email confirmation yet. Please click the link sent to your inbox, then click here again.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify status. Please check your connection.');
    } finally {
      setChecking(false);
    }
  };

  // Resend Verification Email
  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setResending(true);
    setErrorMessage('');
    setMessage('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) {
        setErrorMessage('Failed to resend: ' + error.message);
      } else {
        setMessage('Verification email resent successfully! Please check your inbox and spam folder.');
        setResendCooldown(45);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Back Link */}
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
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              {verifiedSuccess ? 'Email Verified Successfully!' : 'Verification Email Sent!'}
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {verifiedSuccess
                ? 'Your account has been confirmed. Redirecting you to your store dashboard...'
                : 'We have sent a secure confirmation link to your email address.'}
            </p>
          </div>

          {/* Email Address Highlight Box */}
          {email && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-center gap-2 text-slate-800 font-mono text-sm font-bold break-all shadow-inner">
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{email}</span>
            </div>
          )}

          {/* Status Notifications */}
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

          {/* Step Instructions */}
          {!verifiedSuccess && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Next Steps:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                <li>Check your email inbox (and spam/junk folder).</li>
                <li>Click the <strong>Confirm your mail</strong> button.</li>
                <li>You will be verified and automatically redirected to your dashboard!</li>
              </ol>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleCheckVerification}
              disabled={checking || verifiedSuccess}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {checking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking Verification...</span>
                </>
              ) : verifiedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified! Opening Dashboard...</span>
                </>
              ) : (
                <>
                  <span>I've Verified My Email ➔ Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Email App Shortcut */}
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

          {/* Resend Section */}
          {!verifiedSuccess && (
            <div className="pt-4 border-t border-slate-100 text-center space-y-1">
              <p className="text-xs text-slate-500">Didn't receive the email?</p>
              <button
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 cursor-pointer transition-colors"
              >
                {resending
                  ? 'Resending email...'
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
