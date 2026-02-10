import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../api/axios'; 
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Paperclip, ArrowRight, History, User, Download, 
  Trash2, PlusCircle, Loader2, ShieldCheck, 
  CheckCircle2, Lock, Send, KeyRound, ShieldAlert
} from 'lucide-react';

const FileDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const attachmentInputRef = useRef(null); 
  
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  
  // UI Toggles
  const [showPinInput, setShowPinInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Forward Form
  const { 
    register, 
    handleSubmit, 
    formState: { isSubmitting, errors } 
  } = useForm({
    defaultValues: { action: 'FORWARD', receiverId: '' }
  });

  const pinRef = useRef(null);

  const getDesignationName = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val?.name || ''; 
  };

  const loadData = () => {
    Promise.all([
      endpoints.files.history(id),
      endpoints.users.getAll() 
    ]).then(([historyRes, usersRes]) => {
      setData(historyRes.data.data);
      setUsers(usersRes.data.data);
    }).catch(err => toast.error("Failed to load details"));
  };

  useEffect(() => { loadData(); }, [id]);

  if (!data) return <div className="p-10 text-center text-teal-600 font-medium">Loading details...</div>;
  const { file, history } = data;

  // --- ROLE & STATE LOGIC ---
  const isPresident = getDesignationName(user?.designation) === 'PRESIDENT'; 
  const isBoardMember = user?.systemRole === 'BOARD_MEMBER' || user?.systemRole === 'ADMIN';
  const isStaff = user?.systemRole === 'STAFF'; 

  const isDraft = file.status === 'DRAFT'; 
  const isVerified = file.isVerified;

  // 1. Board Members/President MUST verify (even if draft)
  const requiresVerification = (isBoardMember || isPresident) && !isVerified;

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
    try {
        await endpoints.workflow.move(id, {
            action: 'VERIFY',
            remarks: 'Verified via PIN',
            pin: pin
        });
        toast.success("Verification Successful!");
        setShowPinInput(false); 
        loadData(); 
    } catch (e) {
        toast.error(e.response?.data?.message || "Verification Failed");
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
      navigate('/files/inbox');
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
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100">
             <p><span className="font-semibold text-slate-800 block mb-1">Current Holder</span> {file.currentHolder}</p>
             <p><span className="font-semibold text-slate-800 block mb-1">Designation</span> {getDesignationName(file.currentPosition?.designation)}</p>
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

                <form onSubmit={handleSubmit(onForwardSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 hidden">
                        <select {...register("action")} disabled className="w-full"><option value="FORWARD">Forward</option></select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Recipient</label>
                        <select 
                            {...register("receiverId", { required: "Please select a recipient" })} 
                            className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
                        >
                        <option value="">Select Official</option>
                        {availableRecipients.map(u => (
                            <option key={u.id} value={u.id}>
                            {u.full_name} ({getDesignationName(u.designation) || 'Staff'})
                            </option>
                        ))}
                        </select>
                        {errors.receiverId && <p className="text-red-500 text-xs mt-1">{errors.receiverId.message}</p>}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                        <textarea 
                        {...register("remarks", { required: "Remarks are required" })} rows="3" 
                        className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter comments..."
                        ></textarea>
                        {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks.message}</p>}
                    </div>

                    <div className="col-span-2 pt-2">
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full bg-teal-600 text-white py-3.5 rounded-xl hover:bg-teal-700 font-bold shadow-md shadow-teal-200 transition-all disabled:opacity-50 flex justify-center gap-2 items-center"
                        >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (
                            <>
                                <Send size={18}/>
                                {isDraft ? "Initiate & Send" : "Forward File"}
                            </>
                        )}
                        </button>
                    </div>
                </form>
            </div>
        )}

      </div>

      {/* RIGHT COLUMN: Audit Trail */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-4 overflow-hidden">
          <div className="bg-teal-600 p-4 border-b border-teal-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><History className="text-teal-200" /> Audit Trail</h3>
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
                    {item.to !== 'System' && <div className="flex items-center gap-1 font-medium"><User size={12} /> {item.to}</div>}
                  </div>
                  {item.remarks && <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2 rounded border border-slate-100">"{item.remarks}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetails;