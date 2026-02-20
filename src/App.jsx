import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react'; // Imported for the fallback loader

// Core/Shell components stay statically imported because they are needed immediately
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// --------------------------------------------------------
// Pages - Lazy Loaded (Code Splitting applied)
// --------------------------------------------------------
const Login = lazy(() => import('./pages/Auth/Login'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const SetPin = lazy(() => import('./pages/Auth/SetPin'));
const ChangePassword = lazy(() => import('./pages/Auth/ChangePassword'));
// const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));

const Inbox = lazy(() => import('./pages/Files/Inbox'));
const Outbox = lazy(() => import('./pages/Files/Outbox'));
const OutboxFileDetails = lazy(() => import('./pages/Files/OutboxFileDetails'));
const CreatedFiles = lazy(() => import('./pages/Files/CreatedFiles'));
const CreateFile = lazy(() => import('./pages/Files/CreateFile'));
const FileDetails = lazy(() => import('./pages/Files/FileDetails'));
const SearchFiles = lazy(() => import('./pages/Search/SearchFiles'));

const ManageUsers = lazy(() => import('./pages/Users/ManageUsers')); 
const CreateUser = lazy(() => import('./pages/Users/CreateUser'));
const EditUser = lazy(() => import('./pages/Users/EditUser')); 


// --------------------------------------------------------
// Components
// --------------------------------------------------------
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
      Initializing System...
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// Fallback UI to show while the requested page chunk is downloading
const LoadingFallback = () => (
  <div className="h-[80vh] flex items-center justify-center text-teal-600">
    <Loader2 className="animate-spin" size={40} />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
        
        {/* Suspense boundary catches any lazy-loaded component while it fetches */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} /> 
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="auth/change-password" element={<ChangePassword />}/>
              
              {/* Nested Routes */}
              <Route path="auth/set-pin" element={<SetPin />} />
              <Route path="files/inbox" element={<Inbox />} />
              <Route path="files/outbox" element={<Outbox />} />
              <Route path="files/outbox/:id" element={<OutboxFileDetails />} />
              <Route path="files/created" element={<CreatedFiles />} />
              <Route path="files/create" element={<CreateFile />} />
              <Route path="files/:id" element={<FileDetails />} />
              <Route path="search" element={<SearchFiles />} />
              
              <Route path="users" element={<ManageUsers />} />       
              <Route path="users/create" element={<CreateUser />} />
              <Route path="users/:id/edit" element={<EditUser />} />   
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;