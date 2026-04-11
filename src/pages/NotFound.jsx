import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle size={48} />
      </div>
      <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-700 mb-4">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        The page you are looking for doesn't exist, has been moved, or you don't have permission to view it.
      </p>
      <Link 
        to="/files/inbox" 
        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-teal-200"
      >
        Return to Inbox
      </Link>
    </div>
  );
};

export default NotFound;