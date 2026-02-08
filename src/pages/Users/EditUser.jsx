import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserCog, Loader2, Save } from 'lucide-react';

const EditUser = () => {
  const { id } = useParams(); // User ID from URL
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm();
  const [loading, setLoading] = useState(true);
  const [depts, setDepts] = useState([]);
  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, desigRes, usersRes] = await Promise.all([
          endpoints.users.getDepartments(),
          endpoints.users.getDesignations(),
          endpoints.users.getAll() // Assuming we fetch list to find user, or add specific GET /users/:id endpoint if available
        ]);
        
        setDepts(deptRes.data.data);
        setDesignations(desigRes.data.data);

        // Find specific user from list (Optimization: Backend should have GET /users/:id)
        const currentUser = usersRes.data.data.find(u => u.id === parseInt(id));
        if (currentUser) {
          setValue('fullName', currentUser.full_name);
          setValue('phoneNumber', currentUser.phone_number);
          setValue('email', currentUser.email);
          setValue('systemRole', currentUser.system_role);
          setValue('designationId', currentUser.designation?.id);
          setValue('departmentId', currentUser.department?.id);
          setValue('isActive', currentUser.isActive);
        }
      } catch (error) {
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      // Remove phone number from payload as it cannot be updated
      const { phoneNumber, ...payload } = data;
      
      await endpoints.users.update(id, payload);
      toast.success('User updated successfully');
      navigate('/users'); // Redirect to user list
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="p-10 text-center text-teal-600">Loading user data...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in-up">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
        <div className="p-3 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
          <UserCog size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Edit Official Profile</h2>
          <p className="text-sm text-slate-500">Update system access and details.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          <input {...register("fullName")} className="w-full border p-3 rounded-lg" />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2">Phone (Read Only)</label>
          <input {...register("phoneNumber")} disabled className="w-full border p-3 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
          <input {...register("email")} className="w-full border p-3 rounded-lg" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">System Role</label>
          <select {...register("systemRole")} className="w-full border p-3 rounded-lg bg-white">
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

        <div className="flex items-center gap-2">
           <input type="checkbox" {...register("isActive")} className="w-5 h-5 text-teal-600" />
           <label className="text-sm font-semibold text-slate-700">Account Active</label>
        </div>
        
        <div className="md:col-span-2 pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-bold flex justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;