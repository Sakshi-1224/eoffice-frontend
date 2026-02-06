import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { endpoints } from '../../api/axios'; // Use the new endpoints file
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Paperclip, ArrowRight, History, User, Download, FileText, Building2, Briefcase } from 'lucide-react';

const FileDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]); 
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm();
  const selectedAction = watch("action");

  useEffect(() => {
    // Fetch History and User List for dropdown
    Promise.all([
      endpoints.files.history(id),
      endpoints.users.getAll() 
    ]).then(([historyRes, usersRes]) => {
      setData(historyRes.data.data);
      setUsers(usersRes.data.data);
    }).catch(err => {
      console.error(err);
      toast.error("Failed to load file details");
    });
  }, [id]);

  const onMove = async (formData) => {
    try {
      // Matches src/modules/workflow/dtos/request/MoveFileRequestDto.js
      const payload = {
        receiverId: parseInt(formData.receiverId),
        action: formData.action,
        remarks: formData.remarks,
        pin: formData.pin // Backend checks this for APPROVE/REJECT
      };

      await endpoints.workflow.move(id, payload);
      toast.success('Action recorded successfully');
      navigate('/files/inbox');
    } catch (e) { 
      toast.error(e.response?.data?.message || "Action failed");
    }
  };

  const handleDownload = (url) => {
    // Since backend returns a MinIO key/URL, we open it.
    // If it's a relative path, you might need to prepend your MinIO public URL.
    window.open(url, '_blank'); 
  };

  if (!data) return <div className="p-10 text-center text-teal-600 font-medium">Loading details...</div>;
  const { file, history } = data;
  
  // Logic: Can current user act on this?
  // Backend uses 'current_holder_id', DTO sends 'currentHolder' name.
  // Ideally, compare IDs if available, or rely on Inbox presence.
  const isHolder = file.currentHolder === user.fullName || user.systemRole === 'ADMIN'; 

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      {/* Main Content */}
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
            
            {/* New Fields from DTO */}
            <div className="col-span-2 border-t border-slate-200 mt-2 pt-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Currently With</p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-teal-600"/> <span className="font-medium text-slate-800">{file.currentHolder}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-teal-600"/> <span className="text-slate-700">{file.currentPosition?.designation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-teal-600"/> <span className="text-slate-700">{file.currentPosition?.department}</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="font-bold text-slate-700 flex items-center gap-2 mb-4 border-b pb-2">
              <Paperclip size={18} className="text-teal-600" /> Attachments
            </h4>
            <ul className="space-y-3">
              {/* PUC - Main File */}
              <li className="flex items-center gap-3 text-sm bg-teal-50 p-3 rounded-lg text-teal-800 border border-teal-100 transition-colors hover:bg-teal-100">
                <span className="font-bold bg-teal-200 text-teal-900 px-2 py-0.5 rounded text-xs">PUC</span>
                <FileText size={16} />
                <button 
                  onClick={() => handleDownload(file.pucUrl)}
                  className="hover:underline truncate flex-1 text-left font-medium focus:outline-none"
                >
                  {file.originalName}
                </button>
                <Download size={16} className="text-teal-500 hover:text-teal-700" />
              </li>

              {/* Attachments */}
              {file.attachments.map(att => (
                 <li key={att.id} className="flex items-center gap-3 text-sm bg-slate-50 p-3 rounded-lg text-slate-600 border border-slate-200 ml-4 transition-colors hover:bg-slate-100">
                   <span className="font-semibold text-slate-400 text-xs">REF</span>
                   <Paperclip size={16} />
                   <button 
                     onClick={() => handleDownload(att.url)}
                     className="hover:underline truncate flex-1 text-left focus:outline-none"
                   >
                     {att.name}
                   </button>
                   <Download size={16} className="text-slate-400 hover:text-slate-600" />
                 </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Panel - Only show if not Admin (unless doing override) and if file is Pending */}
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
                  {/* Logic: Only Board Members or Admins see Approve/Reject */}
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
                      {u.fullName} ({u.designation})
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
                <button type="submit" disabled={isSubmitting} className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-bold shadow-md shadow-teal-200 transition-all disabled:opacity-50 flex justify-center gap-2">
                   {isSubmitting && <Loader2 className="animate-spin" />} Confirm & Submit
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
                    <div className="flex items-center gap-1"><User size={12} /> {item.from} <span className="text-[10px] text-slate-400">({item.senderDesignation})</span></div>
                    {item.to !== 'System' && (
                      <>
                        <div className="pl-4 text-slate-400 text-[10px]">▼</div>
                        <div className="flex items-center gap-1 font-medium"><User size={12} /> {item.to} <span className="text-[10px] text-slate-400">({item.receiverDesignation})</span></div>
                      </>
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