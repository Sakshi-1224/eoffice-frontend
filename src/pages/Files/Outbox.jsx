import { useEffect, useState } from 'react';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, Send, ArrowRight, MessageSquare } from 'lucide-react';

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="text-teal-600" /> Outbox
          </h2>
          <p className="text-slate-500 text-sm">Files sent to others (Tracking by Remarks)</p>
        </div>
        <span className="bg-teal-50 text-teal-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-teal-100">
          {files.length} Sent
        </span>
      </div>

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
                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30 rounded-tl-lg">File Number</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Subject</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Currently With</th>
                  
                  {/* 🟢 REPLACED STATUS WITH REMARK */}
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Last Remark</th>
                  
                  <th className="p-4 bg-teal-600 text-center rounded-tr-lg">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-mono text-sm text-teal-700 font-medium">
                      {file.fileNumber}
                    </td>
                    <td className="p-4 font-medium text-slate-800 max-w-xs truncate" title={file.subject}>
                      {file.subject}
                    </td>
                    
                    <td className="p-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <ArrowRight size={14} className="text-teal-500" />
                        <div>
                            <span className="block font-bold text-slate-700">{file.currentHolder}</span>
                            <span className="text-xs text-slate-400 font-medium">{file.currentPosition?.designation}</span>
                        </div>
                      </div>
                    </td>

                    {/* 🟢 SHOW REMARK INSTEAD OF STATUS */}
                    <td className="p-4">
                      <div className="flex items-start gap-2 max-w-[250px]">
                        <MessageSquare size={14} className="text-slate-400 mt-1 shrink-0" />
                        <div>
                            <span className="text-xs font-bold text-slate-700 uppercase block mb-0.5">
                                {file.lastAction}
                            </span>
                            <span className="text-sm text-slate-600 italic line-clamp-2">
                                "{file.lastRemark || 'No remarks'}"
                            </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <button 
                       onClick={() => navigate(`/files/outbox/${file.id}`)}
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