import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages - Structured imports
import Login from './pages/Auth/Login';
import SetPin from './pages/Auth/SetPin';
import Dashboard from './pages/Dashboard/Dashboard';
import Inbox from './pages/Files/Inbox';
import Outbox from './pages/Files/Outbox';
import CreateFile from './pages/Files/CreateFile';
import FileDetails from './pages/Files/FileDetails';
import SearchFiles from './pages/Search/SearchFiles';
import CreateUser from './pages/Users/CreateUser';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
      Initializing System...
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* Nested Routes */}
            <Route path="auth/set-pin" element={<SetPin />} />
            <Route path="files/inbox" element={<Inbox />} />
            <Route path="files/outbox" element={<Outbox />} />
            <Route path="files/create" element={<CreateFile />} />
            <Route path="files/:id" element={<FileDetails />} />
            <Route path="search" element={<SearchFiles />} />
            <Route path="users/create" element={<CreateUser />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;