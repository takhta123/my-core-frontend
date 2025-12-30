import React, { useEffect, useState } from 'react';
import { Search, Menu, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { userApi } from '../api/axiosClient';
import { User } from '../types';
import ProfileModal from './ProfileModal';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  const fetchProfile = async () => {
      try {
        const response: any = await userApi.getMyProfile();
        if (response.code === 1000) {
          setCurrentUser(response.result);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

  useEffect(() => {
    if(localStorage.getItem('token')) {
        fetchProfile();
    }
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.pathname === '/' || location.pathname === '/home') {
        if (searchTerm.trim()) {
            setSearchParams({ search: searchTerm });
        } else {
            setSearchParams({}); 
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearchParams, location.pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (location.pathname !== '/' && location.pathname !== '/home') {
        navigate(`/?search=${e.target.value}`);
    }
  };

  return (
    <>
      <header className="h-16 px-4 bg-white/80 backdrop-blur-md border-b border-white/50 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Thanh tìm kiếm (Giữ nguyên) */}
          <div className="max-w-xl w-full hidden sm:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm ghi chú..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 rounded-xl pl-10 pr-4 py-2 text-sm transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Avatar & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border-2 border-white shadow-sm flex items-center justify-center hover:ring-2 hover:ring-blue-100 transition-all overflow-hidden"
          >
            {currentUser?.avatarUrl ? (
                 <img 
                    src={currentUser.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" // <--- THÊM DÒNG NÀY
                 />
            ) : (
                 <UserIcon size={20} className="text-blue-600" />
            )}
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                {/* Header Dropdown: Hiện thông tin thật */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {currentUser?.fullName || "Người dùng"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email || "Đang tải..."}</p>
                </div>
                
                <div className="p-1">
                    {/* Nút mở Modal Profile */}
                    <button 
                        onClick={() => {
                            setIsProfileOpen(true);
                            setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <UserIcon size={16} className="text-gray-400" /> 
                        Thông tin chi tiết
                    </button>

                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <LogOut size={16} /> 
                        Đăng xuất
                    </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={currentUser} 
        onUpdateUser={fetchProfile} 
      />
    </>
  );
};

export default Navbar;