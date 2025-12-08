import React, { useState } from 'react';
import { Search, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="h-16 px-4 bg-white/80 backdrop-blur-md border-b border-white/50 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Thanh tìm kiếm */}
        <div className="max-w-xl w-full hidden sm:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm ghi chú..."
              className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-xl pl-10 pr-4 py-2 text-sm transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Avatar & Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border-2 border-white shadow-sm flex items-center justify-center hover:ring-2 hover:ring-blue-100 transition-all"
        >
          <UserIcon size={20} className="text-blue-600" />
        </button>

        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">User</p>
                <p className="text-xs text-gray-500">user@example.com</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;