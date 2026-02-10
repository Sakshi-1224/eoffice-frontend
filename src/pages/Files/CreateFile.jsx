import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { endpoints } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UploadCloud, FileCheck, Paperclip, Loader2, FilePlus, X, Trash2 } from 'lucide-react';

const CreateFile = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  // 🟢 STATE: Store accumulated attachments here
  const [attachments, setAttachments] = useState([]);

  // Watch PUC field just for previewing the name
  const pucFile = watch('puc');

  // 🟢 HANDLER: Append new files to existing list
  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
      
      // Reset input so you can select the same file again if needed
      e.target.value = ''; 
    }
  };

  // 🟢 HANDLER: Remove specific file
  const removeAttachment = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('priority', data.priority);
    formData.append('type', data.type);
    
    // 1. PUC (Main File - Single)
    if (data.puc && data.puc[0]) {
      formData.append('puc', data.puc[0]);
    }
    
    // 2. Attachments (From our Local State)
    if (attachments.length > 0) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    try {
      await endpoints.files.create(formData);
      toast.success('e-File initiated successfully!');
      navigate('/files/outbox');
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Failed to create file');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
          <FilePlus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Initiate New e-File</h2>
          <p className="text-sm text-slate-500">Fill in the details to start a new file movement.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        
        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Subject <span className="text-red-500">*</span></label>
          <input 
            {...register("subject", { required: "Subject is required", minLength: { value: 5, message: "Min 5 chars" } })} 
            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            placeholder="e.g. Budget Approval"
          />
          {errors.subject && <span className="text-xs text-red-500 mt-1 block">{errors.subject.message}</span>}
        </div>
        
        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
            <select {...register("priority")} className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">File Type</label>
            <select {...register("type")} className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none">
              <option value="GENERIC">Generic</option>
              <option value="FINANCIAL">Financial</option>
              <option value="POLICY">Policy</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea 
            {...register("description")} 
            rows="3" 
            className="w-full border border-slate-300 rounded-lg p-3 outline-none" 
            placeholder="Detailed description..."
          ></textarea>
        </div>

        {/* --- File Upload Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. PUC Upload (Standard Single File) */}
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${pucFile && pucFile.length > 0 ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:bg-slate-50'}`}>
            <UploadCloud className={`mx-auto h-10 w-10 mb-2 ${pucFile && pucFile.length > 0 ? 'text-teal-600' : 'text-slate-400'}`} />
            
            <label className="block text-sm font-medium text-slate-700 mb-1 cursor-pointer hover:text-teal-600">
              {pucFile && pucFile.length > 0 ? 'Change Main Document' : 'Upload Main Document (PUC) *'}
              <input 
                type="file" 
                accept="application/pdf" 
                {...register("puc", { required: "PUC file is mandatory" })} 
                className="hidden" 
              />
            </label>
            
            {pucFile && pucFile.length > 0 ? (
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-teal-800 font-medium bg-white py-1 px-3 rounded-full shadow-sm border border-teal-100">
                <FileCheck size={16} className="text-teal-600" />
                <span className="truncate max-w-[180px]">{pucFile[0].name}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">PDF only, max 10MB</p>
            )}
            {errors.puc && <span className="text-xs text-red-500 block mt-2">{errors.puc.message}</span>}
          </div>

          {/* 2. Attachments Upload (Fixed: Accumulates files) */}
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${attachments.length > 0 ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:bg-slate-50'}`}>
            <Paperclip className={`mx-auto h-10 w-10 mb-2 ${attachments.length > 0 ? 'text-teal-600' : 'text-slate-400'}`} />
            
            <label className="block text-sm font-medium text-slate-700 mb-1 cursor-pointer hover:text-teal-600">
              {attachments.length > 0 ? 'Add More Attachments' : 'Supporting Attachments'}
              <input 
                type="file" 
                multiple 
                onChange={handleAttachmentChange} 
                className="hidden" 
              />
            </label>

            {/* List of selected attachments with Remove button */}
            {attachments.length > 0 ? (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs text-teal-800 font-bold uppercase tracking-wider mb-1">
                  {attachments.length} Files Selected
                </p>
                <div className="max-h-32 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-teal-100 shadow-sm text-left group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCheck size={14} className="text-teal-500 shrink-0" />
                        <span className="text-xs text-slate-700 truncate max-w-[120px]" title={file.name}>{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Optional, Multiple files allowed</p>
            )}
          </div>

        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 font-semibold shadow-lg shadow-teal-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit File'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFile;