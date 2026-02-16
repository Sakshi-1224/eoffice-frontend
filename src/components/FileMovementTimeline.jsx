import React from 'react';
import { 
  FilePlus, 
  Send, 
  ShieldCheck, 
  User, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

const FileMovementTimeline = ({ movements = [] }) => {
  if (!movements || movements.length === 0) {
    return <div className="text-slate-400 text-sm p-4 text-center">No movement history available.</div>;
  }

  // Helper to choose color and icon based on Action
  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATED':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: <FilePlus size={18} />
        };
      case 'VERIFY':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: <ShieldCheck size={18} />
        };
      case 'FORWARD':
        return {
          bg: 'bg-teal-100',
          border: 'border-teal-200',
          text: 'text-teal-700',
          icon: <Send size={18} />
        };
      default:
        return {
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          text: 'text-slate-700',
          icon: <CheckCircle2 size={18} />
        };
    }
  };

  return (
    <div className="relative pl-4 space-y-8 my-4">
      {/* Vertical Line */}
      <div className="absolute top-2 left-8 bottom-2 w-0.5 bg-slate-200 -z-10"></div>

      {movements.map((move, index) => {
        const style = getActionStyle(move.action);
        const isLatest = index === movements.length - 1;

        return (
          <div key={move.id || index} className="relative flex gap-4 animate-fade-in-up">
            {/* 1. Timeline Icon Node */}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-white ${style.border} ${style.text} ${isLatest ? 'ring-4 ring-slate-50' : ''}`}
            >
              {style.icon}
            </div>

            {/* 2. Content Card */}
            <div className={`flex-1 bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${isLatest ? 'border-teal-200 bg-teal-50/20' : 'border-slate-200'}`}>
              
              {/* Header: Action & Date */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${style.bg} ${style.text}`}>
                    {move.action}
                  </span>
                </div>
                <div className="flex items-center text-xs text-slate-400 font-mono gap-1">
                  <Clock size={12} />
                  {move.date}
                </div>
              </div>

              {/* Body: Movement Details */}
              <div className="text-sm text-slate-700 space-y-1">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-800">
                    {move.from}
                  </span>
                  <span className="text-slate-400 text-xs">
                    ({move.senderDesignation || 'System'})
                  </span>
                </div>

                {/* Arrow & Receiver (Only if it's a movement) */}
                {move.to && move.to !== 'System' && move.to !== move.from && (
                  <div className="flex items-center gap-2 pl-5 mt-1">
                    <div className="w-0.5 h-3 bg-slate-300"></div>
                    <span className="text-xs text-slate-500">Sent to</span>
                    <span className="font-medium text-slate-800">{move.to}</span>
                  </div>
                )}
              </div>

              {/* Remarks Section */}
              {move.remarks && (
                <div className="mt-3 pt-3 border-t border-slate-100/80">
                  <p className="text-sm text-slate-600 italic flex gap-2 items-start">
                    <span className="text-slate-300 text-lg leading-none">“</span>
                    {move.remarks}
                    <span className="text-slate-300 text-lg leading-none">”</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileMovementTimeline;