import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { endpoints } from '../../api/axios'; 
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Paperclip, ArrowRight, History, User, Download, 
  Upload, Trash2, PlusCircle, PenTool, Building2, Briefcase, 
  Loader2, ShieldCheck, CheckCircle2, Lock, KeyRound, AlertTriangle
} from 'lucide-react';

const FileDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  const attachmentInputRef = useRef(null); 
  
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]); 
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { isSubmitting } 
  } = useForm({
    defaultValues: { action: 'FORWARD', receiverId: '' }
  });
  const selectedAction = watch("action");

  const { 
    register: registerVerify, 
    handleSubmit: handleSubmitVerify,
    formState: { isSubmitting: isVerifying }
  } = useForm();

  // Helper
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

  // --- ROLE & STATE LOGIC ---
  const userDesignation = getDesignationName(user?.designation);
  const isPresident = userDesignation === 'PRESIDENT'; 
  const isBoardMember = user?.systemRole === 'BOARD_MEMBER' || user?.systemRole === 'ADMIN';
  const isStaff = user?.systemRole === 'STAFF'; 
  
  // 🟢 NEW: Check if PIN is set
  const isPinSet = user?.isPinSet; 

  // Derived States
  const hasSignedDoc = data?.file?.signedDocUrl;
  const isVerified = data?.file?.isVerified;

  const showUploadStep = isPresident && !hasSignedDoc;
  const showVerifyStep = (isBoardMember || isPresident) && !isVerified && !showUploadStep;
  const showActionStep = !showUploadStep && !showVerifyStep;

  // --- HANDLERS ---
  const onVerifySubmit = async (formData) => {
    try {
      const payload = {
        action: 'VERIFY',
        remarks: 'Verified by Official',
        pin: formData.pin
      };
      await endpoints.workflow.move(id, payload);
      toast.success('File Verified Successfully');
      loadData(); 
    } catch (e) {
      toast.error(e.response?.data?.message || "Verification Failed");
    }
  };

  const onMoveSubmit = async (formData) => {
    const recipientId = parseInt(formData.receiverId);
    
    if ((isBoardMember || isPresident) && !isVerified) {
       toast.error("Security Check Failed: File must be verified first.");
       return;
    }

    try {
      const payload = {
        receiverId: recipientId,
        action: formData.action,
        remarks: formData.remarks,
        pin: formData.pin
      };

      if (formData.action === 'REVERT') delete payload.receiverId;

      await endpoints.workflow.move(id, payload);
      toast.success('Action recorded successfully');
      navigate('/files/inbox');
    } catch (e) { 
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  const handleUploadSignedDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('signed_doc', file);
    const toastId = toast.loading('Uploading...');
    try { await endpoints.files.uploadSignedDoc(id, formData); toast.success('Uploaded', { id: toastId }); loadData(); } catch (err) { toast.error('Failed', { id: toastId }); }
  };

  const handleAddAttachment = async (e) => { /* ... */ };
  const handleDownload = async (type, identifier) => { 
    const toastId = toast.loading('Opening...');
    try {
      let response;
      if (type === 'puc') response = await endpoints.files.downloadPuc(identifier);
      else if (type === 'attachment') response = await endpoints.files.downloadAttachment(identifier);
      else if (type === 'signed') response = await endpoints.files.downloadSignedDoc(identifier);
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

  if (!data) return <div className="p-10 text-center text-teal-600 font-medium">Loading details...</div>;
  const { file, history } = data;

  const availableRecipients = users.filter(u => {
    if (u.id === user.id) return false;
    const uDesig = getDesignationName(u.designation);
    if (isStaff && uDesig === 'PRESIDENT') return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      
      {/* LEFT COLUMN */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* METADATA CARD (Same as before) */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-mono tracking-wide">{file.fileNumber}</span>
              <h1 className="text-2xl font-bold text-slate-800 mt-3">{file.subject}</h1>
            </div>
            <div className="flex gap-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                file.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                'bg-teal-100 text-teal-800 border border-teal-200'
                }`}>
                {file.status}
                </span>
                {file.isVerified && (
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
               {isBoardMember && (
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
              {file.signedDocUrl && (
                <li className="flex items-center gap-3 text-sm bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <span className="font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded text-xs">SIGNED</span>
                  <span className="flex-1 font-medium">Final Signed Copy.pdf</span>
                  <Download size={16} className="text-purple-500 cursor-pointer" onClick={() => handleDownload('signed', file.id)}/>
                </li>
              )}
              {file.attachments.map(att => (
                 <li key={att.id} className="flex items-center gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <span className="font-semibold text-slate-400 text-xs">REF</span>
                   <span className="flex-1">{att.name}</span>
                   {isBoardMember && <Trash2 size={16} className="text-red-400 cursor-pointer mr-2" onClick={() => handleRemoveAttachment(att.id)}/>}
                   <Download size={16} className="text-slate-400 cursor-pointer" onClick={() => handleDownload('attachment', att.id)}/>
                 </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- WORKFLOW STEP 1: UPLOAD --- */}
        {showUploadStep && (
          <div className="bg-gradient-to-r from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 shadow-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2 mb-3">
              <PenTool size={24} /> Step 1: Upload Signed Document
            </h3>
            <label className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 font-bold">
              <Upload size={20} /> Select & Upload PDF
              <input type="file" accept="application/pdf" ref={fileInputRef} className="hidden" onChange={handleUploadSignedDoc} />
            </label>
          </div>
        )}

        {/* --- WORKFLOW STEP 2: VERIFICATION --- */}
        {showVerifyStep && (
          <div className="bg-gradient-to-r from-emerald-50 to-white p-8 rounded-2xl border-2 border-emerald-100 shadow-md animate-fade-in-up">
            <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2 mb-3">
              <ShieldCheck size={24} /> Step {isPresident ? '2' : '1'}: Verification Required
            </h3>
            
            {/* 🔴 PIN CHECK */}
            {!isPinSet ? (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full text-amber-600"><AlertTriangle size={24}/></div>
                    <div className="flex-1">
                        <h4 className="font-bold text-amber-900">Security PIN Not Set</h4>
                        <p className="text-sm text-amber-700">You must set your 4-digit Security PIN to verify files.</p>
                    </div>
                    <Link to="/auth/set-pin" className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-700 flex items-center gap-2">
                        <KeyRound size={16}/> Set PIN
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmitVerify(onVerifySubmit)} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-48">
                        <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Security PIN</label>
                        <input 
                        type="password" 
                        {...registerVerify("pin", { required: true, pattern: /^\d{4}$/ })} 
                        className="w-full border-2 border-emerald-200 p-3 rounded-xl text-center text-lg tracking-[0.5em] focus:border-emerald-500 focus:ring-0 outline-none bg-white"
                        placeholder="••••"
                        maxLength={4}
                        />
                    </div>
                    <button type="submit" disabled={isVerifying} className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2">
                        {isVerifying ? <Loader2 className="animate-spin" /> : <>Verify File <CheckCircle2 size={18}/></>}
                    </button>
                </form>
            )}
          </div>
        )}

        {/* --- WORKFLOW STEP 3: ACTIONS --- */}
        {showActionStep && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-teal-600 animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ArrowRight className="text-teal-600" /> Take Action</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified & Ready
                    </span>
                </div>

                <form onSubmit={handleSubmit(onMoveSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Action</label>
                        <select {...register("action", { required: true })} className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="FORWARD">Forward</option>
                        <option value="REVERT">Revert</option>
                        {(user.systemRole === 'ADMIN' || user.systemRole === 'BOARD_MEMBER') && (
                            <>
                            <option value="APPROVE">Approve</option>
                            <option value="REJECT">Reject</option>
                            </>
                        )}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Recipient</label>
                        <select {...register("receiverId", { required: true })} className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Select Official</option>
                        {availableRecipients.map(u => (
                            <option key={u.id} value={u.id}>
                            {u.full_name} ({getDesignationName(u.designation) || 'Staff'})
                            </option>
                        ))}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                        <textarea {...register("remarks", { required: true })} rows="3" className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter comments..."></textarea>
                    </div>

                    {['APPROVE', 'REJECT'].includes(selectedAction) && (
                        <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-100">
                            {/* 🔴 PIN CHECK FOR ACTIONS */}
                            {!isPinSet ? (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-200 rounded-full text-amber-700"><AlertTriangle size={20}/></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900">Security PIN Required</p>
                                        <Link to="/auth/set-pin" className="text-xs text-amber-700 underline hover:text-amber-900">Set your PIN now</Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <label className="block text-sm font-bold text-amber-800 mb-2">Security PIN Required</label>
                                    <input type="password" {...register("pin", { required: "PIN required", pattern: /^\d{4}$/ })} className="w-full border border-amber-200 p-3 rounded-lg tracking-widest text-center text-lg" placeholder="Enter 4-digit PIN" maxLength={4} />
                                </>
                            )}
                        </div>
                    )}

                    <div className="col-span-2 pt-2">
                        <button type="submit" disabled={isSubmitting || (['APPROVE', 'REJECT'].includes(selectedAction) && !isPinSet)} className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-bold shadow-md shadow-teal-200 transition-all disabled:opacity-50 flex justify-center gap-2 items-center">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm & Submit'}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {!showUploadStep && !showVerifyStep && !showActionStep && !isStaff && (
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-500 flex flex-col items-center gap-2">
                 <Lock size={24} className="opacity-50"/>
                 <span className="text-sm">You cannot take action on this file at this time.</span>
             </div>
        )}

      </div>

      {/* RIGHT COLUMN (Audit) */}
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