import { useEffect, useState } from 'react';
import { endpoints } from '../../api/axios';
import { Link } from 'react-router-dom';
import { UserCog, Loader2, Users, Search } from 'lucide-react'; // Imported Search icon
import { useQuery } from '@tanstack/react-query';

const ManageUsers = () => {
  // State for the search input and the debounced value
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debouncing logic: Wait 500ms after the user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data: users = [], isLoading } = useQuery({
    // Include debouncedSearchTerm in queryKey to auto-refetch when it changes
    queryKey: ['allUsers', debouncedSearchTerm],
    queryFn: async () => {
      // Pass the search parameter to the API
      const res = await endpoints.users.getAll({ search: debouncedSearchTerm });
      return res.data.data;
    }
  });

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Officials</h2>
            <p className="text-sm text-slate-500">View and edit system users.</p>
          </div>
        </div>

        {/* Added Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Loading State or Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="p-4 pl-8">Full Name</th>
                <th className="p-4">Role & Designation</th>
                <th className="p-4">Department</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-8 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-8 font-medium text-slate-800">
                      {user.full_name}
                      <div className="text-xs text-slate-400 font-normal">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="block font-semibold text-slate-700">{user.designation?.name || 'N/A'}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-1">
                        {user.system_role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{user.department?.name || 'N/A'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 pr-8 text-right">
                      <Link 
                        to={`/users/${user.id}/edit`} 
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <UserCog size={16} /> Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;