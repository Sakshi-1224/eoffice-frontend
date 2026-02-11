import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, FilePlus, Inbox, Send, Search, 
  Settings, LogOut, ShieldCheck, FileText 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // 🟢 HELPER: Check Roles
  const isStaff = user?.systemRole === 'STAFF';
  const isAdmin = user?.systemRole === 'ADMIN';
  const isBoardMember = user?.systemRole === 'BOARD_MEMBER';
const canCreateFiles = isStaff || isAdmin || isBoardMember;
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">e-Office</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Maharashtra Mandal Raipur</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
    
        {/* <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'hover:bg-slate-800 hover:text-white'}`}>
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </Link> */}

       {/* 🟢 UPDATE: Show 'Created Files' to Board Members too */}
        {canCreateFiles && (
          <Link to="/files/created" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/files/created') ? 'bg-teal-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FileText size={20} />
            <span className="font-medium">Created Files</span>
          </Link>
        )}

        <Link to="/files/inbox" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/files/inbox') ? 'bg-teal-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Inbox size={20} />
          <span className="font-medium">Inbox</span>
        </Link>

        <Link to="/files/outbox" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/files/outbox') ? 'bg-teal-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Send size={20} />
          <span className="font-medium">Outbox</span>
        </Link>

        {/* SEARCH */}
        <Link to="/files/search" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/files/search') ? 'bg-teal-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Search size={20} />
          <span className="font-medium">Search Files</span>
        </Link>

        <div className="my-4 border-t border-slate-800 mx-4"></div>

        <Link to="/auth/change-password" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/auth/change-password') ? 'bg-teal-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
          <Settings size={20} />
          <span className="font-medium">Change Password</span>
        </Link>

       {/* 🟢 UPDATE: Show 'Initiate File' to Board Members too */}
        {canCreateFiles && (
          <Link to="/files/create" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 ${isActive('/files/create') ? 'bg-teal-600 text-white shadow-lg' : 'text-teal-400 hover:bg-slate-800 hover:text-teal-300'}`}>
            <FilePlus size={20} />
            <span className="font-medium">Initiate File</span>
          </Link>
        )}

        {/* Set PIN (For Board Members & Admins) */}
        {(isBoardMember || isAdmin) && (
          <Link to="/auth/set-pin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/auth/set-pin') ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <ShieldCheck size={20} />
            <span className="font-medium">Set PIN</span>
          </Link>
        )}

      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.fullName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.designation || 'Staff'}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full mt-3 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 py-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;