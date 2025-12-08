import React, { type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AuthPage from './pages/AuthPage';

// --- COMPONENT BẢO VỆ (PRIVATE ROUTE) ---
// Nhiệm vụ: Kiểm tra xem user có token chưa.
// Nếu có -> Cho vào trang con (children).
// Nếu không -> Đá về trang Login.
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    // 1. CẤU HÌNH THEME CHO TOÀN BỘ APP (ANT DESIGN)
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff', // Màu xanh dương chủ đạo (giống Tailwind)
          borderRadius: 8,         // Bo góc mềm mại cho nút bấm, input
          fontFamily: 'Inter, sans-serif', // Font chữ hiện đại (nếu bạn đã cài)
        },
        components: {
          Button: {
            controlHeightLG: 45, // Nút bấm to hơn một chút cho đẹp
            fontWeight: 600,
          },
          Input: {
            controlHeightLG: 45, // Ô nhập liệu to hơn
          }
        }
      }}
    >
      {/* 2. CẤU HÌNH ROUTER (ĐIỀU HƯỚNG) */}
      <BrowserRouter>
        <Routes>
          {/* Route Công khai: Đăng nhập & Đăng ký dùng chung giao diện AuthPage */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Route Bảo mật: Trang chủ (Dashboard) */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                 {/* Tạm thời để placeholder, sau này sẽ thay bằng <HomePage /> */}
                 <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                      🎉 Chào mừng bạn đến với Note App!
                    </h1>
                    <p className="text-gray-500 mb-8">Bạn đã đăng nhập thành công.</p>
                    
                    <button 
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                      }}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Đăng xuất
                    </button>
                 </div>
              </PrivateRoute>
            } 
          />

          {/* Route 404: Nếu nhập linh tinh thì đá về Home (hoặc Login) */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;