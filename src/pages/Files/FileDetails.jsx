import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../api/axios'; 
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Paperclip, ArrowLeft, Loader2, X, Printer, Send, Users, 
  Trash2, ShieldCheck, CornerRightDown, Clock, FileText, Download, ArrowUpDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const FileDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const messagesEndRef = useRef(null);
  
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [selectedPdfName, setSelectedPdfName] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); 

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [attachments, setAttachments] = useState([]);
  
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [composeHeight, setComposeHeight] = useState(260);

  const dropdownRef = useRef(null);

  const { data: fileData, isLoading: isLoadingFile } = useQuery({
    queryKey: ['fileDetails', id],
    queryFn: async () => {
      const response = await endpoints.files.history(id);
      return response.data.data;
    }
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await endpoints.users.getAll();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60 * 24 
  });

  const data = fileData;

  useEffect(() => {
    return () => {
      if (selectedPdfUrl) window.URL.revokeObjectURL(selectedPdfUrl);
    };
  }, [selectedPdfUrl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (data && sortOrder === 'asc') {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [data, selectedPdfUrl]);

  const getDesignationName = (val) => val?.name || (typeof val === 'string' ? val : '');

  const filteredUsers = allUsers.filter(u => 
    u.id !== user?.id && 
    (u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     getDesignationName(u.designation).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openForwardConfirmation = () => {
    if (!selectedRecipient) return toast.error("Please select a recipient");
    if (!remarks.trim()) return toast.error("Please enter forwarding remarks");
    setIsForwardModalOpen(true);
    setPin(''); 
  };

  const handleForward = async () => {
    if (!pin || pin.length !== 4) return toast.error("Please enter a valid 4-digit PIN");
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('receiverId', selectedRecipient.id);
      formData.append('action', 'FORWARD');
      formData.append('remarks', remarks);
      formData.append('pin', pin);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await endpoints.workflow.move(id, formData);
      toast.success('File forwarded successfully');
      setIsForwardModalOpen(false);
      navigate('/files/outbox');
    } catch (e) { 
      toast.error(e.response?.data?.message || "Failed to forward file");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const startResizing = (e) => {
    e.preventDefault();
    const isTouch = e.type === 'touchstart';
    
    const onMouseMove = (moveEvent) => {
      const clientY = isTouch ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const newHeight = window.innerHeight - clientY - 80; 
      
      // 🟢 FIX: Snap to fully closed (0) if dragged below 100px
      if (newHeight < 100) {
        setComposeHeight(0);
      } else if (newHeight <= window.innerHeight * 0.8) {
        setComposeHeight(newHeight);
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener(isTouch ? "touchmove" : "mousemove", onMouseMove);
      document.removeEventListener(isTouch ? "touchend" : "mouseup", onMouseUp);
    };
    
    document.addEventListener(isTouch ? "touchmove" : "mousemove", onMouseMove, { passive: false });
    document.addEventListener(isTouch ? "touchend" : "mouseup", onMouseUp);
  };

  if (isLoadingFile || !data) {
    return (
      <div className="p-10 flex justify-center mt-20">
        <Loader2 className="animate-spin text-slate-600" size={32}/>
      </div>
    );
  }
  
  const { fileInfo: file, history } = data;
  
  const displayedHistory = sortOrder === 'asc' 
    ? history 
    : [...(history || [])].reverse();

  return (
    <div className={`mx-auto animate-fade-in-up pb-10 transition-all duration-300 flex flex-col print:block print:h-auto print:bg-white print:p-0 ${selectedPdfUrl ? 'max-w-[1600px] px-4 h-[calc(100vh-80px)]' : 'max-w-5xl'}`}>
      
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 mt-2 text-sm font-medium transition-colors shrink-0 w-fit print:hidden">
        <ArrowLeft size={16} /> Back
      </button>

      <div className={`flex flex-col lg:flex-row gap-6 w-full print:block print:overflow-visible print:w-full print:gap-0 ${selectedPdfUrl ? 'flex-1 overflow-hidden' : ''}`}>

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
                    const link = document.createElement('a'); link.href = selectedPdfUrl; link.setAttribute('target', '_blank');
                    document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
                  }}
                  className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors" title="Open in New Tab"
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

        {/* RIGHT PANE: MAIN UI / CHATS */}
        <div className={`w-full flex flex-col transition-all duration-300 print:w-full print:block print:h-auto ${selectedPdfUrl ? 'lg:w-[40%] h-full' : 'h-[calc(100vh-120px)]'}`}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-0 flex flex-col h-full print:border-none print:shadow-none print:block print:h-auto print:rounded-none">
            
            <div className="hidden print:block text-center mt-12 mb-8">
               <h1 className="text-2xl font-black uppercase underline decoration-2 underline-offset-4 tracking-widest text-black">Notesheet</h1>
            </div>
            <table className=" hidden print:table w-full border-collapse border border-black text-black">
              <thead className="table-header-group">
                <tr>
                  <th colSpan={2} className="p-0 border-b border-black">
                    <div className="flex flex-col items-start text-left gap-2 p-3 border-t border-x border-black bg-white w-full">
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

            {/* Header / Subject Info */}
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

            {/* VERTICAL THREAD LAYOUT */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 print:hidden">
              
              <div className="flex justify-between items-center mb-6 px-1">
                <span className="text-sm font-bold text-slate-700">Audit Trail</span>
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
                         
                        {msg.remarks && (
                          <div className="text-slate-900 text-base font-medium whitespace-pre-wrap leading-relaxed bg-amber-50 p-4.5 rounded-xl border border-amber-200 shadow-sm ml-0 md:ml-14">
                            {msg.remarks}
                          </div>
                        )}

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
                <div ref={messagesEndRef} className="h-1"></div>
              </div>
            </div>

            {/* 🟢 NEW: Draggable Resizer Line (with double-click support) */}
            <div 
              onMouseDown={startResizing}
              onTouchStart={startResizing}
              onDoubleClick={() => setComposeHeight(composeHeight === 0 ? 260 : 0)}
              className={`w-full cursor-row-resize bg-slate-100 hover:bg-teal-50 transition-colors flex items-center justify-center print:hidden shrink-0 group border-y border-slate-200 z-10 relative ${composeHeight === 0 ? 'h-6' : 'h-3'}`}
              title="Drag or double-click to toggle"
            >
              <div className="w-12 h-1 bg-slate-400 rounded-full group-hover:bg-teal-500 transition-colors"></div>
              {composeHeight === 0 && (
                <span className="absolute text-[10px] text-slate-500 font-bold tracking-widest uppercase ml-20 pointer-events-none">
                  Open Remarks
                </span>
              )}
            </div>

          {/* 🟢 UPDATED: Conditional overflow and z-30 so the dropdown can escape the box */}
            <div 
              className={`bg-slate-50/50 rounded-b-2xl shrink-0 print:hidden flex flex-col relative z-30 ${composeHeight === 0 ? 'overflow-hidden' : 'overflow-visible'}`}
              style={{ height: composeHeight }}
            >
              <div className={`flex-1 flex flex-col h-full ${selectedPdfUrl ? 'px-6 pb-6 pt-3' : 'px-8 pb-8 pt-4'}`}>
                <div className={`border border-slate-300 rounded-2xl shadow-lg transition-all bg-white flex flex-col h-full ${composeHeight === 0 ? 'overflow-hidden' : 'overflow-visible'}`}>
                   
                   <div className="shrink-0 flex items-center border-b border-slate-100 px-5 py-3 bg-slate-100/80 rounded-t-2xl relative">
                      <span className="text-black text-sm font-medium w-10">To:</span>
                      {selectedRecipient ? (
                        <div className="flex items-center gap-2 bg-slate-800 text-white border border-slate-700 px-3 py-1.5 rounded-full text-xs shadow-sm">
                          <span className="font-medium">{selectedRecipient.full_name}</span>
                          <span className="opacity-70">({getDesignationName(selectedRecipient.designation)})</span>
                          <div className="w-px h-3 bg-slate-600 mx-1"></div>
                          <X size={14} className="cursor-pointer hover:text-red-400" onClick={() => setSelectedRecipient(null)} />
                        </div>
                      ) : (
                        <div className="flex-1 relative" ref={dropdownRef}>
                          <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)}
                            className="w-full bg-transparent text-sm outline-none text-slate-800 py-1 placeholder:text-slate-400"
                            placeholder="Search recipient by name or designation..."
                          />
                          {isDropdownOpen && (
                             <div className="absolute bottom-full left-0 mb-2 w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-xl z-50 max-h-48 overflow-y-auto">
                                {filteredUsers.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 flex flex-col items-center">
                                        <Users size={24} className="mb-2 opacity-30"/>
                                        <p className="text-xs">No users found</p>
                                    </div>
                                ) : (
                                    filteredUsers.map(u => (
                                      <div 
                                        key={u.id} 
                                        onClick={() => { setSelectedRecipient(u); setSearchTerm(''); setIsDropdownOpen(false); }} 
                                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none flex items-center justify-between group transition-colors"
                                      >
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{u.full_name}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{getDesignationName(u.designation)}</p>
                                        </div>
                                      </div>
                                    ))
                                )}
                             </div>
                          )}
                        </div>
                      )}
                   </div>

                   <textarea 
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="flex-1 w-full p-4 text-sm text-slate-800 outline-none resize-none leading-relaxed placeholder:text-slate-400 min-h-[60px]" 
                      placeholder="Add your comments before forwarding..."
                   />

                   {attachments.length > 0 && (
                      <div className="shrink-0 px-5 py-3 border-t border-slate-100 flex flex-wrap gap-3 bg-slate-50/50 overflow-y-auto max-h-24">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="relative group flex flex-col w-24 rounded-lg overflow-hidden shadow-sm border border-slate-200 bg-white">
                             <button 
                               onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                               className="absolute top-1 right-1 z-10 bg-white/90 text-slate-500 hover:text-red-500 hover:bg-red-50 p-1 rounded-full border border-slate-100"
                             >
                               <X size={10} />
                             </button>
                             <div className="h-10 bg-gradient-to-br from-slate-50 to-slate-100 border-b flex items-center justify-center p-1">
                                 <Paperclip size={12} className="text-slate-400"/>
                             </div>
                             <div className="p-1.5 bg-white">
                                <p className="text-[9px] font-bold text-slate-800 truncate">{file.name}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                   )}

                   <div className="shrink-0 flex justify-between items-center px-5 py-3 bg-white border-t border-slate-100 rounded-b-2xl">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={openForwardConfirmation}
                          disabled={isSubmitting || !selectedRecipient}
                          className="w-40 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:active:scale-100"
                        >
                          Send File
                        </button>
                        
                        <label className="p-2 text-slate-500 hover:bg-slate-100 rounded-full cursor-pointer transition-colors" title="Attach files">
                          <Paperclip size={18} />
                          <input type="file" accept="application/pdf" multiple className="hidden" onChange={e => {
                             if(e.target.files?.length) setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
                          }} />
                        </label>
                      </div>

                      <button 
                         onClick={() => {setRemarks(''); setAttachments([]); setSelectedRecipient(null);}}
                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                         title="Discard Draft"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isForwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 animate-in fade-in duration-200 print:hidden">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-6 text-center border-b border-slate-100">
              <div className="w-16 h-16 bg-white border border-slate-200 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Send size={24} className="ml-1" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800">Confirm Forward</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Forwarding file to <br/>
                <span className="font-bold text-slate-800 text-base">{selectedRecipient?.full_name}</span>
                {attachments.length > 0 && <><br/><span className="text-blue-600 font-medium">({attachments.length} attachment{attachments.length > 1 ? 's' : ''} included)</span></>}
              </p>
            </div>
            <div className="p-8">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
                Enter Security PIN
              </label>
              <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} className="w-full text-center text-4xl tracking-[0.5em] p-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-black text-slate-800 shadow-inner" placeholder="••••" autoFocus />
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setIsForwardModalOpen(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm">Cancel</button>
              <button onClick={handleForward} disabled={isSubmitting || pin.length !== 4} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-sm">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDetails;