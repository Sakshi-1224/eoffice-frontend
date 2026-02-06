import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, Loader2 } from 'lucide-react';

const CreateUser = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [depts, setDepts] = useState([]);
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    endpoints.users.getDepartments().then(res => setDepts(res.data.data));
    endpoints.users.getDesignations().then(res => setDesignations(res.data.data));
  }, []);

  const onSubmit = async (data) => {
    try {
      await endpoints.users.create(data);
      toast.success('Official registered successfully');
      reset();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl mx-auto mt-11 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex items-center gap-6 border-b border-slate-100 pb-6 mb-8">
        <div className="p-3 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Register New Official</h2>
          <p className="text-sm text-slate-500">Create account credentials and assign roles.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          <input 
            {...register("fullName", { required: true })} 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
            placeholder="Official Name" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
          <input 
            {...register("phoneNumber", { required: true, pattern: /^[6-9]\d{9}$/ })} 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
            placeholder="10-digit Mobile" 
          />
          {errors.phoneNumber && <span className="text-xs text-red-500 mt-1 block">Invalid format</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <input 
            {...register("password", { required: true })} 
            type="password" 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
            placeholder="Initial Password" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email (Optional)</label>
          <input 
            {...register("email")} 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all" 
            placeholder="official@mmd.org" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">System Role</label>
          <select 
            {...register("systemRole", { required: true })} 
            className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          >
            <option value="STAFF">Staff</option>
            <option value="BOARD_MEMBER">Board Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Designation</label>
          <select 
            {...register("designationId", { required: true })} 
            className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          >
           
            {designations.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
          <select 
            {...register("departmentId", { required: true })} 
            className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          >
          
            {depts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2 pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-bold shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;