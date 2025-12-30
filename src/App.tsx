import React, { type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage'; 
import TrashPage from './pages/TrashPage';    
import RemindersPage from './pages/RemindersPage'; 
import MainLayout from './layouts/MainLayout';
import LabelPage from './pages/LabelPage';

// --- COMPONENT BẢO VỆ (PRIVATE ROUTE) ---
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily: 'Inter, sans-serif',
        },
        components: {
          Button: {
            controlHeightLG: 45,
            fontWeight: 600,
          },
          Input: {
            controlHeightLG: 45,
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* 1. Route public */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* 2. Route Homepage*/}
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

          {/* 3. Route Archive */}
          <Route 
            path="/archive" 
            element={
              <PrivateRoute>
                <MainLayout>
                  <ArchivePage />
                </MainLayout>
              </PrivateRoute>
            } 
          />

          {/* 4. Route Trash */}
          <Route 
            path="/trash" 
            element={
              <PrivateRoute>
                <MainLayout>
                  <TrashPage />
                </MainLayout>
              </PrivateRoute>
            } 
          />

          {/* 5. Route reminder*/}
          <Route 
            path="/reminders" 
            element={
              <PrivateRoute>
                <MainLayout>
                  <RemindersPage />
                </MainLayout>
              </PrivateRoute>
            } 
          />

          {/* 6. Route tag */}
          <Route 
            path="/label/:labelId" 
            element={
            <PrivateRoute>
              <MainLayout>
                <LabelPage />
              </MainLayout>
            </PrivateRoute>
            } 
          />

          {/* Route mặc định: Chuyển về trang chủ nếu gõ sai link */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;