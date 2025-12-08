import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  StickyNote, 
  Bell, 
  Tag, 
  Trash2, 
  Archive, 
  Settings,
  X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: StickyNote, label: 'Ghi chú', path: '/' },
    { icon: Bell, label: 'Lời nhắc', path: '/reminders' },
    { icon: Tag, label: 'Nhãn', path: '/labels' },
    { icon: Archive, label: 'Lưu trữ', path: '/archive' },
    { icon: Trash2, label: 'Thùng rác', path: '/trash' },
    { icon: Settings, label: 'Cài đặt', path: '/settings' },
  ];

  return (
    <>
      {/* Overlay cho Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Chính */}
      <aside className={`
        fixed lg:static top-0 left-0 z-50 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Notes
          </h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
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
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;