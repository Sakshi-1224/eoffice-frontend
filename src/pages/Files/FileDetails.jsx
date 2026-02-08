import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../api/axios'; 
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  Paperclip, ArrowRight, History, User, Download, FileText, 
  Upload, Trash2, PlusCircle, PenTool, Building2, Briefcase, 
  Loader2, ShieldCheck, Lock, AlertTriangle 
} from 'lucide-react';

const FileDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  const attachmentInputRef = useRef(null); 
  
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]); 
  
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    defaultValues: { action: 'FORWARD', receiverId: '' }
  });
  const selectedAction = watch("action");

  // Fetch Data
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

  // --- ACTIONS ---

  const onMove = async (formData) => {
    // 1. Identify the Recipient
    const recipientId = parseInt(formData.receiverId);
    const targetUser = users.find(u => u.id === recipientId);

    // 2. VERIFICATION LOGIC: Check if sending to PRESIDENT
    if (targetUser?.designation?.name === 'PRESIDENT') {
      const isConfirmed = window.confirm(
        "⚠️ CRITICAL ACTION: SENDING TO PRESIDENT\n\n" +
        "You are about to forward this file to the President for final approval/signature.\n" +
        "• Have you verified all attachments?\n" +
        "• Is the Note Sheet complete?\n\n" +
        "Click OK to proceed or Cancel to review."
      );
      
      // Stop if user cancels
      if (!isConfirmed) return; 
    }

    try {
      const payload = {
        receiverId: recipientId,
        action: formData.action,
        remarks: formData.remarks,
        pin: formData.pin
      };
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

    const toastId = toast.loading('Uploading signed copy...');
    try {
      await endpoints.files.uploadSignedDoc(id, formData);
      toast.success('Signed document uploaded', { id: toastId });
      loadData(); 
    } catch (err) {
      toast.error('Upload failed', { id: toastId });
    }
  };

  const handleAddAttachment = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('attachments', f));

    const toastId = toast.loading('Adding attachments...');
    try {
      await endpoints.files.addAttachment(id, formData);
      toast.success('Attachments added', { id: toastId });
      loadData(); 
    } catch (err) {
      toast.error('Failed to add attachments', { id: toastId });
    }
  };

  const handleRemoveAttachment = async (attId) => {
    if(!confirm("Are you sure you want to remove this attachment?")) return;
    try {
      await endpoints.files.removeAttachment(attId);
      toast.success('Attachment removed');
      loadData();
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const handleDownload = async (type, identifier) => {
    const toastId = toast.loading('Opening...');
    try {
      let response;
      if (type === 'puc') response = await endpoints.files.downloadPuc(identifier);
      else if (type === 'attachment') response = await endpoints.files.downloadAttachment(identifier);
      else if (type === 'signed') response = await endpoints.files.downloadSignedDoc(identifier);

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Done', { id: toastId });
    } catch (err) {
      toast.error('Download failed', { id: toastId });
    }
  };

  if (!data) return <div className="p-10 text-center text-teal-600 font-medium">Loading details...</div>;
  const { file, history } = data;
  
  const isBoardMember = user.systemRole === 'BOARD_MEMBER' || user.systemRole === 'ADMIN';
  const isPresident = user.designation?.name === 'PRESIDENT'; 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      
      <div className="lg:col-span-2 space-y-6">
        {/* File Metadata Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-mono tracking-wide">{file.fileNumber}</span>
              <h1 className="text-2xl font-bold text-slate-800 mt-3">{file.subject}</h1>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
              file.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
              file.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-teal-100 text-teal-800 border border-teal-200'
            }`}>
              {file.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <p><span className="font-semibold text-slate-800 block mb-1">Type</span> {file.type}</p>
            <p><span className="font-semibold text-slate-800 block mb-1">Priority</span> {file.priority}</p>
            <p><span className="font-semibold text-slate-800 block mb-1">Initiator</span> {file.createdBy}</p>
            
            <div className="col-span-2 border-t border-slate-200 mt-2 pt-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Currently With</p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-teal-600"/> <span className="font-medium text-slate-800">{file.currentHolder}</span>
                    </div>
                    {file.currentPosition && (
                      <>
                        <div className="flex items-center gap-2">
                            <Briefcase size={14} className="text-teal-600"/> <span className="text-slate-700">{file.currentPosition.designation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-teal-600"/> <span className="text-slate-700">{file.currentPosition.department}</span>
                        </div>
                      </>
                    )}
                </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Paperclip size={18} className="text-teal-600" /> Attachments
              </h4>
              {isBoardMember && (
                <label className="cursor-pointer text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                  <PlusCircle size={14} /> Add New
                  <input type="file" multiple ref={attachmentInputRef} className="hidden" onChange={handleAddAttachment} />
                </label>
              )}
            </div>

            <ul className="space-y-3">
              {/* PUC */}
              <li className="flex items-center gap-3 text-sm bg-teal-50 p-3 rounded-lg border border-teal-100">
                <span className="font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded text-xs">PUC</span>
                <button onClick={() => handleDownload('puc', file.id)} className="hover:underline flex-1 text-left font-medium">{file.originalName}</button>
                <Download size={16} className="text-teal-500 cursor-pointer" onClick={() => handleDownload('puc', file.id)}/>
              </li>

              {/* Signed Doc */}
              {file.signedDocUrl && (
                <li className="flex items-center gap-3 text-sm bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <span className="font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded text-xs">SIGNED</span>
                  <button onClick={() => handleDownload('signed', file.id)} className="hover:underline flex-1 text-left font-medium">Final Signed Copy.pdf</button>
                  {isPresident ? (
                    <Download size={16} className="text-purple-500 cursor-pointer" onClick={() => handleDownload('signed', file.id)}/>
                  ) : (
                    <Lock size={14} className="text-slate-400" />
                  )}
                </li>
              )}

              {/* Attachments */}
              {file.attachments.map(att => (
                 <li key={att.id} className="flex items-center gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <span className="font-semibold text-slate-400 text-xs">REF</span>
                   <button onClick={() => handleDownload('attachment', att.id)} className="hover:underline flex-1 text-left">{att.name}</button>
                   
                   {isBoardMember && (
                     <button onClick={() => handleRemoveAttachment(att.id)} className="text-red-400 hover:text-red-600 mr-2" title="Remove">
                       <Trash2 size={16} />
                     </button>
                   )}
                   <Download size={16} className="text-slate-400 cursor-pointer" onClick={() => handleDownload('attachment', att.id)}/>
                 </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Upload Signed Doc */}
        {isPresident && !file.signedDocUrl && (
          <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm">
            <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2 mb-2">
              <PenTool size={20} /> President's Action
            </h3>
            <p className="text-sm text-purple-700 mb-4">Upload the final signed copy of the document to complete the process.</p>
            <label className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
              <Upload size={18} /> Upload Signed PDF
              <input type="file" accept="application/pdf" ref={fileInputRef} className="hidden" onChange={handleUploadSignedDoc} />
            </label>
          </div>
        )}

        {/* Workflow Action Panel */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-teal-600">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ArrowRight className="text-teal-600" /> Take Action
            </h3>
            
            <form onSubmit={handleSubmit(onMove)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Action</label>
                <select {...register("action", { required: true })} className="w-full border p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none">
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
                <select {...register("receiverId", { required: true })} className="w-full border p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none">
                  <option value="">Select Official</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.designation?.name || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                <textarea 
                  {...register("remarks", { required: true })} 
                  rows="3" 
                  className="w-full border p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter comments for the audit trail..."
                ></textarea>
              </div>

              {['APPROVE', 'REJECT'].includes(selectedAction) && (
                <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-100 animate-fade-in-up">
                  <label className="block text-sm font-bold text-amber-800 mb-2">Security PIN Required</label>
                  <input 
                    type="password" 
                    {...register("pin", { required: "PIN is required for this action", pattern: /^\d{4}$/ })} 
                    className="w-full border border-amber-200 p-3 rounded-lg tracking-widest text-center text-lg" 
                    placeholder="Enter 4-digit PIN" 
                    maxLength={4}
                  />
                  <p className="text-xs text-amber-600 mt-2 text-center">
                    Enter your 4-digit security PIN to confirm this decision.
                  </p>
                </div>
              )}

              <div className="col-span-2 pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-bold shadow-md shadow-teal-200 transition-all disabled:opacity-50 flex justify-center gap-2 items-center">
                   {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm & Submit'}
                </button>
              </div>
            </form>
        </div>
      </div>

      {/* Sidebar: Audit Trail */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-4 overflow-hidden">
          <div className="bg-teal-600 p-4 border-b border-teal-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="text-teal-200" /> Audit Trail
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
                    {item.to !== 'System' && (
                        <div className="flex items-center gap-1 font-medium"><User size={12} /> {item.to}</div>
                    )}
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