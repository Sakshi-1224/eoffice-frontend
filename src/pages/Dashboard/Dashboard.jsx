/*
import { useEffect, useState } from 'react';
import { endpoints } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, CheckCircle2, XCircle, Clock, ArrowUpRight, ArrowDownLeft, Loader2, PieChart as PieIcon
} from 'lucide-react';
// 1. Import the Chart Component 👇
import FileStatusChart from '../../components/Dashboard/FileStatusChart';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    endpoints.files.stats()
      .then(({ data }) => setStats(data.data))
      .catch(console.error);
  }, []);

  if (!stats) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="animate-spin text-teal-600" size={40} />
    </div>
  );

  const StatCard = ({ title, count, icon: Icon, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{count}</h3>
        </div>
        <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className={`mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden`}>
        <div className={`h-full ${colorClass.replace('text-', 'bg-')} w-3/4 rounded-full opacity-50`}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="text-teal-600 font-semibold">{user?.fullName}</span>
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Operational
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Files" count={stats.pending} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-50" />
        <StatCard title="Created Files" count={stats.created} icon={FileText} colorClass="text-teal-600" bgClass="bg-teal-50" />
        <StatCard title="Approved" count={stats.approved} icon={CheckCircle2} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
        <StatCard title="Rejected" count={stats.rejected} icon={XCircle} colorClass="text-rose-600" bgClass="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
//         {/* --- 2. UPDATED CHART SECTION --- */
//         <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col">
//            <div className="flex justify-between items-center mb-6">
//              <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
//                <PieIcon className="text-teal-500" size={20} /> File Status Distribution
//              </h3>
//              {/* Optional: Add a Year dropdown here later */}
//            </div>
           
//            {/* Chart Container */}
//            <div className="h-64 w-full bg-slate-50/50 rounded-lg border border-slate-100 p-2">
//              <FileStatusChart stats={stats} />
//            </div>
//         </div>
//         {/* ------------------------------- */}

//         {/* Side Panel */}
//         <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
//           <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
//             <ArrowDownLeft className="text-purple-500" size={20} /> Quick Actions
//           </h3>
//           <div className="space-y-3">
//              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors hover:border-teal-200 hover:text-teal-700">
//                Check Inbox for new files...
//              </div>
//              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors hover:border-teal-200 hover:text-teal-700">
//                Review pending approvals...
//              </div>
//              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors hover:border-teal-200 hover:text-teal-700">
//                Initiate urgent file...
//              </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
// */