import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Note, ApiResponse } from '../types';
import mascotZero from '../assets/Mascot zero notes.png';

const HomePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch API
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axiosClient.get<ApiResponse<Note[]>>('/notes');
        // Vì axiosClient interceptor trả về response.data, 
        // ta cần ép kiểu hoặc kiểm tra cấu trúc thực tế trả về.
        // Giả sử response trả về đúng format ApiResponse
        if ((response as any).code === 1000) {
            setNotes((response as any).result);
        }
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Cấu hình cột cho Masonry Layout
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  // --- EMPTY STATE (Khi chưa có ghi chú) ---
  if (!loading && notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <motion.img 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          src={mascotZero} 
          alt="Empty" 
          className="w-48 h-48 object-cover mb-6 opacity-80 hover:scale-110 transition-transform duration-300"
        />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Chưa có ghi chú nào</h2>
        <p className="text-gray-500 mb-8 max-w-md">Những ý tưởng tuyệt vời đang chờ bạn viết ra. Hãy bắt đầu ngay thôi!</p>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1">
          <Plus size={20} /> Tạo ghi chú đầu tiên
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Note Grid */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 break-inside-avoid"
          >
            <div 
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-200 group"
              style={{ backgroundColor: note.backgroundColor || '#ffffff' }}
            >
              {note.title && (
                <h3 className="font-bold text-gray-800 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                  {note.title}
                </h3>
              )}
              <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed line-clamp-[10]">
                {note.content}
              </p>
              
              {/* Footer của Card (Ngày tháng, Labels...) - Có thể thêm sau */}
            </div>
          </motion.div>
        ))}
      </Masonry>
    </div>
  );
};

export default HomePage;