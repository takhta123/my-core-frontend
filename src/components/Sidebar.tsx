import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  StickyNote, 
  Bell, 
  Trash2, 
  Archive, 
  Settings,
  X,
  Tag,
  Edit2, // [MỚI] Icon chỉnh sửa
  Plus   // [MỚI] Icon thêm
} from 'lucide-react';
import { labelApi } from '../api/axiosClient';
import { Label } from '../types';
import LabelManagerModal from './LabelManagerModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // [MỚI] State quản lý danh sách nhãn và Modal
  const [labels, setLabels] = useState<Label[]>([]);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // [MỚI] Hàm lấy danh sách nhãn từ API
  const fetchLabels = async () => {
    try {
      const res: any = await labelApi.getAll();
      if (res.code === 1000) setLabels(res.result);
    } catch (e) { console.error(e); }
  };

  // [MỚI] Gọi API khi component được mount
  useEffect(() => {
    fetchLabels();
  }, []);

  // [THAY ĐỔI] Tách menu thành 2 phần: Chính và Hệ thống
  const mainItems = [
    { icon: StickyNote, label: 'Ghi chú', path: '/' },
    { icon: Bell, label: 'Lời nhắc', path: '/reminders' },
  ];

  const systemItems = [
    { icon: Archive, label: 'Lưu trữ', path: '/archive' },
    { icon: Trash2, label: 'Thùng rác', path: '/trash' },
  ];

  // Hàm helper để render một nút menu (Tái sử dụng style cũ của bạn)
  const renderMenuItem = (item: { icon: any, label: string, path: string }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    return (
      <button
        key={item.path}
        onClick={() => {
          navigate(item.path);
          if (window.innerWidth < 1024) onClose();
        }}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
          ${isActive 
            ? 'bg-blue-50 text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
        `}
      >
        <Icon size={20} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Overlay cho Mobile (Giữ nguyên) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Chính */}
      <aside className={`
        fixed lg:static top-0 left-0 z-50 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header (Giữ nguyên) */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Notes
          </h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation - Thêm overflow-y-auto để cuộn nếu danh sách nhãn dài */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* 1. Menu Chính */}
          {mainItems.map(renderMenuItem)}

          {/* Separator */}
          <div className="my-2 border-t border-gray-100 mx-2"></div>

          {/* 2. [MỚI] Phần Nhãn (Dynamic) */}
          <div className="flex items-center justify-between px-4 py-2 mt-2 mb-1 group">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nhãn</span>
             <button 
                onClick={() => setIsManagerOpen(true)}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600 transition-colors" 
                title="Chỉnh sửa nhãn"
             >
                <Edit2 size={14}/>
             </button>
          </div>

          {labels.map(label => renderMenuItem({
              icon: Tag,
              label: label.name,
              path: `/label/${label.id}`
          }))}

          {/* Separator */}
          <div className="my-2 border-t border-gray-100 mx-2"></div>

          {/* 3. Menu Hệ thống */}
          {systemItems.map(renderMenuItem)}

        </nav>
      </aside>

      {/* [MỚI] Modal Quản lý Nhãn */}
      <LabelManagerModal 
         isOpen={isManagerOpen} 
         onClose={() => setIsManagerOpen(false)} 
         onUpdate={fetchLabels} // Reload lại list bên sidebar khi có thay đổi trong modal
      />
    </>
  );
};

export default Sidebar;