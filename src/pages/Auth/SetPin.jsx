import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock } from 'lucide-react';

const SetPin = () => {
  const { register, handleSubmit, reset } = useForm();
  
  const onSubmit = async (data) => {
    try {
      await endpoints.auth.setPin(data);
      toast.success('Security PIN updated successfully');
      reset();
    } catch (e) { 
      // Error handled by interceptor 
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="text-green-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Configure Security PIN</h2>
        <p className="text-slate-500 mb-8 text-sm">
          Set a 4-digit PIN for approving sensitive documents. Keep this secure.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input 
              {...register("pin", { required: true, pattern: /^\d{4}$/ })} 
              type="password" 
              placeholder="• • • •"
              className="w-full border border-slate-300 p-3 pl-10 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-green-500 outline-none transition-all"
              maxLength={4}
            />
          </div>
          <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-medium shadow-md shadow-green-100">
            Save Security PIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPin;