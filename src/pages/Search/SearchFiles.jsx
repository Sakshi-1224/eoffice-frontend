import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Eye, Filter, FileX, Calendar } from 'lucide-react';

const SearchFiles = () => {
  const { register, handleSubmit } = useForm();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const onSearch = async (data) => {
    setLoading(true);
    setHasSearched(true);
    try {
      // Remove empty fields to keep URL clean
      const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== ""));
      const query = new URLSearchParams(cleanData).toString();
      
      const response = await endpoints.files.search(query);
      setResults(response.data.data);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up max-w-6xl mx-auto pb-10">
      <div className="text-center md:text-left mt-4">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Search Files</h2>
        <p className="text-slate-500 text-sm mt-1">Locate documents using precise filters</p>
      </div>

      {/* Modern Search Card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
        <form onSubmit={handleSubmit(onSearch)} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Main Keyword Input (Full Row on mobile, Half Row on Desktop) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Keywords</label>
            <div className="relative group">
              <SearchIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input 
                {...register('text')} 
                placeholder="Subject, File Number, or Description..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {/* 🟢 NEW: From Date */}
          <div className="md:col-span-1">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider flex items-center gap-1.5">
               <Calendar size={12} /> From Date
             </label>
             <input 
               type="date" 
               {...register('startDate')} 
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer text-slate-700 font-medium"
             />
          </div>

          {/* 🟢 NEW: To Date */}
          <div className="md:col-span-1">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider flex items-center gap-1.5">
               <Calendar size={12} /> To Date
             </label>
             <input 
               type="date" 
               {...register('endDate')} 
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer text-slate-700 font-medium"
             />
          </div>
          
        

          {/* Priority Filter */}
          <div className="md:col-span-1">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Priority</label>
             <select {...register('priority')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer text-slate-700 font-medium">
               <option value="">Any Priority</option>
               <option value="HIGH">High (Urgent)</option>
               <option value="MEDIUM">Medium</option>
               <option value="LOW">Low</option>
             </select>
          </div>

          {/* Search Button (Spans 2 columns to balance grid) */}
          <div className="md:col-span-2 flex items-end mt-2">
            <button 
                type="submit" 
                disabled={loading}
                className="w-60 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Filter size={18} /> Search Records</>}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {results.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileX size={40} className="opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-600">No matching files found</h3>
              <p className="text-sm">Try adjusting your filters or keywords.</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Search Results</h3>
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">{results.length} Found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 border-b border-slate-200">
                      <th className="p-4 pl-6">File Number</th>
                      <th className="p-4">Subject</th>
                     
                      <th className="p-4">Priority</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-4 pl-6 font-mono text-sm text-teal-700 font-medium">{file.fileNumber}</td>
                        <td className="p-4 font-medium text-slate-800 max-w-xs truncate" title={file.subject}>{file.subject}</td>
                      
                        <td className="p-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                                file.priority === 'HIGH' ? 'bg-red-50 text-red-700' : 
                                file.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                            }`}>
                                {file.priority}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <span className="text-xs font-bold text-slate-500">{file.status?.replace('_', ' ')}</span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                           <button 
                             onClick={() => navigate(`/files/${file.id}`)}
                             className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-all text-xs font-bold"
                           >
                             <Eye size={16} /> View
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFiles;