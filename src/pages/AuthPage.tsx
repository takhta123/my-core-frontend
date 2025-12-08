import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Input, Button, message } from 'antd';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { LoginRequest } from '../types';

import mascotBlue from '../assets/mascot_blue.png'; 
import mascotRed from '../assets/mascot_red.png';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const inputStyle = "h-12 bg-gray-50 border border-gray-200 focus:border-blue-400 focus:bg-white transition-all duration-300 rounded-xl text-sm px-4";
  const iconStyle = "text-gray-400 mr-2";

  const onFinishLogin = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response: any = await axiosClient.post('/auth/login', {
        email: values.email,
        password: values.password,
        deviceId: "web-" + navigator.userAgent,
        deviceType: "WEB"
      });

      if (response.code === 1000) {
        message.success('Đăng nhập thành công!');
        localStorage.setItem('token', response.result.token);
        navigate('/');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onFinishRegister = async (values: any) => {
    setLoading(true);
    try {
      const response: any = await axiosClient.post('/auth/register', {
        email: values.email,
        password: values.password,
        fullName: values.fullName
      });

      if (response.code === 1000) {
        message.success('Đăng ký thành công! Vui lòng kiểm tra email.');
        setIsLogin(true);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const transition = { type: 'spring', stiffness: 200, damping: 25 } as const;

  return (
// CONTAINER CHÍNH: relative để chứa các lớp background
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden font-sans">

{/* --- LAYER 1: LOGIN BACKGROUND (Xanh - Đen Đậm Đà) --- */}
      {/* from-blue-600: Xanh sáng | via-indigo-900: Xanh tím than đậm | to-black: Đen */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-blue-300 via-indigo-900 to-black animate-gradient-x transition-opacity duration-400 ease-in-out
          ${isLogin ? 'opacity-100' : 'opacity-0'}`} 
      ></div>

      {/* --- LAYER 2: REGISTER BACKGROUND (Đỏ - Đen) --- */}
      {/* Red-600 -> Rose-950 -> Black */}
      {/* Sử dụng Rose-950 để tạo độ sâu trước khi chuyển hẳn sang đen */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-red-600 via-rose-950 to-black animate-gradient-x transition-opacity duration-500 ease-in-out
          ${!isLogin ? 'opacity-100' : 'opacity-0'}`} 
      ></div>

      {/* --- PHẦN CARD CHÍNH (Nổi lên trên background) --- */}
      {/* Thêm z-10 để đảm bảo nó nằm trên 2 lớp nền kia */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl border border-white/60 w-full max-w-[1000px] h-[600px] rounded-[32px] shadow-2xl flex p-3">
        
        {/* --- FORM LOGIN (BÊN TRÁI) --- */}
        <div className="w-1/2 h-full relative z-10">
            <AnimatePresence>
                {isLogin && (
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex flex-col justify-center items-center p-8 sm:p-12"
                    >
                        <div className="w-full max-w-[340px]">
                            <h3 className="font-bold text-lg text-gray-800 mb-1 flex items-center gap-2">
                                Note App <Sparkles size={18} className="text-blue-500"/>
                            </h3>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                                Welcome to <br/> <span className="text-blue-500">Your Workspace</span>
                            </h1>
                            <p className="text-gray-400 text-xs mb-8">Access your notes, tasks, and ideas securely.</p>

                            <Form name="login" onFinish={onFinishLogin} layout="vertical" size="large" className="space-y-2">
                                <Form.Item name="email" className="mb-4" rules={[{ required: true, message: '' }, { type: 'email', message: '' }]}>
                                    <Input prefix={<Mail size={18} className={iconStyle} />} placeholder="Email" className={inputStyle} />
                                </Form.Item>
                                <Form.Item name="password" className="mb-6" rules={[{ required: true, message: '' }]}>
                                    <Input.Password prefix={<Lock size={18} className={iconStyle} />} placeholder="Password" className={inputStyle} />
                                </Form.Item>
                                <Form.Item>
                                    {/* --- 1. NÚT LOGIN (BLUE DYNAMIC GRADIENT) --- */}
                                    <Button type="primary" htmlType="submit" block loading={loading} 
                                        className="h-12 font-bold rounded-xl border-none text-white text-lg
                                        shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all
                                        bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 
                                        animate-gradient-x"
                                    >
                                        Log in
                                    </Button>
                                </Form.Item>
                            </Form>

                            <div className="relative my-6 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                <span className="relative bg-white px-3 text-[10px] text-gray-400 uppercase tracking-wider">Or continue with</span>
                            </div>

                            <button type="button" className="w-full py-3 border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center transition-colors text-sm text-gray-600 font-medium bg-white hover:shadow-sm">
                                <GoogleIcon /> Sign in with Google
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-400">
                                    Don't have an account? 
                                    <span onClick={() => setIsLogin(false)} className="text-blue-500 font-bold cursor-pointer hover:underline ml-1">Register</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* --- FORM REGISTER (BÊN PHẢI) --- */}
        <div className="w-1/2 h-full relative z-10">
             <AnimatePresence>
                {!isLogin && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex flex-col justify-center items-center p-8 sm:p-12"
                    >
                         <div className="w-full max-w-[340px]">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">Note App</h3>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                                Create your <br/> <span className="text-rose-500">Account</span>
                            </h1>
                            <p className="text-gray-400 text-xs mb-8">Join the revolution of productivity powered by AI</p>

                            <Form name="register" onFinish={onFinishRegister} layout="vertical" size="large" className="space-y-2">
                                <Form.Item name="fullName" className="mb-4" rules={[{ required: true, message: '' }]}>
                                    <Input prefix={<User size={18} className={iconStyle} />} placeholder="Full Name" className={inputStyle.replace('focus:border-blue-400', 'focus:border-rose-400')} />
                                </Form.Item>
                                <Form.Item name="email" className="mb-4" rules={[{ required: true, message: '' }, { type: 'email', message: '' }]}>
                                    <Input prefix={<Mail size={18} className={iconStyle} />} placeholder="Email" className={inputStyle.replace('focus:border-blue-400', 'focus:border-rose-400')} />
                                </Form.Item>
                                <Form.Item name="password" className="mb-6" rules={[{ required: true, message: '', min: 6 }]}>
                                    <Input.Password prefix={<Lock size={18} className={iconStyle} />} placeholder="Password" className={inputStyle.replace('focus:border-blue-400', 'focus:border-rose-400')} />
                                </Form.Item>
                                <Form.Item>
                                    {/* --- 2. NÚT REGISTER (ROSE DYNAMIC GRADIENT) --- */}
                                    <Button type="primary" htmlType="submit" block loading={loading} 
                                        className="h-12 font-bold rounded-xl border-none text-white text-lg
                                        shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.02] transition-all
                                        bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600
                                        animate-gradient-x"
                                    >
                                        Sign Up
                                    </Button>
                                </Form.Item>
                            </Form>
                            
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-400">
                                    Already have an account? 
                                    <span onClick={() => setIsLogin(true)} className="text-rose-500 font-bold cursor-pointer hover:underline ml-1">Login</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* --- FLOATING GLIDING PANEL (LỚP PHỦ TRƯỢT) --- */}
        <motion.div
          className="absolute top-3 bottom-3 w-[calc(50%-12px)] z-20 overflow-hidden shadow-2xl rounded-[28px]"
          animate={{ left: isLogin ? 'calc(50% + 0px)' : '12px' }} 
          transition={transition}
        >
          <motion.div 
            className="w-[200%] h-full flex" 
            animate={{ x: isLogin ? '-50%' : '0%' }}
            transition={transition}
          >
            
            {/* ẢNH ĐỎ (Register Mode) */}
            <div className="w-1/2 h-full relative bg-rose-50 flex items-center justify-center overflow-hidden">
               <img src={mascotRed} alt="Register Mascot" className="absolute inset-0 w-full h-full object-cover object-top" />
               
               {/* --- 3. LỚP PHỦ MỚI (RÕ ẢNH HƠN) --- */}
               {/* Chỉ phủ tối từ 1/3 dưới lên, giảm opacity xuống /80 và /0 */}
               <div className="absolute inset-0 bg-gradient-to-t from-rose-900/80 via-rose-900/20 to-transparent"></div>
               
               <div className="absolute bottom-12 z-10 text-white text-center px-8 w-full">
                  <h3 className="text-3xl font-bold mb-3 drop-shadow-lg">Hello, Friend!</h3>
                  <p className="text-white/90 text-sm font-medium drop-shadow-md">Nhập thông tin cá nhân của bạn và bắt đầu hành trình.</p>
               </div>
            </div>

            {/* ẢNH XANH (Login Mode) */}
            <div className="w-1/2 h-full relative bg-blue-50 flex items-center justify-center overflow-hidden">
               <img src={mascotBlue} alt="Login Mascot" className="absolute inset-0 w-full h-full object-cover object-top" />

               {/* --- 3. LỚP PHỦ MỚI (RÕ ẢNH HƠN) --- */}
               <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent"></div>

               <div className="absolute bottom-12 z-10 text-white text-center px-8 w-full">
                  <h3 className="text-3xl font-bold mb-3 drop-shadow-lg">Welcome Back!</h3>
                  <p className="text-white/90 text-sm font-medium drop-shadow-md">Để giữ kết nối với chúng tôi, vui lòng đăng nhập ngay.</p>
               </div>
            </div>

          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default AuthPage;