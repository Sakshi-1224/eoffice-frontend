import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Eye, Filter } from 'lucide-react';

const Search = () => {
  const { register, handleSubmit } = useForm();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const onSearch = async (data) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const query = new URLSearchParams(data).toString();
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Search Files</h2>
          <p className="text-slate-500 text-sm">Find files by number, subject, or status</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit(onSearch)} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Keywords</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                {...register('text')} 
                placeholder="Search Subject or File Number..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Type</label>
             <select {...register('type')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
               <option value="">All Types</option>
               <option value="GENERIC">Generic</option>
               <option value="FINANCIAL">Financial</option>
               <option value="POLICY">Policy</option>
             </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md shadow-teal-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Filter size={18} /> Search Files</>}
          </button>
        </form>
      </div>

      {/* Results Table */}
      {hasSearched && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {results.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No files found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  {/* --- SEA GREEN HEADER --- */}
                  <tr className="text-xs font-bold uppercase tracking-wider text-white">
                    <th className="p-4 bg-teal-600 border-r border-teal-500/30 rounded-tl-lg">File #</th>
                    <th className="p-4 bg-teal-600 border-r border-teal-500/30">Subject</th>
                    <th className="p-4 bg-teal-600 border-r border-teal-500/30">Type</th>
                    <th className="p-4 bg-teal-600 border-r border-teal-500/30">Priority</th>
                    <th className="p-4 bg-teal-600 border-r border-teal-500/30">Status</th>
                    <th className="p-4 bg-teal-600 text-center rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-sm text-teal-700 font-medium">{file.fileNumber}</td>
                      <td className="p-4 font-medium text-slate-800">{file.subject}</td>
                      <td className="p-4 text-sm text-slate-600">{file.type}</td>
                      <td className="p-4 text-sm text-slate-600">{file.priority}</td>
                      <td className="p-4 text-sm font-medium">{file.status}</td>
                      <td className="p-4 text-center">
                         <button 
                           onClick={() => navigate(`/files/${file.id}`)}
                           className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                         >
                           <Eye size={20} />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;