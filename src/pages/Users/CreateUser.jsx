import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, Loader2, AlertTriangle } from 'lucide-react';

const CreateUser = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [depts, setDepts] = useState([]);
  const [designations, setDesignations] = useState([]);
  
  // 🟢 NEW: State to store allowed roles fetched from backend
  const [allowedRoles, setAllowedRoles] = useState([]); 

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  useEffect(() => {
    // 1. Fetch Departments
    endpoints.users.getDepartments().then(res => setDepts(res.data.data));
    
    // 2. Fetch Designations
    endpoints.users.getDesignations().then(res => setDesignations(res.data.data));

    // 🟢 3. FETCH CONSTANTS (ROLES)
    // The backend decides here if 'ADMIN' should be included or not
    endpoints.common.constants().then(res => {
        // res.data.data.ROLES is an object { ADMIN: 'ADMIN', STAFF: 'STAFF'... }
        // We convert it to an array of values ['ADMIN', 'STAFF']
        const rolesObj = res.data.data.ROLES;
        setAllowedRoles(Object.values(rolesObj));
    }).catch(err => console.error("Failed to load roles", err));

  }, []);

  const onSubmit = async (data) => {
    try {
      await endpoints.users.create(data);
      toast.success('Official registered successfully');
      reset();
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-11 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in-up">
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
        
        {/* ... (Full Name, Phone, Password, Email inputs remain unchanged) ... */}
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          <input 
            {...register("fullName", { required: "Full name is required" })} 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
            placeholder="Official Name" 
          />
          {errors.fullName && <span className="text-xs text-red-500 mt-1">{errors.fullName.message}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
          <input 
            {...register("phoneNumber", { 
              required: "Phone number is required", 
              pattern: { value: /^[6-9]\d{9}$/, message: "Invalid mobile number format" } 
            })} 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
            placeholder="10-digit Mobile" 
          />
          {errors.phoneNumber && <span className="text-xs text-red-500 mt-1 block">{errors.phoneNumber.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <input 
            {...register("password", { 
              required: "Initial password is required",
              pattern: {
                value: strongPasswordRegex,
                message: "Must be 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
              }
            })} 
            type="password" 
            className={`w-full border ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-300'} p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none`} 
            placeholder="Create Strong Password" 
          />
          {errors.password && (
            <div className="flex items-start gap-1 mt-1 text-xs text-red-500">
               <AlertTriangle size={12} className="mt-0.5" />
               <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email (Optional)</label>
          <input 
            {...register("email", { 
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" } 
            })} 
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" 
            placeholder="official@mmd.org" 
          />
           {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
        </div>

        {/* 🟢 UPDATE: Dynamic System Role Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">System Role</label>
          <select 
            {...register("systemRole", { required: true })} 
            className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">Select Role</option>
            {allowedRoles.map((role) => (
                <option key={role} value={role}>
                    {role.replace('_', ' ')} {/* Formats BOARD_MEMBER to BOARD MEMBER */}
                </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Designation</label>
          <select {...register("designationId", { required: true })} className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none">
            {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
          <select {...register("departmentId", { required: true })} className="w-full border border-slate-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none">
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        
        <div className="md:col-span-2 pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-bold shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;