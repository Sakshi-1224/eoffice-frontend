import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Inbox, Send, Search, FilePlus, UserPlus, KeyRound, LogOut, Lock , Users, PenTool
} from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Created Files', path: '/files/created', icon: PenTool },
    { label: 'Inbox', path: '/files/inbox', icon: Inbox },
    { label: 'Outbox', path: '/files/outbox', icon: Send },
    { label: 'Search Files', path: '/search', icon: Search },
    { label: 'Change Password', path: '/auth/change-password', icon: Lock }
  ];

  
    navItems.push({ label: 'Initiate File', path: '/files/create', icon: FilePlus });
  
  
  if (user?.systemRole === 'ADMIN') {
    navItems.push({ label: 'Register User', path: '/users/create', icon: UserPlus });
    navItems.push({ label: 'Manage Users', path: '/users', icon: Users });
     
  }
  navItems.push({ label: 'Set PIN', path: '/auth/set-pin', icon: KeyRound });

  return (
    // MAIN CHANGE: Light Background for the whole app
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar: Dark Slate with Teal Accents */}
      {/* Fixed width to w-64 to match the margin-left of the main content */}
      <aside className="w-64 flex flex-col h-screen fixed left-0 top-0 z-10 bg-slate-900 text-white shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wide text-white">
            e-Office
          </h1>
          {/* Subtitle updated to Teal-400 for accent */}
          <p className="text-[10px] text-teal-400 uppercase tracking-wider mt-1">Maharashtra Mandal Raipur</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                    ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"  // Active State: Teal
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"  // Inactive: Slate
                )}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-slate-800 border border-slate-700/50">
            {/* User Avatar: Teal Background */}
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-teal-500">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate text-white">{user?.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate uppercase">{user?.designation}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors uppercase tracking-wider"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;