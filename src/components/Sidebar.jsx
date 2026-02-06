import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Inbox, Send, Search, FilePlus, UserPlus, KeyRound, LogOut 
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Inbox', path: '/files/inbox', icon: Inbox },
    { label: 'Outbox', path: '/files/outbox', icon: Send },
    { label: 'Search Files', path: '/search', icon: Search },
  ];

  // Role-based links
  if (user?.systemRole !== 'ADMIN') {
    navItems.push({ label: 'Initiate File', path: '/files/create', icon: FilePlus });
  }
  
  if (user?.systemRole === 'ADMIN') {
    navItems.push({ label: 'Register User', path: '/users/create', icon: UserPlus });
  }

  // Hide PIN setting for President
  if (user?.designation !== 'PRESIDENT') {
    navItems.push({ label: 'Set PIN', path: '/auth/set-pin', icon: KeyRound });
  }

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-10 shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wide text-blue-400">e-Office</h1>
        <p className="text-xs text-slate-400 mt-1">Maharashtra Mandal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white shadow-md translate-x-1" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
            {user?.fullName?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.designation}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;