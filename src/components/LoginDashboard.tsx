import React, { useState, useEffect } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Role } from '../types';

interface LoginDashboardProps {
  onLoginSuccess?: () => void;
}

export const LoginDashboard: React.FC<LoginDashboardProps> = ({ onLoginSuccess }) => {
  const { login, loginWithPhoneOtp, loginWithEmailOtp, register, switchAccount } = useAssessment();

  // Active Login Mode: 'otp' | 'password' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState<'otp' | 'password' | 'register' | 'forgot'>('otp');
  
  // Under OTP tab: toggle between 'phone' and 'email'
  const [otpMethod, setOtpMethod] = useState<'phone' | 'email'>('phone');
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  // Phone OTP States
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  
  // Email OTP States
  const [otpEmail, setOtpEmail] = useState('k.jeevanakala@edutech.ac.in');

  // Shared OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSimulationBanner, setOtpSimulationBanner] = useState<{
    type: 'phone' | 'email';
    recipient: string;
    code: string;
  } | null>(null);

  // Email/Password Login
  const [loginEmail, setLoginEmail] = useState('k.jeevanakala@edutech.ac.in');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Student Registration form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regInstitution, setRegInstitution] = useState('National Institute of Engineering');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regCourse, setRegCourse] = useState('B.Tech CS&E');
  const [regYear, setRegYear] = useState('Year 3 (Trimester 2)');
  const [regPassword, setRegPassword] = useState('');

  // Password recovery
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Request OTP (Phone or Email)
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (otpMethod === 'phone') {
      if (!phoneNumber || phoneNumber.trim().length < 7) {
        setErrorMsg('Please enter a valid mobile number.');
        return;
      }
    } else {
      if (!otpEmail || !otpEmail.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
    }

    setIsLoading(true);

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setResendTimer(30);
      setOtpSimulationBanner({
        type: otpMethod,
        recipient: otpMethod === 'phone' ? `${countryCode} ${phoneNumber}` : otpEmail,
        code,
      });
    }, 600);
  };

  // Auto-fill OTP convenience button
  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setOtpDigits(generatedOtp.split(''));
    }
  };

  // Segmented digit change
  const handleDigitChange = (index: number, val: string) => {
    const digit = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Verify OTP and Enter Dashboard
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    if (generatedOtp && enteredOtp !== generatedOtp) {
      setErrorMsg('Invalid verification code. Please check simulation alert or request a new code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    let res;
    if (otpMethod === 'phone') {
      res = await loginWithPhoneOtp(`${countryCode} ${phoneNumber}`, enteredOtp, selectedRole);
    } else {
      res = await loginWithEmailOtp(otpEmail, enteredOtp, selectedRole);
    }

    setIsLoading(false);

    if (res.success) {
      onLoginSuccess?.();
    } else {
      setErrorMsg(res.error || 'Verification failed. Please retry.');
    }
  };

  // Email & Password Sign In
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await login(loginEmail, loginPassword, selectedRole);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    } else {
      onLoginSuccess?.();
    }
  };

  // Register Student Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regStudentId) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    const res = await register({
      name: regName,
      email: regEmail,
      studentId: regStudentId,
      institution: regInstitution,
      department: regDepartment,
      course: regCourse,
      academicYear: regYear,
      password: regPassword || 'password123',
    });
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed.');
    } else {
      onLoginSuccess?.();
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySent(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-3 sm:px-6 lg:px-8 bg-[#faf8ff] selection:bg-[#3525cd] selection:text-white">
      {/* Top Banner & Institutional App Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl text-center pt-2 sm:pt-4">
        {/* Prominent App Logo */}
        <div className="flex flex-col items-center justify-center mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3525cd] to-[#4f46e5] text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-4 ring-[#e2dfff] mb-3">
            <span className="material-symbols-outlined text-3xl">terminal</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#3525cd] tracking-tight font-headline">
              Logic Legends
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#e2dfff] text-[#0f0069] uppercase tracking-wider">
              TRI2663
            </span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-[#131b2e] mt-1">
            Smart Student Assessment Platform
          </p>
          <p className="text-[11px] text-[#464555] flex items-center gap-1.5 mt-0.5">
            <span>Problem Statement #05</span>
            <span className="w-1 h-1 rounded-full bg-[#c7c4d8]"></span>
            <span className="text-[#0058be] font-medium">EduTech Enterprise</span>
            <span className="w-1 h-1 rounded-full bg-[#c7c4d8]"></span>
            <span>Judge0 Sandbox Isolated</span>
          </p>
        </div>

        {/* Security & Sandbox Indicator Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#c7c4d8] text-xs text-[#464555] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-[#131b2e]">Authentication Gateway:</span>
          <span>Mail & Phone OTP Ready</span>
          <span className="text-[#777587]">•</span>
          <span className="text-emerald-700 font-bold">256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl my-6">
        <div className="bg-white rounded-2xl border border-[#c7c4d8] p-5 sm:p-8 shadow-sm">
          {/* Main Navigation Tabs */}
          <div className="flex items-center justify-center border-b border-[#c7c4d8] pb-3 mb-5 gap-2 sm:gap-6 text-xs sm:text-sm overflow-x-auto">
            {/* Primary Tab: OTP Verification */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('otp');
                setErrorMsg(null);
              }}
              className={`pb-2 font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'otp'
                  ? 'border-b-2 border-[#3525cd] text-[#3525cd]'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-base">pin</span>
              <span>OTP Verification</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                Instant 2FA
              </span>
            </button>

            {/* Tab 2: Password Sign In */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('password');
                setErrorMsg(null);
              }}
              className={`pb-2 font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'password'
                  ? 'border-b-2 border-[#3525cd] text-[#3525cd]'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-base">lock</span>
              <span>Password Login</span>
            </button>

            {/* Tab 3: Student Registration */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
              }}
              className={`pb-2 font-bold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'register'
                  ? 'border-b-2 border-[#3525cd] text-[#3525cd]'
                  : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Register</span>
            </button>
          </div>

          {/* Real-time Simulated OTP Alert / Toast */}
          {otpSimulationBanner && activeTab === 'otp' && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-xl">
                  {otpSimulationBanner.type === 'phone' ? 'sms' : 'mark_email_read'}
                </span>
                <div>
                  <div className="font-bold text-xs">
                    {otpSimulationBanner.type === 'phone' ? 'SMS Gateway' : 'Email Dispatcher'}: Verification Code Sent!
                  </div>
                  <div className="text-[11px] font-mono mt-0.5 text-[#464555]">
                    To: <strong>{otpSimulationBanner.recipient}</strong> • Code: <strong className="text-[#3525cd] font-bold text-sm tracking-wider">{otpSimulationBanner.code}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                Auto-fill Code ({otpSimulationBanner.code})
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 1: MAIL / PHONE OTP VERIFICATION SYSTEM (PRIMARY)                 */}
          {/* ===================================================================== */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              {/* Method Switcher: Mobile Phone vs Email Address */}
              <div className="p-1.5 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpMethod('phone');
                    setOtpSent(false);
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    otpMethod === 'phone'
                      ? 'bg-white text-[#3525cd] shadow-xs'
                      : 'text-[#464555] hover:text-[#131b2e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">smartphone</span>
                  <span>Mobile Phone Number OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpMethod('email');
                    setOtpSent(false);
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    otpMethod === 'email'
                      ? 'bg-white text-[#3525cd] shadow-xs'
                      : 'text-[#464555] hover:text-[#131b2e]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  <span>Institutional Email OTP</span>
                </button>
              </div>

              {/* Role Target Switcher */}
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">
                  Select User Role Access:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'teacher', 'admin'] as Role[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => {
                        setSelectedRole(r);
                        if (r === 'student') setOtpEmail('k.jeevanakala@edutech.ac.in');
                        if (r === 'teacher') setOtpEmail('v.sharma@edutech.ac.in');
                        if (r === 'admin') setOtpEmail('admin@logiclegends.ac.in');
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize border transition-all cursor-pointer ${
                        selectedRole === r
                          ? 'bg-[#3525cd] text-white border-[#3525cd]'
                          : 'bg-[#f2f3ff] text-[#464555] border-[#c7c4d8] hover:bg-[#eaedff]'
                      }`}
                    >
                      {r === 'teacher' ? 'Evaluator' : r}
                    </button>
                  ))}
                </div>
              </div>

              {!otpSent ? (
                /* STEP 1: Enter Phone or Email */
                <form onSubmit={handleRequestOtp} className="space-y-4 pt-1">
                  {otpMethod === 'phone' ? (
                    <div>
                      <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                        Mobile Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="py-2 px-2.5 text-xs font-semibold rounded-lg border border-[#c7c4d8] bg-[#f2f3ff] text-[#131b2e] focus:ring-1 focus:ring-[#3525cd] outline-none"
                        >
                          <option value="+91">🇮🇳 +91 (IN)</option>
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+65">🇸🇬 +65 (SG)</option>
                          <option value="+971">🇦🇪 +971 (UAE)</option>
                        </select>
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="9876543210"
                            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none font-mono tracking-wider"
                          />
                          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#777587]">
                            smartphone
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#464555] block mt-1">
                        We will send a 6-digit SMS verification code to verify your phone number.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                        Institutional Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={otpEmail}
                          onChange={(e) => setOtpEmail(e.target.value)}
                          placeholder="name@edutech.ac.in"
                          className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
                        />
                        <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#777587]">
                          mail
                        </span>
                      </div>
                      <span className="text-[11px] text-[#464555] block mt-1">
                        We will send a secure 6-digit one-time password to your inbox.
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">
                      {otpMethod === 'phone' ? 'send_to_mobile' : 'send'}
                    </span>
                    <span>
                      {isLoading
                        ? 'Dispatching OTP Code...'
                        : `Send 6-Digit ${otpMethod === 'phone' ? 'Phone' : 'Email'} OTP`}
                    </span>
                  </button>
                </form>
              ) : (
                /* STEP 2: Enter & Verify 6-digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                  <div className="text-center">
                    <p className="text-xs text-[#464555]">
                      Enter the 6-digit verification code dispatched to{' '}
                      <strong className="text-[#131b2e]">
                        {otpMethod === 'phone' ? `${countryCode} ${phoneNumber}` : otpEmail}
                      </strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-[#3525cd] font-semibold hover:underline mt-0.5 cursor-pointer inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      <span>Change {otpMethod === 'phone' ? 'Phone Number' : 'Email'}</span>
                    </button>
                  </div>

                  {/* 6-box Segmented OTP Inputs */}
                  <div className="flex justify-center gap-2 sm:gap-2.5 my-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-digit-${index}`}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(index, e)}
                        className="w-10 sm:w-12 h-12 text-center text-lg font-bold font-mono rounded-lg border-2 border-[#c7c4d8] bg-white text-[#131b2e] focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] outline-none shadow-xs"
                      />
                    ))}
                  </div>

                  {/* Resend and Countdown */}
                  <div className="flex items-center justify-between text-xs text-[#464555]">
                    <span>Didn't receive code?</span>
                    {resendTimer > 0 ? (
                      <span className="text-[#777587] font-mono">Resend available in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-[#3525cd] font-semibold hover:underline cursor-pointer"
                      >
                        Resend New OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>{isLoading ? 'Verifying OTP...' : 'Verify OTP & Enter Dashboard'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: CONVENTIONAL PASSWORD LOGIN                                    */}
          {/* ===================================================================== */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Access Role Target
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'teacher', 'admin'] as Role[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => {
                        setSelectedRole(r);
                        if (r === 'student') setLoginEmail('k.jeevanakala@edutech.ac.in');
                        if (r === 'teacher') setLoginEmail('v.sharma@edutech.ac.in');
                        if (r === 'admin') setLoginEmail('admin@logiclegends.ac.in');
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize border transition-all cursor-pointer ${
                        selectedRole === r
                          ? 'bg-[#3525cd] text-white border-[#3525cd]'
                          : 'bg-[#f2f3ff] text-[#464555] border-[#c7c4d8] hover:bg-[#eaedff]'
                      }`}
                    >
                      {r === 'teacher' ? 'Evaluator' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@edutech.ac.in"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#777587]">
                    mail
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#131b2e]">Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-[#3525cd] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none font-mono"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#777587]">
                    lock
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#464555] pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-[#3525cd]"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: STUDENT REGISTRATION                                           */}
          {/* ===================================================================== */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 max-w-xl mx-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131b2e] mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sen"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131b2e] mb-1">Student Roll / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LL-2024-8891"
                    value={regStudentId}
                    onChange={(e) => setRegStudentId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131b2e] mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="ananya.sen@edutech.ac.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131b2e] mb-1">Mobile Number (for OTP)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#131b2e] mb-1">Department</label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#131b2e] mb-1">Enrolled Course</label>
                  <input
                    type="text"
                    value={regCourse}
                    onChange={(e) => setRegCourse(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">how_to_reg</span>
                <span>{isLoading ? 'Creating Account...' : 'Complete Student Enrollment & Enter'}</span>
              </button>
            </form>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: PASSWORD RECOVERY                                              */}
          {/* ===================================================================== */}
          {activeTab === 'forgot' && (
            <div className="max-w-md mx-auto text-xs space-y-4">
              {recoverySent ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-center space-y-2">
                  <span className="material-symbols-outlined text-3xl text-emerald-600">mark_email_read</span>
                  <h3 className="text-sm font-bold">Password Reset Link Dispatched</h3>
                  <p className="text-[#464555]">
                    A secure reset token has been issued to <strong>{recoveryEmail}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setRecoverySent(false);
                      setActiveTab('otp');
                    }}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-[#3525cd] text-white font-semibold cursor-pointer"
                  >
                    Return to OTP Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-[#464555] text-xs">
                    Enter your registered email address to receive password reset instructions.
                  </p>
                  <div>
                    <label className="block font-semibold text-[#131b2e] mb-1">Registered Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@edutech.ac.in"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Send Reset Instructions</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* 1-Click Fast Portals for Evaluators / Testers */}
        <div className="mt-4 pt-3 border-t border-[#c7c4d8]/60 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#777587] block mb-2">
            1-Click Quick Demo Access (Instant Verification Bypass):
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                switchAccount('student');
                onLoginSuccess?.();
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] hover:text-[#3525cd] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#3525cd]"></span>
              <span>Student: K Jeevanakala</span>
            </button>
            <button
              onClick={() => {
                switchAccount('teacher');
                onLoginSuccess?.();
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] hover:text-[#0058be] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#0058be]"></span>
              <span>Evaluator: Prof. V. Sharma</span>
            </button>
            <button
              onClick={() => {
                switchAccount('admin');
                onLoginSuccess?.();
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] hover:text-[#571ac0] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#571ac0]"></span>
              <span>Admin: Dr. R. Raman</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-center py-3 text-xs text-[#777587]">
        <p>Logic Legends Assessment Platform • Team TRI2663 • National Institute of Engineering</p>
      </footer>
    </div>
  );
};
