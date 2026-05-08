import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { login as loginService, verifyOTP, resendOTP } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/ui/PageTransition';
import { FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required')
});

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (step !== 'otp') return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      login(data);
      toast.success('Welcome back!');
      navigate(data.role === 'admin' ? '/admin' : from);
    },
    onError: (err) => {
      if (err.response?.data?.message === 'EMAIL_NOT_VERIFIED') {
        setPendingEmail(err.config ? JSON.parse(err.config.data).email : '');
        setStep('otp');
        toast('Please verify your email first', { icon: '📧' });
      } else {
        toast.error(err.response?.data?.message || 'Invalid credentials');
      }
    }
  });

  const verifyMutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      login(data);
      toast.success('Email verified! Welcome 🎉');
      navigate(data.role === 'admin' ? '/admin' : from);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid OTP')
  });

  const resendMutation = useMutation({
    mutationFn: resendOTP,
    onSuccess: () => { toast.success('New OTP sent'); setCountdown(60); setOtp(['', '', '', '', '', '']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to resend')
  });

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); inputRefs.current[5]?.focus(); }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter the 6-digit code'); return; }
    verifyMutation.mutate({ email: pendingEmail, otp: code });
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-primary-50 px-4 pt-20">
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md bg-white p-8 md:p-10"
            >
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold mb-1">{t('auth.login_title')}</h1>
                <p className="text-primary-500 text-sm">Iconic</p>
              </div>

              {location.state?.from && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 text-center">
                  Please sign in to continue to checkout
                </div>
              )}

              <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">{t('auth.email')}</label>
                  <div className="relative">
                    <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input {...register('email')} type="email" className="input-field pl-9" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-2">{t('auth.password')}</label>
                  <div className="relative">
                    <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                    <input {...register('password')} type="password" className="input-field pl-9" />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <motion.button
                  type="submit"
                  disabled={loginMutation.isPending}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary w-full mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loginMutation.isPending ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                  ) : t('auth.login_btn')}
                </motion.button>
              </form>

              <p className="text-center text-sm text-primary-500 mt-6">
                {t('auth.no_account')}{' '}
                <Link to="/register" state={location.state} className="text-primary-950 font-medium hover:underline">
                  {t('auth.register_btn')}
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md bg-white p-8 md:p-10"
            >
              <button onClick={() => setStep('form')} className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-950 mb-6 transition-colors">
                <FiArrowLeft size={15} /> Back
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMail size={28} className="text-primary-950" />
                </div>
                <h1 className="font-display text-2xl font-bold mb-2">Verify Your Email</h1>
                <p className="text-primary-500 text-sm">Code sent to <span className="font-medium text-primary-950">{pendingEmail}</span></p>
              </div>

              <div className="flex gap-2 justify-center mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all ${
                      digit ? 'border-primary-950 bg-primary-50' : 'border-primary-200 focus:border-primary-950'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                onClick={handleVerify}
                disabled={verifyMutation.isPending || otp.join('').length < 6}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full disabled:opacity-60 flex items-center justify-center gap-2 mb-4"
              >
                {verifyMutation.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                ) : 'Verify Email'}
              </motion.button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-primary-400">Resend in <span className="font-medium text-primary-950">{countdown}s</span></p>
                ) : (
                  <button onClick={() => resendMutation.mutate({ email: pendingEmail })} disabled={resendMutation.isPending} className="text-sm text-primary-950 font-medium hover:underline disabled:opacity-60">
                    {resendMutation.isPending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
