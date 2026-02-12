import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../api/axios'; 
import toast from 'react-hot-toast';
import { 
  Paperclip, History, User, Download, ArrowLeft,
  ShieldCheck, Clock, FileText
} from 'lucide-react';

const OutboxFileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);

  // Helper: Safe Designation Accessor
  const getDesignationName = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val?.name || ''; 
  };

  const loadData = () => {
    // Only fetch history/details. No need to fetch all users since we can't forward.
    endpoints.files.history(id)
      .then((historyRes) => {
        setData(historyRes.data.data);
      })
      .catch(err => toast.error("Failed to load details"));
  };

  useEffect(() => { loadData(); }, [id]);

  const handleDownload = async (type, identifier) => { 
    const toastId = toast.loading('Opening...');
    try {
      let response;
      if (type === 'puc') response = await endpoints.files.downloadPuc(identifier);
      else if (type === 'attachment') response = await endpoints.files.downloadAttachment(identifier);
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a'); link.href = url; link.setAttribute('target', '_blank');
      document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
      toast.success('Done', { id: toastId });
    } catch (err) { toast.error('Download failed', { id: toastId }); }
  };

  if (!data) return <div className="p-10 text-center text-teal-600 font-medium">Loading details...</div>;
  const { file, history } = data;

  return (
    <div className="animate-fade-in-up max-w-7xl mx-auto">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/files/outbox')} 
        className="flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} /> Back to Outbox
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Read-Only Metadata & Attachments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-mono tracking-wide">{file.fileNumber}</span>
                <h1 className="text-2xl font-bold text-slate-800 mt-3">{file.subject}</h1>
              </div>
              <div className="flex gap-2">
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-teal-50 text-teal-700 border border-teal-100 flex items-center gap-1">
                     <Clock size={14} /> Sent / Pending
                  </span>
                  {file.isVerified && (
                      <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                      <ShieldCheck size={14} /> Verified
                      </span>
                  )}
              </div>
            </div>
            
           {/* METADATA GRID - Updated to show all details */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 text-sm text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100">
  
  {/* 1. Created Date */}
  <div>
    <span className="font-semibold text-slate-800 block mb-1 text-xs uppercase tracking-wider">Created On</span>
    <span className="font-mono">{file.createdAt}</span>
  </div>

  {/* 2. File Type */}
  <div>
    <span className="font-semibold text-slate-800 block mb-1 text-xs uppercase tracking-wider">File Type</span>
    <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">
      {file.type}
    </span>
  </div>

  {/* 3. Priority (With Colors) */}
  <div>
    <span className="font-semibold text-slate-800 block mb-1 text-xs uppercase tracking-wider">Priority</span>
    <span className={`px-2 py-1 rounded text-xs font-bold ${
      file.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
      file.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
      'bg-green-100 text-green-700'
    }`}>
      {file.priority}
    </span>
  </div>

  {/* 4. Current Designation (Existing) */}
  <div>
    <span className="font-semibold text-slate-800 block mb-1 text-xs uppercase tracking-wider">Current Holder</span>
    <div className="flex flex-col">
      <span className="font-medium text-slate-900">{file.currentHolder}</span>
      <span className="text-xs text-slate-500">{getDesignationName(file.currentPosition?.designation)}</span>
    </div>
  </div>

  {/* 5. Description (Full Width) */}
  <div className="col-span-2 md:col-span-4 border-t border-slate-200 pt-4 mt-2">
    <span className="font-semibold text-slate-800 block mb-2 text-xs uppercase tracking-wider">Description / Note</span>
    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
      {file.description || "No description provided."}
    </p>
  </div>

</div>
            {/* Attachments (Read Only) */}
            <div className="mt-8">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2 mb-4">
                 <Paperclip size={18} /> Attachments
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm bg-teal-50 p-3 rounded-lg border border-teal-100 group hover:bg-teal-100 transition-colors">
                  <span className="font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded text-xs">PUC</span>
                  <span className="flex-1 font-medium text-teal-900">{file.originalName}</span>
                  <Download size={16} className="text-teal-600 cursor-pointer" onClick={() => handleDownload('puc', file.id)}/>
                </li>
                
                {file.attachments.map(att => (
                   <li key={att.id} className="flex items-center gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 group hover:bg-slate-100 transition-colors">
                     <span className="font-semibold text-slate-400 text-xs">REF</span>
                     <span className="flex-1 text-slate-700">{att.name}</span>
                     <Download size={16} className="text-slate-400 group-hover:text-slate-600 cursor-pointer" onClick={() => handleDownload('attachment', att.id)}/>
                   </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Audit Trail (Tracking) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-4 overflow-hidden">
            <div className="bg-teal-600 p-4 border-b border-teal-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="text-teal-200" /> Tracking History
              </h3>
            </div>
            <div className="p-6">
               <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-2">
                {history.map((item, idx) => (
                  <div key={idx} className="ml-6 relative">
                    <span className={`absolute -left-[31px] top-1 border-4 border-white rounded-full w-4 h-4 shadow-sm ${idx === 0 ? 'bg-teal-500 ring-2 ring-teal-100' : 'bg-slate-300'}`}></span>
                    <div className="text-xs text-slate-400 font-mono mb-1">{item.date}</div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.action}</h4>
                    <div className="text-xs text-slate-600 mt-2 flex flex-col gap-1">
                      <div className="flex items-center gap-1"><User size={12} /> {item.from}</div>
                      {item.to !== 'System' && item.to !== item.from && <div className="flex items-center gap-1 font-medium"><User size={12} /> {item.to}</div>}
                    </div>
                    {item.remarks && <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2 rounded border border-slate-100">"{item.remarks}"</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OutboxFileDetails;