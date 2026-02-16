import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../api/axios'; 
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Paperclip, ArrowRight, History, User, Download, 
  Trash2, PlusCircle, Loader2, ShieldCheck, 
  CheckCircle2, Lock, Send, KeyRound, ShieldAlert, FileText, ChevronRight, Search
} from 'lucide-react';
import FileMovementTimeline from '../../components/FileMovementTimeline';
const FileDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const attachmentInputRef = useRef(null); 
  
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  // UI Toggles
  const [showPinInput, setShowPinInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Forward Form
const { register, handleSubmit, setValue, formState: { isSubmitting, errors } } = useForm({
    defaultValues: { action: 'FORWARD', receiverId: '' }
  });

  const pinRef = useRef(null);
// useEffect(() => { 
//     // Only fetch file history initially. Do NOT fetch all users.
//     endpoints.files.history(id)
//       .then((res) => setData(res.data.data))
//       .catch(() => toast.error("Failed to load details"));
//   }, [id]);

  const loadData = () => {
    endpoints.files.history(id)
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Failed to load details"));
  };

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }
    const delay = setTimeout(() => {
      setIsSearching(true);
      endpoints.users.getAll(`?search=${searchTerm}`)
        .then(res => setUsers(res.data.data))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 500); // 500ms wait time

    return () => clearTimeout(delay);
  }, [searchTerm]);


  const getDesignationName = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val?.name || ''; 
  };

  // const loadData = () => {
  //   Promise.all([
  //     endpoints.files.history(id),
  //     endpoints.users.getAll() 
  //   ]).then(([historyRes, usersRes]) => {
  //     setData(historyRes.data.data);
  //     setUsers(usersRes.data.data);
  //   }).catch(err => toast.error("Failed to load details"));
  // };

  // useEffect(() => { loadData(); }, [id]);

  if (!data) return <div className="p-10 text-center text-teal-600 font-medium">Loading details...</div>;
  const { file, history } = data;

  // --- ROLE & STATE LOGIC ---
  const isPresident = getDesignationName(user?.designation) === 'PRESIDENT'; 
  const isBoardMember = user?.systemRole === 'BOARD_MEMBER' || user?.systemRole === 'ADMIN';
  const isStaff = user?.systemRole === 'STAFF'; 

  const isDraft = file.status === 'DRAFT'; 
  const isVerified = file.isVerified;

  // 1. Board Members/President MUST verify (even if draft)
  const requiresVerification = (isBoardMember || isPresident || isStaff) && !isVerified;

  // 2. Can they verify? (Only if PIN is set)
  const isPinSet = user?.isPinSet; 

  // --- HANDLERS ---

  const handleVerify = async () => {
    const pin = pinRef.current?.value;
    if (!pin || pin.length !== 4) {
        toast.error("Please enter a valid 4-digit PIN");
        return;
    }

    setIsVerifying(true);
    toast.dismiss();
    try {
        await endpoints.workflow.move(id, {
            action: 'VERIFY',
            remarks: `Verified via PIN by ${user?.fullName || 'Unknown User'}`,
            pin: pin
        });
        toast.success("Verification Successful!");
        setShowPinInput(false); 
        setData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                file: {
                    ...prevData.file,
                    isVerified: true // Force the UI to see it as verified
                }
            };
        });
        loadData(); 
    } catch (e) {
       const errorMsg = e.response?.data?.message || "Verification Failed";
        
        // ⚡ HANDLE "ALREADY VERIFIED" (Fixes double-click error showing failure)
        if (errorMsg.toLowerCase().includes("already verified")) {
             toast.success("Verification Successful!");
             setShowPinInput(false);
             // Update UI immediately
             setData(prevData => ({
                ...prevData,
                file: { ...prevData.file, isVerified: true }
             }));
        } else {
             toast.error(errorMsg);
        }
    } finally {
        setIsVerifying(false);
    }
  };

  const onForwardSubmit = async (formData) => {
    try {
      const payload = {
        receiverId: parseInt(formData.receiverId),
        action: 'FORWARD', 
        remarks: formData.remarks
      };

      await endpoints.workflow.move(id, payload);
      toast.success('File forwarded successfully');
      navigate('/files/outbox');
    } catch (e) { 
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

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

  const handleRemoveAttachment = async (attId) => { 
      if(!confirm("Remove attachment?")) return;
      try { await endpoints.files.removeAttachment(attId); toast.success('Removed'); loadData(); } catch (err) { toast.error('Deletion failed'); }
  };

  const availableRecipients = users.filter(u => {
    if (u.id === user.id) return false;
    const uDesig = getDesignationName(u.designation);
    if (isStaff && uDesig === 'PRESIDENT') return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      
      {/* LEFT COLUMN: Metadata & Attachments */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* METADATA CARD */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-mono tracking-wide">{file.fileNumber}</span>
              <h1 className="text-2xl font-bold text-slate-800 mt-3">{file.subject}</h1>
            </div>
            <div className="flex gap-2">
                {isVerified && (
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                    <ShieldCheck size={14} /> Verified
                    </span>
                )}
            </div>
          </div>
          
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

          <div className="mt-8">
            <h4 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2 mb-4">
               <Paperclip size={18} /> Attachments
               {(isBoardMember || isPresident) && (
                <label className="ml-auto cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                  <PlusCircle size={14} /> Add New
                  <input type="file" multiple ref={attachmentInputRef} className="hidden" onChange={(e) => {
                      const files = e.target.files;
                      if (!files?.length) return;
                      const fd = new FormData();
                      Array.from(files).forEach(f => fd.append('attachments', f));
                      endpoints.files.addAttachment(id, fd).then(() => { toast.success("Added"); loadData(); });
                  }} />
                </label>
               )}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm bg-teal-50 p-3 rounded-lg border border-teal-100">
                <span className="font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded text-xs">PUC</span>
                <span className="flex-1 font-medium">{file.originalName}</span>
                <Download size={16} className="text-teal-500 cursor-pointer" onClick={() => handleDownload('puc', file.id)}/>
              </li>
              {file.attachments.map(att => (
                 <li key={att.id} className="flex items-center gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <span className="font-semibold text-slate-400 text-xs">REF</span>
                   <span className="flex-1">{att.name}</span>
                   {(isBoardMember || isPresident) && <Trash2 size={16} className="text-red-400 cursor-pointer mr-2" onClick={() => handleRemoveAttachment(att.id)}/>}
                   <Download size={16} className="text-slate-400 cursor-pointer" onClick={() => handleDownload('attachment', att.id)}/>
                 </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 🟢 STEP 1: VERIFICATION CARD */}
        {requiresVerification && (
            <div className="bg-orange-50 p-8 rounded-2xl border-2 border-orange-100 shadow-md animate-fade-in-up">
                <h3 className="text-xl font-bold text-orange-800 flex items-center gap-2 mb-2">
                    <ShieldCheck size={24} /> Step 1: Verification Required
                </h3>
                
                {/* 🔴 NEW: Check if PIN is set */}
                {!isPinSet ? (
                    <div className="bg-white p-6 rounded-xl border border-orange-200 text-center mt-4">
                        <ShieldAlert size={32} className="mx-auto text-orange-500 mb-2"/>
                        <h4 className="font-bold text-slate-800 mb-1">Security PIN Not Set</h4>
                        <p className="text-sm text-slate-600 mb-4">You must set up your 4-digit Security PIN before you can verify files.</p>
                        <button 
                            onClick={() => navigate('/auth/set-pin')}
                            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-orange-700 transition-all text-sm"
                        >
                            Set PIN Now
                        </button>
                    </div>
                ) : (
                    // PIN IS SET: Show Verification Logic
                    <>
                        <p className="text-sm text-orange-700 mb-6">
                            You must digitally verify this file before you can forward it.
                        </p>

                        {!showPinInput ? (
                            <button 
                                onClick={() => setShowPinInput(true)}
                                className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex items-center gap-2"
                            >
                                <ShieldCheck size={18} /> Verify File Now
                            </button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-2">
                                <div className="w-full sm:w-48">
                                    <label className="block text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">
                                        <KeyRound size={14} className="inline mr-1"/> Enter PIN
                                    </label>
                                    <input 
                                        type="password" 
                                        ref={pinRef}
                                        placeholder="••••"
                                        maxLength={4}
                                        className="w-full border-2 border-orange-300 p-3 rounded-xl text-center text-lg tracking-[0.5em] focus:border-orange-600 focus:ring-0 outline-none bg-white font-bold"
                                    />
                                </div>
                                <button 
                                    onClick={handleVerify}
                                    disabled={isVerifying}
                                    className="bg-orange-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-orange-800 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isVerifying ? <Loader2 className="animate-spin" /> : "Confirm PIN"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        )}

        {/* 🟢 STEP 2: FORWARD ACTION CARD */}
        {!requiresVerification && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-teal-600 animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ArrowRight className="text-teal-600" /> Take Action
                    </h3>
                    {isVerified && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Verified & Ready
                        </span>
                    )}
                </div>

               <form onSubmit={handleSubmit(onForwardSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Recipient Search</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-teal-500" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Type name to search..." 
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {isSearching && <Loader2 className="absolute right-3 top-3.5 animate-spin text-teal-500" size={18}/>}
                        </div>
                        
                        {/* Custom Dropdown Results */}
                        <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-48 overflow-y-auto bg-white">
                            {users.length === 0 && searchTerm.length > 0 && !isSearching && <p className="p-3 text-sm text-slate-400 text-center">No users found</p>}
                            {users.length === 0 && searchTerm.length === 0 && <p className="p-3 text-xs text-slate-400 text-center bg-slate-50">Type above to find officials</p>}
                            
                            {users.filter(u => u.id !== user.id).map(u => (
                                <label key={u.id} className="flex items-center gap-3 p-3 hover:bg-teal-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                                    <input 
                                        type="radio" 
                                        value={u.id} 
                                        {...register('receiverId', { required: "Recipient is required" })}
                                        className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{u.full_name}</p>
                                        <p className="text-xs text-slate-500">{u.designation?.name || 'Staff'}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.receiverId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.receiverId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Remarks</label>
                        <textarea 
                            {...register('remarks', { required: "Remarks are required", minLength: { value: 3, message: "Too short" } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            rows="3"
                            placeholder="Add comments for the receiver..."
                        ></textarea>
                        {errors.remarks && <p className="text-red-500 text-xs mt-1 ml-1">{errors.remarks.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all flex justify-center gap-2 items-center disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? <Loader2 className="animate-spin"/> : <><Send size={18}/> Forward File</>}
                    </button>
                </form>
            </div>
        )}

      </div>

      {/* RIGHT COLUMN: Audit Trail */}
     <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-4 overflow-hidden max-h-[85vh] flex flex-col">
          
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="text-teal-600" size={20} /> History
            </h3>
            <span className="bg-white text-slate-500 px-2 py-1 rounded text-xs font-bold border border-slate-200">
              {history.length} Steps
            </span>
          </div>

          <div className="p-4 overflow-y-auto custom-scrollbar">
             {/* 🟢 RENDER THE NEW COMPONENT */}
             <FileMovementTimeline movements={history} />
          </div>

        </div>
      </div>
      </div>
  );
};

export default FileDetails;