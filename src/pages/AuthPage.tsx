import React, { useState } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { Form, Input, Button, message } from 'antd';
import { Mail, Lock, User, Sparkles, ArrowLeft, KeyRound, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/axiosClient';
import { LoginRequest, GoogleLoginRequest } from '../types';

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

import mascotBlue from '../assets/mascot_blue.png'; 
import mascotRed from '../assets/mascot_red.png';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

// Thêm trạng thái VERIFY_ACCOUNT vào danh sách
type AuthView = 'LOGIN' | 'FORGOT_PASSWORD' | 'VERIFY_OTP' | 'VERIFY_ACCOUNT';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('LOGIN');
  const [emailRecovery, setEmailRecovery] = useState(''); // Email dùng chung cho cả Quên pass và Active tk
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputStyle = "h-12 bg-gray-50 border border-gray-200 focus:border-blue-400 focus:bg-white transition-all duration-300 rounded-xl text-sm px-4";
  const iconStyle = "text-gray-400 mr-2";
  const transition = { type: 'spring', stiffness: 200, damping: 25 } as const;

  // --- CÁC HÀM XỬ LÝ API ---

  // 1. Đăng nhập
  const onFinishLogin = async (values: LoginRequest) => {
    setLoading(true);
    try {
      const response: any = await authApi.login({
        ...values,
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

  // 2. Đăng ký (Quan trọng: Sửa logic chuyển hướng)
  const onFinishRegister = async (values: any) => {
    setLoading(true);
    try {
      const response: any = await authApi.register(values);
      if (response.code === 1000) {
        message.success('Đăng ký thành công! Mã OTP đã gửi về email.');
        
        // Lưu email để dùng ở bước sau
        setEmailRecovery(values.email);
        
        // 1. Trượt Panel về bên Login (Xanh)
        setIsLogin(true); 
        
        // 2. Chuyển nội dung form sang màn hình nhập OTP Kích hoạt
        setAuthView('VERIFY_ACCOUNT');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // 3. Kích hoạt tài khoản (Sau khi đăng ký)
  const onVerifyAccount = async (values: any) => {
    setLoading(true);
    try {
      await authApi.verifyAccount({
        email: emailRecovery,
        code: values.otp
      });
      message.success('Kích hoạt tài khoản thành công! Bạn có thể đăng nhập.');
      setAuthView('LOGIN'); // Quay về form đăng nhập
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Mã xác thực không đúng');
    } finally {
      setLoading(false);
    }
  };

  // 4. Gửi lại mã (Dùng chung cho cả 2 trường hợp)
  const handleResendCode = async () => {
    if(!emailRecovery) return message.error("Không tìm thấy email");
    setLoading(true);
    try {
      await authApi.resendCode(emailRecovery);
      message.success('Đã gửi lại mã mới!');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gửi lại thất bại');
    } finally {
      setLoading(false);
    }
  };

  // 5. Quên mật khẩu - Bước 1: Gửi mã
  const onSendForgotPassword = async (values: any) => {
      setLoading(true);
      try {
          await authApi.forgotPassword({ email: values.email });
          setEmailRecovery(values.email);
          message.success('Mã xác thực đã được gửi!');
          setAuthView('VERIFY_OTP'); // Chuyển sang nhập OTP + Pass mới
      } catch (error: any) {
          message.error(error.response?.data?.message || 'Lỗi gửi mã');
      } finally { setLoading(false); }
  };

  // 6. Quên mật khẩu - Bước 2: Đổi pass
  const onResetPassword = async (values: any) => {
      setLoading(true);
      try {
          await authApi.resetPassword({
              email: emailRecovery,
              code: values.otp,
              newPassword: values.newPassword
          });
          message.success('Đổi mật khẩu thành công!');
          setAuthView('LOGIN');
      } catch (error: any) {
          message.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
      } finally { setLoading(false); }
  };

const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    // A. Mở popup đăng nhập Google của Firebase
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // B. Lấy ID Token từ Firebase (để gửi cho Backend verify)
    const idToken = await user.getIdToken();

    // C. Chuẩn bị dữ liệu gửi lên Backend
    const requestData: GoogleLoginRequest = {
      idToken: idToken,
      deviceId: "web-" + navigator.userAgent, // (Tùy chọn) Lấy thông tin trình duyệt
      deviceType: "WEB"
    };

    // D. Gọi API Backend
    const response: any = await authApi.googleLogin(requestData);

    if (response.code === 1000) {
      message.success('Đăng nhập Google thành công!');
      // Lưu token vào localStorage
      localStorage.setItem('token', response.result.token);
      // Chuyển hướng về trang chủ
      navigate('/');
    }
  } catch (error: any) {
    console.error("Google Login Error:", error);
    // Xử lý lỗi cụ thể
    if (error.code === 'auth/popup-closed-by-user') {
      message.warning('Bạn đã đóng cửa sổ đăng nhập.');
    } else {
      message.error(error.response?.data?.message || 'Lỗi đăng nhập Google');
    }
  } finally {
    setLoading(false);
  }
};

  // --- RENDER VIEWS ---

  // A. Màn hình Login
  const renderLoginView = () => (
    <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="w-full max-w-[340px]">
        <h3 className="font-bold text-lg text-gray-800 mb-1 flex items-center gap-2">Note App <Sparkles size={18} className="text-blue-600"/></h3>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">Welcome <span className="text-blue-600">Back</span></h1>
        
        <Form name="login" onFinish={onFinishLogin} layout="vertical" size="large" className="space-y-2">
            <Form.Item name="email" rules={[{ required: true, message: '' }, { type: 'email' }]}>
                <Input prefix={<Mail size={18} className={iconStyle} />} placeholder="Email" className={inputStyle} />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '' }]}>
                <Input.Password prefix={<Lock size={18} className={iconStyle} />} placeholder="Mật khẩu" className={inputStyle} />
            </Form.Item>
            <div className="flex justify-end mb-2">
                <span onClick={() => setAuthView('FORGOT_PASSWORD')} className="text-xs text-blue-600 cursor-pointer hover:underline font-medium">Quên mật khẩu?</span>
            </div>
            <Button type="primary" htmlType="submit" loading={loading} block className="h-12 bg-blue-600 font-bold rounded-xl shadow-lg shadow-blue-500/30 border-none animate-gradient-x">Log in</Button>
        </Form>
        <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative bg-white px-3 text-[10px] text-gray-400">OR</span>
        </div>
        <button onClick={handleGoogleLogin} type="button" className="w-full py-3 border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center text-sm font-medium transition-all">
            <GoogleIcon /> Sign in with Google
        </button>
        <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Chưa có tài khoản? <span onClick={() => setIsLogin(false)} className="text-blue-600 font-bold cursor-pointer hover:underline ml-1">Đăng ký ngay</span></p>
        </div>
    </motion.div>
  );

  // B. Màn hình Kích hoạt tài khoản (Mới)
  const renderVerifyAccountView = () => (
    <motion.div key="verify_account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full max-w-[340px]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kích hoạt tài khoản</h2>
        <p className="text-gray-500 text-xs mb-6">Mã OTP đã được gửi đến <b>{emailRecovery}</b></p>
        <Form onFinish={onVerifyAccount} layout="vertical">
            <Form.Item name="otp" rules={[{ required: true, len: 6, message: 'Nhập đủ 6 số' }]}>
                <Input prefix={<KeyRound size={18} className={iconStyle} />} placeholder="Nhập mã OTP 6 số" className={`${inputStyle} text-center tracking-widest font-bold text-lg`} maxLength={6} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className="h-12 bg-green-600 hover:bg-green-700 font-bold rounded-xl text-white shadow-lg">Kích hoạt ngay</Button>
        </Form>
        <div className="mt-4 flex justify-between items-center px-2">
            <Button type="text" icon={<ArrowLeft size={16}/>} onClick={() => setAuthView('LOGIN')} className="text-gray-500">Quay lại</Button>
            <Button type="text" icon={<RotateCcw size={16}/>} onClick={handleResendCode} loading={loading} className="text-blue-600 font-medium">Gửi lại mã</Button>
        </div>
    </motion.div>
  );

  // C. Màn hình Quên mật khẩu (Nhập Email)
  const renderForgotView = () => (
      <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full max-w-[340px]">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h2>
          <p className="text-gray-500 text-xs mb-6">Nhập email để nhận mã đặt lại mật khẩu.</p>
          <Form onFinish={onSendForgotPassword} layout="vertical">
              <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                  <Input prefix={<Mail size={18} className={iconStyle} />} placeholder="Email của bạn" className={inputStyle} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block className="h-12 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white shadow-lg">Gửi mã xác thực</Button>
          </Form>
          <div className="mt-4 text-center">
            <Button type="text" icon={<ArrowLeft size={16}/>} onClick={() => setAuthView('LOGIN')}>Quay lại Đăng nhập</Button>
          </div>
      </motion.div>
  );

  // D. Màn hình Reset Password (Nhập OTP + Pass mới)
  const renderResetPassView = () => (
    <motion.div key="reset_pass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full max-w-[340px]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h2>
        <p className="text-gray-500 text-xs mb-6">Mã OTP đã gửi đến {emailRecovery}</p>
        <Form onFinish={onResetPassword} layout="vertical">
            <Form.Item name="otp" rules={[{ required: true, len: 6 }]}>
                <Input prefix={<KeyRound size={18} className={iconStyle} />} placeholder="Mã OTP 6 số" className={`${inputStyle} text-center tracking-widest`} maxLength={6} />
            </Form.Item>
            <Form.Item name="newPassword" rules={[{ required: true, min: 6 }]}>
                <Input.Password prefix={<Lock size={18} className={iconStyle} />} placeholder="Mật khẩu mới" className={inputStyle} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className="h-12 bg-blue-600 font-bold rounded-xl text-white shadow-lg">Xác nhận đổi</Button>
        </Form>
        <div className="mt-4 flex justify-between px-2">
            <Button type="text" onClick={() => setAuthView('FORGOT_PASSWORD')}>Quay lại</Button>
            <Button type="text" onClick={handleResendCode} className="text-blue-600">Gửi lại mã</Button>
        </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden font-sans">
      
      {/* Background Layers */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-900 to-black animate-gradient-x transition-opacity duration-500 ease-in-out ${isLogin ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`absolute inset-0 bg-gradient-to-br from-red-600 via-rose-950 to-black animate-gradient-x transition-opacity duration-500 ease-in-out ${!isLogin ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-xl border border-white/60 w-full max-w-[1000px] h-[600px] rounded-[32px] shadow-2xl flex p-3">
        
        {/* --- KHU VỰC LOGIN & CÁC FORM CON (BÊN TRÁI) --- */}
        <div className="w-1/2 h-full relative z-10">
             <div className={`absolute inset-0 flex flex-col justify-center items-center p-8 sm:p-12 transition-opacity duration-500 ${isLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <AnimatePresence mode="wait">
                    {authView === 'LOGIN' && renderLoginView()}
                    {authView === 'VERIFY_ACCOUNT' && renderVerifyAccountView()} 
                    {authView === 'FORGOT_PASSWORD' && renderForgotView()}
                    {authView === 'VERIFY_OTP' && renderResetPassView()}
                </AnimatePresence>
             </div>
        </div>

        {/* --- FORM REGISTER (BÊN PHẢI) - Giữ nguyên --- */}
        <div className="w-1/2 h-full relative z-10">
             <AnimatePresence>
                {!isLogin && (
                    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex flex-col justify-center items-center p-8 sm:p-12">
                         <div className="w-full max-w-[340px]">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">Note App</h3>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">Create your <br/> <span className="text-red-600">Account</span></h1>
                            <p className="text-gray-400 text-xs mb-8">Join the revolution of productivity powered by AI</p>

                            <Form name="register" onFinish={onFinishRegister} layout="vertical" size="large" className="space-y-2">
                                <Form.Item name="fullName" className="mb-4" rules={[{ required: true, message: '' }]}>
                                    <Input prefix={<User size={18} className={iconStyle} />} placeholder="Full Name" className={inputStyle.replace('focus:border-blue-400', 'focus:border-red-400')} />
                                </Form.Item>
                                <Form.Item name="email" className="mb-4" rules={[{ required: true, message: '' }, { type: 'email', message: '' }]}>
                                    <Input prefix={<Mail size={18} className={iconStyle} />} placeholder="Email" className={inputStyle.replace('focus:border-blue-400', 'focus:border-red-400')} />
                                </Form.Item>
                                <Form.Item name="password" className="mb-6" rules={[{ required: true, message: '', min: 6 }]}>
                                    <Input.Password prefix={<Lock size={18} className={iconStyle} />} placeholder="Password" className={inputStyle.replace('focus:border-blue-400', 'focus:border-red-400')} />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block loading={loading} className="h-12 font-bold rounded-xl border-none text-white text-lg shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] transition-all bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-gradient-x">Sign Up</Button>
                                </Form.Item>
                            </Form>
                            
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500">Already have an account? <span onClick={() => setIsLogin(true)} className="text-red-600 font-bold cursor-pointer hover:underline ml-1">Login</span></p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* --- FLOATING GLIDING PANEL (Giữ nguyên) --- */}
        <motion.div
          className="absolute top-3 bottom-3 w-[calc(50%-12px)] z-20 overflow-hidden shadow-2xl rounded-[28px]"
          animate={{ left: isLogin ? 'calc(50% + 0px)' : '12px' }} 
          transition={transition}
        >
          <motion.div className="w-[200%] h-full flex" animate={{ x: isLogin ? '-50%' : '0%' }} transition={transition}>
            <div className="w-1/2 h-full relative bg-black flex items-center justify-center overflow-hidden">
               <img src={mascotRed} alt="Register Mascot" className="absolute inset-0 w-full h-full object-cover object-top" />
               <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-red-900/30 to-transparent"></div>
               <div className="absolute bottom-12 z-10 text-white text-center px-8 w-full">
                  <h3 className="text-3xl font-bold mb-3 drop-shadow-lg">Hello, Friend!</h3>
                  <p className="text-white/90 text-sm font-medium drop-shadow-md">Nhập thông tin cá nhân của bạn và bắt đầu hành trình.</p>
               </div>
            </div>
            <div className="w-1/2 h-full relative bg-black flex items-center justify-center overflow-hidden">
               <img src={mascotBlue} alt="Login Mascot" className="absolute inset-0 w-full h-full object-cover object-top" />
               <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/30 to-transparent"></div>
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