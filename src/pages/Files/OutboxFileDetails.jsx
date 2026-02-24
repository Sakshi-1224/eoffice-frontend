import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../api/axios'; 
import toast from 'react-hot-toast';
import { 
  Paperclip, ArrowLeft, Loader2, Send, X,
  ShieldCheck, CornerRightDown, Clock, Printer, FileText, Download 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';

const OutboxFileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for dynamic PDF Viewer
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [selectedPdfName, setSelectedPdfName] = useState('');
const [activeMessageIndex, setActiveMessageIndex] = useState(null);
  const parentRef = useRef(null); // Reference for the Virtualizer
  const hasScrolledToBottom = useRef(false); // Tracks initial load scroll

  // 1. Fetch data (Backend is sending newest first)
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteQuery({
    queryKey: ['outboxFileDetails', id],
    queryFn: async ({ pageParam = null }) => {
      const response = await endpoints.files.history(id, { cursor: pageParam, limit: 20 });
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
    refetchInterval: 30000, 
  });

  const file = data?.pages[0]?.data?.fileInfo || {};

  // 2. Flatten History (Older pages pushed to the TOP of the array)
  const displayedHistory = data?.pages.reduce((acc, page) => {
    return [...(page.data?.history || []), ...acc];
  }, []) || [];

  // Check if file was returned to user's Inbox dynamically
  useEffect(() => {
    if (file?.currentHolder && user) {
      if (file.currentHolder === user.fullName || file.currentHolder === user.full_name) {
        toast.success("This file has been returned to your Inbox!", { icon: '📥', duration: 5000 });
        navigate(`/files/${id}`, { replace: true }); 
      }
    }
  }, [file.currentHolder, user, navigate, id]);

  // Clean up blob URL
  useEffect(() => {
    return () => {
      if (selectedPdfUrl) window.URL.revokeObjectURL(selectedPdfUrl);
    };
  }, [selectedPdfUrl]);

  // 3. Setup Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? displayedHistory.length + 1 : displayedHistory.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220, 
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // 4. Auto-Scroll to Bottom on INITIAL load only
  useEffect(() => {
    if (displayedHistory.length > 0 && !hasScrolledToBottom.current) {
      setTimeout(() => {
        rowVirtualizer.scrollToIndex(displayedHistory.length - 1, { align: 'end', behavior: 'auto' });
        hasScrolledToBottom.current = true;
      }, 50);
    }
  }, [displayedHistory.length, rowVirtualizer]);

  // 🟢 RE-ANCHOR TO THE EXACT MESSAGE WHEN PDF OPENS/CLOSES
  useEffect(() => {
    if (activeMessageIndex !== null) {
      setTimeout(() => {
        // align: 'center' keeps the clicked message perfectly in the middle of the screen
        rowVirtualizer.scrollToIndex(activeMessageIndex, { align: 'center', behavior: 'auto' });
      }, 300); // 300ms gives the CSS flexbox enough time to finish resizing
    }
  }, [selectedPdfUrl, activeMessageIndex, rowVirtualizer]);

  // 5. TRIGGER FETCH ON SCROLL UP
  useEffect(() => {
    const firstVisibleItem = virtualItems[0];
    if (!firstVisibleItem) return;

    if (firstVisibleItem.index <= 1 && hasNextPage && !isFetchingNextPage && hasScrolledToBottom.current) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, virtualItems]);

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

  if (isLoading || !data) return <div className="p-10 flex justify-center mt-20 text-slate-600"><Loader2 className="animate-spin" size={32}/></div>;

  return (
    <div className={`mx-auto animate-fade-in-up transition-all duration-300 flex flex-col print:block print:h-auto print:bg-white print:p-0 print:max-w-full print:w-full h-[calc(100vh-6rem)] overflow-hidden ${selectedPdfUrl ? 'max-w-[1600px] px-4' : 'max-w-[67rem]'}`}>
      
      <button onClick={() => navigate('/files/outbox')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 mt-2 text-sm font-medium transition-colors shrink-0 w-fit print:hidden">
        <ArrowLeft size={16} /> Back to Outbox
      </button>

      {/* ==================================================== */}
      {/* 🖨️ THE PRINT FIX: ABSOLUTE OVERLAY                     */}
      {/* ==================================================== */}
      <div className="hidden print:block print:absolute print:inset-0 print:w-full print:min-h-screen print:bg-white print:z-[99999] print:m-0 print:p-0">
        <table className="w-[75%] mx-auto border-collapse border-l-2 border-r-2 border-black bg-white text-black font-serif text-[11pt] leading-snug min-h-screen">
          <thead className="table-header-group">
            <tr>
              <td colSpan={2} className="px-8 pt-8 pb-4 bg-white relative">
                <div className="absolute bottom-0 left-[50%] -translate-x-1/2 border-b-[2px] border-black w-full"></div>
                <div className="text-center">
                  <h1 className="text-xl font-bold uppercase tracking-widest">Maharashtra Mandal Raipur</h1>
                  <h2 className="text-lg font-bold uppercase underline decoration-1 underline-offset-4 mt-1">Notesheet</h2>
                </div>
                <div className="mt-8 flex justify-between text-sm font-semibold text-left">
                  <span>Subject: {file.subject}</span>
                  <span>File No: {file.fileNumber}</span>
                </div>
              </td>
            </tr>
            <tr className="border-b-[2px] border-black font-bold text-xs uppercase bg-white"></tr>
          </thead>
          <tbody className="table-row-group align-top">
            {displayedHistory.map((msg, index) => (
              <tr key={`print-note-${msg.id}`} className="break-inside-avoid">
                <td className="w-[65%] pl-8 pr-4 pt-6 pb-4">
                    <div className="flex gap-2">
                      <span className="font-bold text-xs">{index + 1}.</span>
                      <div className="flex-1">
                        <div className="text-[13px] whitespace-pre-wrap text-justify leading-relaxed">{msg.remarks || '-'}</div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 text-[10px] italic text-gray-700">*Encl: {msg.attachments.map(a => a.name).join(', ')}</div>
                        )}
                        {msg.receiver && (
                          <div className="mt-4 text-[12px] font-bold">{msg.receiver} <span className="text-[10px] font-medium">({msg.receiverDesignation})</span></div>
                        )}
                      </div>
                    </div>
                </td>
                <td className="w-[35%] pr-8 pt-6 text-right pb-4">
                    <div className="h-10 w-full flex items-end justify-end mb-1">
                      {msg.senderSignature ? (
                        <img src={`http://localhost:9000/e-office-files/${msg.senderSignature}`} alt="Signature" className="max-h-full max-w-[120px] object-contain mix-blend-multiply" />
                      ) : (
                        <span className="text-[9px] text-gray-400 italic">No Signature</span>
                      )}
                    </div>
                    <p className="font-bold text-[11px] leading-tight m-0 p-0">{msg.sender}</p>
                    <p className="text-[9px] font-bold uppercase m-0 p-0">{msg.senderDesignation || 'System'}</p>
                    <p className="text-[10px] text-gray-600 font-medium mt-1 m-0 p-0">{msg.date}</p>
                </td>
              </tr>
            ))}
            <tr><td colSpan={2} className="h-full"></td></tr>
          </tbody>
        </table>
      </div>
      {/* ==================================================== */}

      {/* 🟢 print:hidden wrapped around the entire screen layout */}
      <div className={`flex flex-col lg:flex-row gap-6 w-full print:hidden flex-1 overflow-hidden`}>

        {/* ========================================== */}
        {/* LEFT PANE: PDF VIEWER                      */}
        {/* ========================================== */}
        {selectedPdfUrl && (
          <div className="w-full lg:w-[60%] h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-300">
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
        <div className={`w-full flex flex-col transition-all duration-300 h-full ${selectedPdfUrl ? 'lg:w-[40%] h-full' : 'h-[calc(100vh-120px)]'}`}>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-0 flex flex-col h-full">
            
            {/* SCREEN ONLY: Header / Subject Info */}
            <div className="px-8 py-5 flex items-start justify-between border-b border-slate-200 bg-white shadow-sm shrink-0 z-10">
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

            {/* VIRTUALIZED VERTICAL THREAD LAYOUT */}
            <div ref={parentRef} className={`p-6 bg-slate-50/50 flex flex-col ${selectedPdfUrl ? 'flex-1 overflow-y-auto' : 'flex-1 overflow-y-auto min-h-[400px]'}`} style={{ overflowAnchor: 'auto' }}>
              
              <div className="flex justify-between items-center mb-6 px-1 shrink-0">
                <span className="text-sm font-bold text-slate-700">Audit Trail</span>
              </div>

              <div className="w-full relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
                {virtualItems.map((virtualItem) => {
                  
                  // The Loader is now at the TOP (Index 0)
                  const isLoaderRow = hasNextPage && virtualItem.index === 0;
                  
                  // Adjust index to map correctly to data
                  const dataIndex = hasNextPage ? virtualItem.index - 1 : virtualItem.index;
                  const msg = displayedHistory[dataIndex];

                  if (isLoaderRow) {
                    return (
                      <div
                        key={virtualItem.key}
                        className="absolute top-0 left-0 w-full flex justify-center py-4"
                        style={{ transform: `translateY(${virtualItem.start}px)` }}
                        ref={rowVirtualizer.measureElement}
                      >
                        <Loader2 className="animate-spin text-slate-400" size={24} />
                      </div>
                    );
                  }

                  if (!msg) return null;

                  const isForward = msg.action === 'FORWARD';
                   
                  return (
                    <div 
                      key={virtualItem.key} 
                      className="absolute top-0 left-0 w-full pb-4"
                      style={{ transform: `translateY(${virtualItem.start}px)` }}
                      data-index={virtualItem.index} 
                      ref={rowVirtualizer.measureElement}
                    >
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
                            
                            <div className="text-right shrink-0 flex flex-col items-end">
                              <div className="flex items-center gap-3 mb-2">
                                {msg.senderSignature && (
                                  <img 
                                    src={`http://localhost:9000/e-office-files/${msg.senderSignature}`} 
                                    alt="Sign" 
                                    className="h-10 w-auto object-contain mix-blend-multiply" 
                                  />
                                )}
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${isForward ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                  {msg.action}
                                </span>
                              </div>
                              <p className="text-[13px] text-black mt-1 flex items-center justify-end gap-1 font-medium"><Clock size={10}/> {msg.date}</p>
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
                                   onClick={() => {setActiveMessageIndex(virtualItem.index); handleDownload(att.id, att.name);}} 
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
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OutboxFileDetails;