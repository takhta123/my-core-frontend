import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import để chuyển trang

const AuthPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate(); // Hook để điều hướng

  const toggleMode = () => {
    setIsRegister(!isRegister);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- LOGIC ĐĂNG NHẬP GIẢ LẬP ---
    // 1. Lưu token giả vào LocalStorage để đánh lừa PrivateRoute
    localStorage.setItem('token', 'fake-jwt-token-123456');
    
    // 2. Chuyển hướng về trang chủ
    navigate('/');
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  const blueMascot = "https://images.unsplash.com/photo-1635314563604-5d55d78d4624?q=80&w=1000&auto=format&fit=crop"; 
  const redMascot = "https://images.unsplash.com/photo-1612404459571-cacf4514255f?q=80&w=1000&auto=format&fit=crop"; 

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 font-sans transition-colors duration-700 ease-in-out ${isRegister ? 'bg-gradient-to-br from-[#d946ef] to-[#db2777]' : 'bg-gradient-to-br from-[#0ea5e9] to-[#2563eb]'}`}>
      
      {/* Main Container */}
      <div className="bg-white rounded-[32px] shadow-2xl relative overflow-hidden w-full max-w-[1000px] min-h-[600px] flex">
        
        {/* --- LOGIN FORM (Left Side) --- */}
        <div 
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center p-12 transition-all duration-700 ease-in-out z-10 ${
            isRegister ? 'opacity-0 -translate-x-[20%]' : 'opacity-100 translate-x-0'
          }`}
        >
          <div className="w-full max-w-[340px]">
            <h3 className="font-display font-bold text-lg text-gray-800 mb-1">KawaiiKeep</h3>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 leading-tight">Welcome to <br/> KawaiiKeep</h1>
            <p className="text-gray-400 text-xs mb-8">Gaze and attention modeling powered by AI is optimizing note taking experiences</p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} strokeWidth={1.5} />
                 </div>
                 <input 
                   type="email" 
                   placeholder="hello@kawaii.studio" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-white border border-gray-200 text-sm px-11 py-3.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder-gray-300 text-gray-700"
                 />
              </div>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} strokeWidth={1.5} />
                 </div>
                 <input 
                   type={showPassword ? "text" : "password"}
                   placeholder="Password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-white border border-gray-200 text-sm px-11 py-3.5 rounded-xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder-gray-300 text-gray-700"
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                 >
                   {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                 </button>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-xl shadow-lg shadow-sky-200 transform active:scale-[0.98] transition-all text-sm"
              >
                Log in
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <span className="relative bg-white px-3 text-[10px] text-gray-400">or</span>
            </div>

            <button type="button" className="w-full py-3 border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center transition-colors text-sm text-gray-600 font-medium">
                <GoogleIcon />
                Sign in with Google
            </button>
            
            <div className="mt-6 text-center">
                 <p className="text-xs text-gray-400">Don't have an account? <button onClick={toggleMode} className="text-[#0ea5e9] font-bold hover:underline">Register</button></p>
            </div>
          </div>
        </div>

        {/* --- REGISTER FORM (Right Side) --- */}
        <div 
          className={`absolute top-0 right-0 h-full w-1/2 flex flex-col items-center justify-center p-12 transition-all duration-700 ease-in-out z-10 ${
            isRegister ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[20%]'
          }`}
        >
          <div className="w-full max-w-[340px]">
            <h3 className="font-display font-bold text-lg text-gray-800 mb-1">KawaiiKeep</h3>
            
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 leading-tight">Create your <br/> Account</h1>
            <p className="text-gray-400 text-xs mb-8">Join the cute revolution of productivity powered by AI</p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User size={18} strokeWidth={1.5} />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Full Name" 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full bg-white border border-gray-200 text-sm px-11 py-3.5 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder-gray-300 text-gray-700"
                 />
              </div>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} strokeWidth={1.5} />
                 </div>
                 <input 
                   type="email" 
                   placeholder="Email Address" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-white border border-gray-200 text-sm px-11 py-3.5 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder-gray-300 text-gray-700"
                 />
              </div>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} strokeWidth={1.5} />
                 </div>
                 <input 
                   type="password" 
                   placeholder="Password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-white border border-gray-200 text-sm px-11 py-3.5 rounded-xl outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder-gray-300 text-gray-700"
                 />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-xl shadow-lg shadow-sky-200 transform active:scale-[0.98] transition-all text-sm"
              >
                Sign Up
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <span className="relative bg-white px-3 text-[10px] text-gray-400">or</span>
            </div>

            <button type="button" className="w-full py-3 border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center transition-colors text-sm text-gray-600 font-medium">
                <GoogleIcon />
                Signup with Google
            </button>

            <div className="mt-6 text-center">
                 <p className="text-xs text-gray-400">Already have an account? <button onClick={toggleMode} className="text-[#0ea5e9] font-bold hover:underline">Login</button></p>
            </div>
          </div>
        </div>

        {/* --- IMAGE OVERLAY SLIDER --- */}
        <div 
          className={`absolute top-3 bottom-3 w-[calc(50%-12px)] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] z-20 rounded-[28px] ${
            isRegister ? 'left-3 translate-x-0' : 'left-full -translate-x-[calc(100%+12px)]'
          }`}
        >
           <div className="relative w-full h-full bg-gray-900 rounded-[28px] overflow-hidden">
             
             {/* Blue Theme Image */}
             <div className={`absolute inset-0 transition-opacity duration-700 ${isRegister ? 'opacity-0' : 'opacity-100'}`}>
                 <img 
                   src={blueMascot} 
                   alt="Blue Theme" 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay"></div>
                 <div className="absolute top-1/4 right-10 w-20 h-20 bg-blue-400 rounded-full blur-[50px] opacity-60"></div>
             </div>

             {/* Red Theme Image */}
             <div className={`absolute inset-0 transition-opacity duration-700 ${isRegister ? 'opacity-100' : 'opacity-0'}`}>
                 <img 
                   src={redMascot} 
                   alt=" Red Theme" 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-pink-900/30 mix-blend-overlay"></div>
                 <div className="absolute bottom-1/4 left-10 w-24 h-24 bg-pink-500 rounded-full blur-[60px] opacity-60"></div>
             </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;