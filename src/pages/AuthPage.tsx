import React, { useState } from 'react';
import { motion, Transition } from 'framer-motion';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { LoginRequest } from '../types';
// Tìm dòng import từ 'lucide-react' và sửa thành:
import {
  Mail,       // Icon thư (cho email)
  Lock,       // Icon ổ khóa (cho password)
  User,       // Icon người (cho tên đăng nhập)
  ArrowRight, // (Đã có từ trước)
  Check,      // (Đã có từ trước)
  KeyRound    // Icon chìa khóa (cho code xác thực)
} from 'lucide-react';

import mascotBlue from '../assets/mascot_blue.png'; 
import mascotRed from '../assets/mascot_red.png';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Style chung cho tất cả ô Input:
// h-12: Tăng chiều cao lên 48px
// bg-gray-50: Màu nền xám nhẹ
// border-none: Bỏ viền mặc định
// rounded-xl: Bo góc mềm mại
// focus:ring-2: Hiệu ứng khi click vào
const inputStyle = "h-12 bg-gray-50 border-none hover:bg-gray-100 focus:bg-white transition-all duration-300 rounded-xl text-base";
const iconStyle = "text-gray-400 mr-1"; // Style cho icon bên trong
  

  // Xử lý Login
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

  // Xử lý Register
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

const transition: Transition = { type: 'spring', stiffness: 200, damping: 20 };

  return (
    <motion.div
      className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gray-50"
      animate={{
        background: isLogin 
          ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
          : 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)'
      }}
      transition={{ duration: 0.8 }}
    >
      {/* --- CẬP NHẬT Ở ĐÂY: Hiệu ứng Glassmorphism --- */}
      <div className="relative bg-white/80 backdrop-blur-md border border-white/50 w-[900px] h-[600px] rounded-3xl shadow-2xl overflow-hidden flex z-10">
        
        {/* --- FORM LOGIN --- */}
        <div className={`w-1/2 h-full flex flex-col justify-center items-center p-10 z-10 transition-opacity duration-500 ${isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8 text-sm">Đăng nhập để tiếp tục ghi chú</p>
          
          <Form name="login" onFinish={onFinishLogin} className="w-full max-w-xs" layout="vertical" size="large">
            <Form.Item name="email" rules={[{ required: true, message: 'Nhập email!' }, { type: 'email' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} className="bg-primary shadow-md hover:scale-105 transition-transform">
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="w-full max-w-xs">
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300/50"></div> {/* Làm mờ border kẻ ngang */}
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">Hoặc</span>
                <div className="flex-grow border-t border-gray-300/50"></div>
            </div>
            <Button icon={<GoogleOutlined />} block className="bg-white/50 border-gray-200">Đăng nhập bằng Google</Button>
            
            <p className="mt-6 text-center text-sm text-gray-500">
              Chưa có tài khoản? <span onClick={() => setIsLogin(false)} className="text-primary font-bold cursor-pointer hover:underline">Đăng ký ngay</span>
            </p>
          </div>
        </div>

        {/* --- FORM REGISTER --- */}
        <div className={`w-1/2 h-full flex flex-col justify-center items-center p-10 z-10 absolute right-0 transition-opacity duration-500 ${!isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
           <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
           <p className="text-gray-500 mb-8 text-sm">Tham gia cùng chúng tôi ngay hôm nay</p>

           <Form name="register" onFinish={onFinishRegister} className="w-full max-w-xs" layout="vertical" size="large">
             <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
               <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
             </Form.Item>
             <Form.Item name="email" rules={[{ required: true, message: 'Nhập email!' }, { type: 'email' }]}>
               <Input prefix={<MailOutlined />} placeholder="Email" />
             </Form.Item>
             <Form.Item name="password" rules={[{ required: true, message: 'Mật khẩu > 6 ký tự!', min: 6 }]}>
               <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
             </Form.Item>
             <Form.Item>
               <Button type="primary" htmlType="submit" block loading={loading} className="bg-primary shadow-md hover:scale-105 transition-transform">
                 Đăng Ký
               </Button>
             </Form.Item>
           </Form>

           <p className="mt-6 text-center text-sm text-gray-500">
            Đã có tài khoản? <span onClick={() => setIsLogin(true)} className="text-primary font-bold cursor-pointer hover:underline">Đăng nhập</span>
          </p>
        </div>

        {/* --- GLIDING PANEL (Giữ nguyên) --- */}
        <motion.div
          className="absolute top-0 left-0 w-1/2 h-full z-20 overflow-hidden shadow-2xl"
          initial={false}
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={transition}
        >
          <motion.div 
            className="w-[200%] h-full flex" 
            animate={{ x: isLogin ? '-50%' : '0%' }}
            transition={transition}
          >
            {/* PHẦN ĐỎ */}
            <div className="w-1/2 h-full relative bg-red-100 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-500 opacity-90"></div>
               <img src={mascotRed} alt="Register Mascot" className="relative z-10 w-full h-full object-cover object-top" />
               <div className="absolute bottom-10 z-10 text-white text-center px-4 w-full">
                  <h3 className="text-2xl font-bold mb-2">Hello, Friend!</h3>
                  <p className="text-white/90 text-sm">Nhập thông tin cá nhân của bạn và bắt đầu hành trình.</p>
               </div>
            </div>

            {/* PHẦN XANH */}
            <div className="w-1/2 h-full relative bg-blue-100 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 opacity-90"></div>
               <img src={mascotBlue} alt="Login Mascot" className="relative z-10 w-full h-full object-cover object-top" />
               <div className="absolute bottom-10 z-10 text-white text-center px-4 w-full">
                  <h3 className="text-2xl font-bold mb-2">Welcome Back!</h3>
                  <p className="text-white/90 text-sm">Để giữ kết nối với chúng tôi, vui lòng đăng nhập ngay.</p>
               </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AuthPage;