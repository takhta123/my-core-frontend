import React, { type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MainLayout from './layouts/MainLayout';


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
          {/* Route Công khai */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Route Bảo mật (Bọc trong MainLayout) */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </PrivateRoute>
            } 
          />

          {/* Các trang khác sau này cũng bọc trong MainLayout */}
          <Route 
            path="/reminders" 
            element={
              <PrivateRoute>
                <MainLayout>
                  <div>Trang Lời nhắc (Đang phát triển)</div>
                </MainLayout>
              </PrivateRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;