import { useEffect, useState } from 'react';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, Loader2, FilePlus, PenTool } from 'lucide-react';

const CreatedFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      // Fetch 'inbox' (which simply means "Files currently with me")
      const { data } = await endpoints.files.inbox();
      
      // 🟢 FIX: Filter strictly by Creator ID
      // Show ONLY if I created it.
      const myDrafts = data.data.filter(f => f.creatorId === user.id   && f.status === 'DRAFT');
      
      setFiles(myDrafts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-teal-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PenTool className="text-teal-600" /> Created Files (My Drafts)
          </h2>
          <p className="text-slate-500 text-sm">Files initiated by you.</p>
        </div>
        <span className="bg-amber-50 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-amber-100">
          {files.length} Drafts
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {files.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FilePlus size={32} className="opacity-50" />
            </div>
            <p>No created files found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30 rounded-tl-lg">File Number</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Subject</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Last Remark</th>
                  <th className="p-4 bg-teal-600 text-center rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-mono text-sm text-teal-700 font-medium">{file.fileNumber}</td>
                    <td className="p-4 font-medium text-slate-800">{file.subject}</td>
                    <td className="p-4 text-sm text-slate-600 italic">"{file.lastRemark}"</td>
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
    </div>
  );
};

export default CreatedFiles;