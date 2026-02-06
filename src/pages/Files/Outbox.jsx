import { useEffect, useState } from 'react';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, Send } from 'lucide-react';

const Outbox = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOutbox();
  }, []);

  const fetchOutbox = async () => {
    try {
      const { data } = await endpoints.files.outbox();
      setFiles(data.data);
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
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Outbox</h2>
          <p className="text-slate-500 text-sm">Files you have sent or processed</p>
        </div>
        <span className="bg-teal-50 text-teal-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-teal-100">
          {files.length} Sent
        </span>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {files.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="opacity-50" />
            </div>
            <p>No sent files found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {/* --- SEA GREEN HEADER --- */}
                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30 rounded-tl-lg">File Number</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Subject</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Type</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Sent To</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Current Status</th>
                  <th className="p-4 bg-teal-600 text-center rounded-tr-lg">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-mono text-sm text-teal-700 font-medium">{file.fileNumber}</td>
                    <td className="p-4 font-medium text-slate-800">{file.subject}</td>
                    <td className="p-4 text-sm text-slate-600">{file.type}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {file.currentHolder?.full_name || 'Completed'}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {file.status}
                      </span>
                    </td>
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

export default Outbox;