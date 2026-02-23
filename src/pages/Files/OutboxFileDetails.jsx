import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../api/axios'; 
import toast from 'react-hot-toast';
import { 
  Paperclip, ArrowLeft, Loader2, Send, X,
  ShieldCheck, CornerRightDown, Clock, Printer, FileText, Download, ArrowUpDown 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';

const OutboxFileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for dynamic PDF Viewer
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [selectedPdfName, setSelectedPdfName] = useState('');

  // State for sorting history by Date/Time
  const [sortOrder, setSortOrder] = useState('asc'); 

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  const handleDownload = async (attachmentId, name) => { 
    const toastId = toast.loading('Opening document...');
    try {
      const response = await endpoints.files.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setSelectedPdfUrl(url);
      setSelectedPdfName(name);
      toast.success(`Opened ${name}`, { id: toastId });
    } catch (err) { 
      toast.error('Failed to open document', { id: toastId }); 
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['outboxFileDetails', id],
    queryFn: async () => {
      const response = await endpoints.files.history(id);
      return response.data.data;
    },
    refetchInterval: 30000, 
  });

  // Check if file was returned to user
  useEffect(() => {
    if (data && user) {
      if (data.fileInfo.currentHolder === user.fullName) {
        toast.success("This file has been returned to your Inbox!", { icon: '📥', duration: 5000 });
        navigate(`/files/${id}`, { replace: true }); 
      }
    }
  }, [data, user, navigate, id]);

  // Clean up blob URL
  useEffect(() => {
    return () => {
      if (selectedPdfUrl) window.URL.revokeObjectURL(selectedPdfUrl);
    };
  }, [selectedPdfUrl]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (data && sortOrder === 'asc') {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [data, selectedPdfUrl]);

  if (isLoading || !data) return <div className="p-10 flex justify-center mt-20 text-slate-600"><Loader2 className="animate-spin" size={32}/></div>;
  if (error) return <div className="p-10 text-center text-red-500">Failed to load details.</div>;

  const { fileInfo: file, history } = data;
  
  const displayedHistory = sortOrder === 'asc' 
    ? history 
    : [...(history || [])].reverse();

  return (
    <div className={`mx-auto animate-fade-in-up pb-10 transition-all duration-300 flex flex-col print:block print:h-auto print:bg-white print:p-0 print:max-w-full print:w-full ${selectedPdfUrl ? 'max-w-[1600px] px-4 h-[calc(100vh-80px)]' : 'max-w-5xl'}`}>
      
      <button onClick={() => navigate('/files/outbox')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 mt-2 text-sm font-medium transition-colors shrink-0 w-fit print:hidden">
        <ArrowLeft size={16} /> Back to Outbox
      </button>

      {/* Grid Layout Container */}
      <div className={`flex flex-col lg:flex-row gap-6 w-full print:block print:overflow-visible print:w-full print:gap-0 ${selectedPdfUrl ? 'flex-1 overflow-hidden' : ''}`}>

        {/* ========================================== */}
        {/* LEFT PANE: PDF VIEWER (Hidden on Print)    */}
        {/* ========================================== */}
        {selectedPdfUrl && (
          <div className="w-full lg:w-[60%] h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-300 print:hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-red-100 text-red-600 p-2 rounded-lg shrink-0"><FileText size={20}/></div>
                <h2 className="font-bold text-slate-800 truncate">{selectedPdfName}</h2>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => {
                    const link = document.createElement('a'); 
                    link.href = selectedPdfUrl; 
                    link.setAttribute('download', selectedPdfName || 'document.pdf'); 
                    document.body.appendChild(link); 
                    link.click(); 
                    link.parentNode.removeChild(link);
                  }}
                  className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors" title="Download File"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => { setSelectedPdfUrl(null); setSelectedPdfName(''); }} 
                  className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors" title="Close Viewer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-200/50 p-2 md:p-4">
               <iframe 
                 src={`${selectedPdfUrl}#toolbar=0`} 
                 className="w-full h-full rounded-xl shadow-sm border border-slate-300 bg-white"
                 title="PDF Viewer"
               />
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* RIGHT PANE: MAIN UI / CHATS                */}
        {/* ========================================== */}
        <div className={`w-full flex flex-col transition-all duration-300 print:w-full print:block print:h-auto print:overflow-visible ${selectedPdfUrl ? 'lg:w-[40%] h-full' : 'h-full'}`}>
          
          {/* 🟢 PRINT ONLY: FIXED REPEATING HEADER (OUTSIDE TABLE) */}
          <div className="hidden print:flex fixed top-0 left-0 w-full justify-center bg-white z-[9999] pt-4 pb-2">
            <h1 className="text-2xl font-black uppercase underline decoration-2 underline-offset-4 tracking-widest text-black">
              Notesheet
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-0 flex flex-col h-full print:border-none print:shadow-none print:block print:h-auto print:overflow-visible">
            
            {/* SCREEN ONLY: Header / Subject Info */}
            <div className="px-8 py-5 flex items-start justify-between border-b border-slate-200 bg-white shadow-sm shrink-0 z-10 print:hidden">
              <div className="w-full flex flex-col">
                <h1 className="text-xl text-slate-900 font-bold tracking-tight flex items-center gap-3">
                  <span>{file.subject}</span>
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono px-2.5 py-1 rounded-md align-middle">
                    {file.fileNumber}
                  </span>
                </h1>
                <div className="flex gap-2 mt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">{file.priority} PRIORITY</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400 mt-2">
                 <Printer 
                   size={20} 
                   className="cursor-pointer hover:text-slate-700 transition-colors" 
                   title="Print Trail"
                   onClick={() => window.print()}
                 />
              </div>
            </div>

            {/* ==================================================== */}
            {/* PRINT ONLY: Formal Table for Remarks                 */}
            {/* ==================================================== */}
            {/* 🟢 FIX: Removed global border border-black from this table tag */}
            <table className="hidden print:table w-full border-collapse text-black">
              
              <thead className="table-header-group">
                {/* 1. Invisible Spacer so table doesn't hide behind fixed Notesheet header */}
                <tr>
                  <th colSpan={2} className="h-16 border-none bg-transparent"></th>
                </tr>

                {/* 2. The Subject and File Number Box */}
                <tr>
                  <th colSpan={2} className="p-0 border-t border-x border-b border-black">
                    <div className="flex flex-col items-start text-left gap-2 p-3 bg-white w-full">
                      <div className="text-lg flex gap-2 w-full">
                        <span className="font-bold w-20 shrink-0">Subject:</span>
                        <span className="font-medium flex-1">{file.subject}</span>
                      </div>
                      <div className="text-base font-mono flex gap-2 w-full">
                        <span className="font-bold w-20 shrink-0">File No:</span>
                        <span className="font-bold">{file.fileNumber}</span>
                      </div>
                    </div>
                  </th>
                </tr>

                {/* 3. The Column Headers */}
                <tr>
                  <th className="p-2 border border-black w-[75%] text-left font-bold uppercase tracking-widest text-xs bg-gray-100">Notes / Remarks</th>
                  <th className="p-2 border border-black w-[25%] text-center font-bold uppercase tracking-widest text-xs bg-gray-100">Sign & Details</th>
                </tr>
              </thead>
              
              <tbody className="table-row-group">
                {history?.map((msg) => (
                  <tr key={`print-${msg.id}`} className="break-inside-avoid">
                    <td className="p-4 border border-black align-top">
                      <div className="text-[10px] font-bold uppercase text-gray-500 mb-2 tracking-widest">
                         {msg.action}
                      </div>
                      <div className="text-[15px] whitespace-pre-wrap leading-relaxed font-medium text-black">
                        {msg.remarks || '-'}
                      </div>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-4 text-xs italic text-gray-800 bg-gray-50 p-2 border border-gray-300 rounded">
                          <strong>Attached Document(s):</strong> {msg.attachments.map(a => a.name).join(', ')}
                        </div>
                      )}
                      {msg.receiver && (
                        <div className="mt-6 pt-3 border-t border-dashed border-gray-400 flex items-center gap-2">
                          <CornerRightDown size={14} className="text-gray-500" />
                          <span className="italic text-gray-600">Forwarded to:</span>
                          <span className="font-bold text-gray-800 text-xs">{msg.receiver}</span>
                          <span className="text-gray-700 text-xs">({msg.receiverDesignation})</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 border border-black align-bottom text-center">
                      <div className="flex flex-col items-center justify-end h-full min-h-[120px]">
                        <div className="w-full h-16 mb-2"></div> 
                        <p className="font-bold text-sm text-black">{msg.sender}</p>
                        <p className="text-[10px] font-bold text-gray-800 uppercase mt-0.5 max-w-full break-words">{msg.senderDesignation || 'System'}</p>
                        <p className="text-[10px] text-gray-500 mt-2 font-medium">{msg.date}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ==================================================== */}
            {/* SCREEN ONLY: VERTICAL THREAD LAYOUT                  */}
            {/* ==================================================== */}
            <div className={`p-6 bg-slate-50/50 print:hidden min-h-[400px] ${selectedPdfUrl ? 'flex-1 overflow-y-auto' : ''}`}>
              
              <div className="flex justify-between items-center mb-6 px-1">
                <span className="text-sm font-bold text-slate-700">Official Movement History</span>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
                  title="Filter by Date/Time"
                >
                  <ArrowUpDown size={14} />
                  {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                </button>
              </div>

              <div className="space-y-6">
                {displayedHistory?.map((msg) => {
                   const isForward = msg.action === 'FORWARD';
                   
                   return (
                     <div key={msg.id} className="w-full">
                       <div className={`w-full bg-white p-5 rounded-2xl shadow-sm border transition-all ${isForward ? 'border-blue-100/60 hover:border-blue-200' : 'border-emerald-100/60 hover:border-emerald-200'}`}>
                         
                         {/* Card Header */}
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-4">
                               <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${isForward ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {isForward ? <Send size={16} className="ml-0.5"/> : <ShieldCheck size={18}/>}
                               </div>
                               
                               <div>
                                 <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                   {msg.sender} 
                                   <span className="text-xs font-medium text-slate-500">({msg.senderDesignation || 'System'})</span>
                                 </h3>
                                 
                                 {isForward && msg.receiver && (
                                    <p className="text-xs font-medium text-blue-700 flex items-center gap-1.5 mt-1 bg-blue-50/80 px-2.5 py-1 rounded-lg w-fit border border-blue-100/50">
                                      <CornerRightDown size={14} /> to {msg.receiver} <span className="opacity-70">({msg.receiverDesignation})</span>
                                    </p>
                                 )}
                               </div>
                            </div>
                            
                            <div className="text-right shrink-0">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${isForward ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                {msg.action}
                              </span>
                              <p className="text-[13px] text-black mt-2 flex items-center justify-end gap-1 font-medium"><Clock size={10}/> {msg.date}</p>
                            </div>
                         </div>
                         
                         {/* Remarks Box */}
                         {msg.remarks && (
                            <div className="text-slate-900 text-base font-medium whitespace-pre-wrap leading-relaxed bg-amber-50 p-4.5 rounded-xl border border-amber-200 shadow-sm ml-0 md:ml-14">
                              {msg.remarks}
                            </div>
                         )}

                         {/* Document Attachment Cards */}
                         {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-4 ml-0 md:ml-14 flex flex-wrap gap-4">
                              {msg.attachments.map(att => (
                                 <div 
                                   key={att.id} 
                                   onClick={() => handleDownload(att.id, att.name)} 
                                   className={`group relative flex flex-col w-40 rounded-xl overflow-hidden cursor-pointer shadow-sm border transition-all hover:shadow-md hover:-translate-y-1 ${selectedPdfUrl && selectedPdfName === att.name ? 'ring-2 ring-blue-500 border-blue-500' : ''} ${isForward ? 'border-blue-200 hover:border-blue-400' : 'border-emerald-200 hover:border-emerald-400'}`}
                                 >
                                    <div className={`h-24 flex items-center justify-center p-2 border-b transition-colors ${isForward ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 group-hover:from-blue-100' : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 group-hover:from-emerald-100'}`}>
                                       <div className="bg-white w-14 h-20 rounded shadow border border-slate-200 p-2 flex flex-col gap-1.5 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                          <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                                          <div className="w-5/6 h-1 bg-slate-200 rounded-full"></div>
                                          <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                                          <div className="w-4/6 h-1 bg-slate-200 rounded-full"></div>
                                          <div className="absolute bottom-1 right-1 bg-red-500 text-white text-[7px] font-bold px-1 rounded shadow-sm">PDF</div>
                                       </div>
                                    </div>
                                    <div className="p-2.5 bg-white flex items-start gap-2">
                                      <div className={`mt-0.5 p-1 rounded-lg shrink-0 ${isForward ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <Paperclip size={14} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-slate-900 transition-colors" title={att.name}>{att.name}</p>
                                        <p className="text-[9px] text-slate-400 mt-0.5 font-bold tracking-wider uppercase">{att.file_size ? `${(att.file_size / 1024).toFixed(1)} KB` : 'DOCUMENT'}</p>
                                      </div>
                                    </div>
                                 </div>
                              ))}
                            </div>
                         )}

                       </div>
                     </div>
                   );
                })}
                
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} className="h-1"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OutboxFileDetails;