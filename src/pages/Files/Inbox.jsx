import { useEffect, useState } from 'react';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, Loader2, Inbox as InboxIcon, User } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
const Inbox = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // New state for button loader
  const [nextCursor, setNextCursor] = useState(null);    // New state for cursor
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async (cursor = null) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const { data } = await endpoints.files.inbox(10, cursor);
     const newFiles = data.data.filter(f => f.status != 'DRAFT');
//const newFiles = data.data;
      if(cursor){
      setFiles(prev => [...prev, ...newFiles]); 
      }else{
        setFiles(newFiles);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
            <InboxIcon className="text-teal-600" /> Inbox
          </h2>
          <p className="text-slate-500 text-sm">Files currently pending at your desk.</p>
        </div>
        <span className="bg-teal-50 text-teal-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-teal-100">
          {files.length} Pending
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {files.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <InboxIcon size={32} className="opacity-50" />
            </div>
            <p>Your inbox is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-white">
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30 rounded-tl-lg">File Number</th>
<th className="p-4 bg-teal-600 border-r border-teal-500/30">Created On</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Subject</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Sent By</th>
                  <th className="p-4 bg-teal-600 border-r border-teal-500/30">Last Remark</th>
                  <th className="p-4 bg-teal-600 text-center rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => {
                  // 🟢 LOGIC: Use lastSender from backend (Forwarder), fallback to Creator
                  const senderName = file.lastSender || file.createdBy || 'Unknown';

                  return (
                    <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 font-mono text-sm text-teal-700 font-medium">{file.fileNumber}</td>
   
<td className="p-4 font-medium text-slate-800">{file.createdAt}</td>

                      <td className="p-4 font-medium text-slate-800">{file.subject}</td>
                      
                      <td className="p-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-teal-500"/>
                            <span className="font-semibold text-slate-700">{senderName}</span>
                        </div>
                      </td>

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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* 🟢 NEW: Load More Button */}
        {nextCursor && (
          <div className="p-4 bg-teal-600 text-white border-t border-slate-100 flex justify-center bg-slate-50">
            <button
              onClick={() => fetchInbox(nextCursor)}
              disabled={loadingMore}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white border border-teal-700 text-slate-700 rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-all"
            >
              {loadingMore ? <Loader2 className="animate-spin" size={16} /> : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;