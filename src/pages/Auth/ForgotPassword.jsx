import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, KeyRound, Phone, Lock } from 'lucide-react';
import logo from '../../assets/logo.png';
import gradient from '../../assets/gradient.png';
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  // STEP 1: Request OTP
  const handleRequestOTP = async (data) => {
    try {
      await endpoints.auth.forgotPassword({ phoneNumber: data.phoneNumber });
      setPhoneNumber(data.phoneNumber); // Save for the next step
      setStep(2);
      toast.success('OTP sent to your registered phone number and email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  // STEP 2: Verify OTP and Reset
  const handleResetPassword = async (data) => {
    try {
      await endpoints.auth.resetPassword({
        phoneNumber: phoneNumber, // Taken from state
        otp: data.otp,
        newPassword: data.newPassword
      });
      toast.success('Password reset successfully! You can now login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center p-4 font-sans text-slate-800">
     <img  
     src={gradient} 
     alt="Background" 
     className="absolute inset-0 w-full h-full object-cover -z-10" 
   />
      
      <div className="absolute top-6 flex flex-col items-center z-10">
        <img src={logo} alt="Logo" className="w-120 h-40 object-contain mb-4 drop-shadow-2xl" />
      </div>

      <div className="w-full max-w-md bg-[#1a2b4b] p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 mt-25 md:mt-20">
        <Link to="/login" className="inline-flex items-center gap-2 text-white hover:text-blue-300 text-sm mb-6 transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <h2 className="text-2xl font-bold text-white mb-2">
          {step === 1 ? 'Forgot Password?' : 'Reset Password'}
        </h2>
        <p className="text-sm text-white mb-8 leading-relaxed">
          {step === 1 
            ? 'Enter your registered mobile number. We will send you a 6-digit OTP to verify your identity.' 
            : `Enter the 6-digit OTP sent to your registered email-id and create your new password.`}
        </p>

        {step === 1 ? (
          /* STEP 1 FORM */
          <form onSubmit={handleSubmit(handleRequestOTP)} className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-white mb-1.5 ml-1 tracking-wide">PHONE NUMBER</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 text-white-400" size={18} />
                <input 
                  {...register("phoneNumber", { 
                    required: "Phone number is required",
                    pattern: { value: /^[6-9]\d{9}$/, message: "Must be a valid 10-digit Indian number" }
                  })}
                  className="w-full bg-[#0f1a30] border border-blue-800/50 pl-11 pr-4 py-3.5 rounded-lg text-white text-sm focus:ring-2 focus:ring-white-500 outline-none shadow-inner"
                  placeholder="Enter 10-digit number"
                />
              </div>
              {errors.phoneNumber && <span className="text-xs text-red-400 mt-1.5 ml-1 block">{errors.phoneNumber.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3.5 rounded-lg flex justify-center gap-2 transition-all shadow-lg mt-4">
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : 'Send OTP'}
            </button>
          </form>
        ) : (
          /* STEP 2 FORM */
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-5">
            <input type="text" name="fake-username" style={{ display: 'none' }} autoComplete="username" />
            <input type="password" name="fake-password" style={{ display: 'none' }} autoComplete="current-password" />
            <div>
              <label className="block text-xs font-medium text-white mb-1.5 ml-1 tracking-wide">6-DIGIT OTP</label>

              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 text-white-400" size={18} />
                <input 
                type="text"
                inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  {...register("otp", { 
                    required: "OTP is required",
                    minLength: { value: 6, message: "OTP must be exactly 6 digits" },
                    maxLength: { value: 6, message: "OTP must be exactly 6 digits" }
                  })}
                  readOnly={true}
                  onFocus={(e) => e.target.removeAttribute('readonly')}
                  className="w-full bg-[#0f1a30] border border-blue-800/50 pl-11 pr-4 py-3.5 rounded-lg text-white text-sm tracking-widest focus:ring-2 focus:ring-white-500 outline-none shadow-inner font-mono"
                  placeholder=". . . . . ."
                  
                />
              </div>
              {errors.otp && <span className="text-xs text-red-400 mt-1.5 ml-1 block">{errors.otp.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1.5 ml-1 tracking-wide">NEW PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-white-400" size={18} />
                <input 
                  type="password"
                  {...register("newPassword", { 
                    required: "New password is required",
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      message: "Must include 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Char (Min 8)"
                    }
                  })}
                  className="w-full bg-[#0f1a30] border border-blue-800/50 pl-11 pr-4 py-3.5 rounded-lg text-white text-sm focus:ring-2 focus:ring-white-500 outline-none shadow-inner"
                  placeholder="Create a strong password"
                />
              </div>
              {errors.newPassword && <span className="text-xs text-red-400 mt-1.5 ml-1 block">{errors.newPassword.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3.5 rounded-lg flex justify-center gap-2 transition-all shadow-lg mt-4">
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : 'Verify OTP & Reset'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;