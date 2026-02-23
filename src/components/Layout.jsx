import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Inbox, Send, Search, FilePlus, UserPlus, KeyRound, LogOut, Lock , Users, PenTool
} from 'lucide-react';
import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query'; // Added useQueryClient
import { io } from 'socket.io-client'; // Added Socket.IO
import toast from 'react-hot-toast'; // Added toast for notifications
const Layout = () => {

  const { user, logout } = useAuth();
  const location = useLocation();

  const queryClient = useQueryClient(); // Initialize QueryClient

  // --- NEW: Socket.IO Integration ---
  useEffect(() => {
    // Only connect if the user is authenticated
    if (!user) return;

    // Remove '/api/v1' to get the base server URL for Socket.IO
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    
    // Connect to Socket.IO
    const socket = io(baseUrl, {
      withCredentials: true, // Essential since your backend uses HTTP-only cookies
      query: { userId: user.id || user._id } // Pass user ID to backend to join user_${receiverId} room
    });

    socket.on('connect', () => {
      console.log('Connected to real-time notification service');
    });

    // Listen for the event emitted by workflow.service.js
    socket.on('new_file_received', (data) => {
      // 1. Show the notification to the user
      toast.success(
        `New File Received!\nFile No: ${data?.fileNumber || 'Check your inbox'}`, 
        { duration: 5000 }
      );
      
      // 2. Silently background-refresh the Inbox cache
      // This makes the new file appear instantly without refreshing the page
      queryClient.invalidateQueries({ queryKey: ['inboxFiles'] });
    });

    // Cleanup connection when the user logs out or leaves the system
    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);


  const navItems = [
    { label: 'Create File', path: '/files/create', icon: FilePlus },
    { label: 'Draft', path: '/files/created', icon: PenTool },
    { label: 'Inbox', path: '/files/inbox', icon: Inbox },
    { label: 'Sent Files', path: '/files/outbox', icon: Send },
    { label: 'Search Files', path: '/search', icon: Search },
    { label: 'Change Password', path: '/auth/change-password', icon: Lock }
  ];

  if (user?.systemRole === 'ADMIN') {
    navItems.push({ label: 'Register User', path: '/users/create', icon: UserPlus });
  }
   if (user?.systemRole === 'ADMIN' || user.designation === 'PRESIDENT') {
    navItems.push({ label: 'Manage Users', path: '/users', icon: Users });
  }

  navItems.push({ label: 'Set PIN', path: '/auth/set-pin', icon: KeyRound });

  return (
    // 🟢 1. WRAPPER: Added print:bg-white and print:h-auto
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white print:min-h-0 print:h-auto print:block">
      
      {/* 🟢 2. SIDEBAR: Added print:hidden to completely remove it when printing */}
      <aside className="w-64 flex flex-col h-screen fixed left-0 top-0 z-10 bg-slate-900 text-white shadow-xl print:hidden">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wide text-white">
            e-Office
          </h1>
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
                    ? "bg-teal-600 text-white shadow-md shadow-teal-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white" 
                )}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-slate-800 border border-slate-700/50">
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

      {/* 🟢 3. MAIN CONTENT: Added print:ml-0 (removes sidebar gap), print:p-0, print:h-auto, print:overflow-visible */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen print:ml-0 print:p-0 print:h-auto print:overflow-visible print:block">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;