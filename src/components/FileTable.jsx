import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Eye } from 'lucide-react';

const FileTable = ({ files, title, emptyMessage = "No files found" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">File Number</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 font-mono text-slate-600">{file.fileNumber}</td>
                <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate" title={file.subject}>
                  {file.subject}
                </td>
                <td className="px-6 py-4 text-slate-600">{file.type}</td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "px-2.5 py-1 rounded-full text-xs font-semibold",
                    file.priority === 'HIGH' ? "bg-red-100 text-red-700" : 
                    file.priority === 'MEDIUM' ? "bg-amber-100 text-amber-700" : 
                    "bg-green-100 text-green-700"
                  )}>{file.priority}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    file.status === 'APPROVED' ? "bg-green-100 text-green-800" :
                    file.status === 'REJECTED' ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  )}>
                    {file.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/files/${file.id}`} 
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Eye size={14} /> View
                  </Link>
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileTable;