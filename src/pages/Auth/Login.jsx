import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import logo from '../../assets/logo.png';
import banner from '../../assets/banner.jpg';
// Ideally, this should be a transparent PNG for the best look
const LOGO_URL = logo; 
const BANNER=banner;
const Login = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Direct login without Captcha check
    const success = await login(data);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001f5c] via-[#003d82] to-[#005bb5] flex flex-col items-center justify-center p-4 font-sans text-white">
      
      {/* --- LOGO SECTION (Clean, No Circle) --- */}
      <div className="absolute top-6 flex flex-col items-center animate-fade-in-down z-10">
        <img 
          src={LOGO_URL} 
          alt="Maharashtra Mandal Logo" 
          className="w-120 h-40 object-contain mb-4 drop-shadow-2xl" 
        />
      </div>
      {/* --------------------------------------- */}

      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white/5 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden mt-25 md:mt-20">
        
        {/* Left Side: Illustration */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-blue-900/80 to-transparent relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <img 
            src={BANNER}
            alt="Digital Workplace" 
            className="w-[430px] h-[360px]"
          />
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-[#1a2b4b] relative shadow-inner">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-slate-900 font-bold text-xl">eo</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">eOffice</h2>
                <p className="text-[10px] text-blue-300 uppercase tracking-wide">Digital Workplace Solution</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-6 border-l-4 border-green-500 pl-3">
            Secure Login
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="group">
              <label className="block text-xs font-medium text-white-300 mb-1.5 ml-1">LOGIN ID / PHONE</label>
              <input 
                {...register("phoneNumber", { required: true })}
                className="w-full bg-[#0f1a30] border border-blue-800/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-3.5 placeholder-white-700/50 shadow-inner"
                placeholder="Enter 10-digit number"
              />
            </div>
            
            <div className="group">
              <label className="block text-xs font-medium text-white-300 mb-1.5 ml-1">PASSWORD</label>
              <input 
                type="password"
                {...register("password", { required: true })}
                className="w-full bg-[#0f1a30] border border-blue-800/50 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-3.5 placeholder-white-700/50 shadow-inner"
                placeholder="Enter password"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full text-white font-bold py-3.5 rounded-lg shadow-lg flex justify-center items-center gap-2 mt-4 transition-all duration-200 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 hover:-translate-y-0.5 shadow-green-900/30"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : 'Access System'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-4">
            <p className="text-xs text-blue-400/60">
              © 2026 Maharashtra Mandal Raipur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;