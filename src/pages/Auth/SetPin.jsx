import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const SetPin = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
const { updateUser } = useAuth(); // 2. Get the helper
  const onSubmit = async (data) => {
    try {
      // Matches Backend Schema: { "password": "string", "newPin": "\\dddd" }
      await endpoints.auth.setPin({ 
        password: data.password,
        newPin: data.pin 
      });
      updateUser({ isPinSet: true });
      toast.success('Security PIN set successfully!');
      navigate('/files/inbox');
    } catch (error) {
      console.error(error);
      // Handles 401 (Invalid Password) or 400 (Same PIN) errors automatically
      toast.error(error.response?.data?.message || 'Failed to set PIN');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
          <KeyRound size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Set Security PIN</h2>
        <p className="text-slate-500 text-sm mt-1">Verify your identity to set your 4-digit PIN.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* 1. Password Verification Field (Added) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="password"
              {...register("password", { required: "Password is required to set PIN" })}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder-slate-400"
              placeholder="Enter your login password"
            />
          </div>
          {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
        </div>

        {/* 2. PIN Field */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 text-center uppercase tracking-wider">New 4-Digit PIN</label>
          <input 
            type="password"
            maxLength={4}
            {...register("pin", { 
              required: "PIN is required",
              pattern: { value: /^\d{4}$/, message: "PIN must be exactly 4 digits" }
            })} 
            className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder-slate-300 text-slate-800" 
            placeholder="••••" 
          />
          {errors.pin && <span className="text-xs text-red-500 mt-2 block text-center font-medium">{errors.pin.message}</span>}
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <p className="text-xs text-amber-800 text-center leading-relaxed">
            <strong>Note:</strong> Please memorize this PIN. You will need it to approve or reject files in the workflow.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-teal-600 text-white py-3.5 rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Save PIN'}
        </button>
      </form>
    </div>
  );
};

export default SetPin;