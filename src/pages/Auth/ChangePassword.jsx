import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LockKeyhole, Loader2, ShieldCheck } from 'lucide-react';

const ChangePassword = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  // Watch to compare passwords
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      await endpoints.auth.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully. Please login again.');
      
      // Optional: Logout user to force re-login with new credentials
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in-up">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
        <div className="p-3 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
          <p className="text-sm text-slate-500">Secure your account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="password"
              {...register("oldPassword", { required: "Current password is required" })} 
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
              placeholder="Enter current password" 
            />
          </div>
          {errors.oldPassword && <span className="text-xs text-red-500 mt-1 block">{errors.oldPassword.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="password"
              {...register("newPassword", { 
                required: "New password is required",
                minLength: { value: 6, message: "Must be at least 6 characters" }
              })} 
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
              placeholder="Enter new password" 
            />
          </div>
          {errors.newPassword && <span className="text-xs text-red-500 mt-1 block">{errors.newPassword.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="password"
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: (val) => val === newPassword || "Passwords do not match"
              })} 
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
              placeholder="Retype new password" 
            />
          </div>
          {errors.confirmPassword && <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-bold shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;