import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { api } from '../../api';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => Promise<void> | void;
  initialCode?: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onVerified,
  initialCode,
}) => {
  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [devCode, setDevCode] = useState(initialCode || '');

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setDevCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.verifyOtp(email, code.trim());
      await onVerified();
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const res = await api.sendVerificationOtp(email);
      setResendCooldown(30);
      if (res.code) {
        setDevCode(res.code);
        setCode(res.code);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Mail className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 font-heading">
            Verify Your Email
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We have sent a 6-digit verification code to:
            <br />
            <span className="font-semibold text-slate-800">{email}</span>
          </p>
        </div>

        {devCode && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verification Code: <strong className="font-mono text-sm tracking-widest">{devCode}</strong></span>
            </span>
            <button
              type="button"
              onClick={() => setCode(devCode)}
              className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-md font-bold hover:bg-emerald-700 transition cursor-pointer"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              autoFocus
              className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold outline-none text-slate-900 bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Email & Complete Registration</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Didn't receive the email?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            className="text-indigo-600 hover:text-indigo-800 font-semibold disabled:text-slate-400 inline-flex items-center gap-1 cursor-pointer"
          >
            {resending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
