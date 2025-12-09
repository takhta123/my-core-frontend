import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Plus } from 'lucide-react'; // Dùng cho nút tạo note trong màn hình trống

import { noteApi } from '../api/axiosClient';
import { Note } from '../types';
import mascotZero from '../assets/Mascot zero notes.png';

// Import Components
import NoteCard from '../components/NoteCard';
import CreateNoteInput from '../components/CreateNoteInput';

const HomePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // --- THÊM HÀM XỬ LÝ ĐỔI MÀU ---
  const handleColorChange = async (id: number, color: string) => {
    // 1. Tìm note hiện tại để lấy dữ liệu cũ (tránh mất dữ liệu)
    const noteToUpdate = notes.find(n => n.id === id);
    if (!noteToUpdate) return;

    try {
      // 2. Cập nhật Optimistic (Giao diện đổi màu ngay lập tức)
      setNotes(prev => prev.map(n => n.id === id ? { ...n, backgroundColor: color } : n));

      // 3. Gọi API cập nhật Backend
      // Lưu ý: Backend yêu cầu gửi object NoteRequest đầy đủ
      const updateData = {
          title: noteToUpdate.title,
          content: noteToUpdate.content,
          isPinned: noteToUpdate.isPinned,
          isArchived: noteToUpdate.isArchived,
          reminder: noteToUpdate.reminder,
          backgroundColor: color // Chỉ đổi màu
      };

      await noteApi.update(id, updateData);
    
    } catch (error) {
      message.error("Đổi màu thất bại");
      // Nếu lỗi thì revert lại (có thể fetchNotes() lại)
      fetchNotes(); 
    }
  };

  // --- 1. HÀM GỌI API LẤY DANH SÁCH ---
  const fetchNotes = async () => {
    try {
      setLoading(true);
      // Gọi API lấy trang 0, 20 phần tử
      const response: any = await noteApi.getAll(0, 20);
      
      if (response.code === 1000) {
        // Backend trả về Page<Note> trong result -> result.content là mảng Note
        setNotes(response.result.content);
      }
    } catch (error) {
      console.error("Lỗi tải ghi chú:", error);
      message.error("Không thể tải danh sách ghi chú");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GỌI API KHI MỞ TRANG ---
  useEffect(() => {
    fetchNotes();
  }, []);

  // --- 3. XỬ LÝ HÀNH ĐỘNG TRÊN CARD ---
  const handleDelete = async (id: number) => {
    try {
      await noteApi.delete(id); // Gọi API xóa mềm
      message.success("Đã chuyển vào thùng rác");
      // Cập nhật lại giao diện (xóa note khỏi danh sách hiện tại)
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await noteApi.archive(id);
      message.success("Đã lưu trữ ghi chú");
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      message.error("Lưu trữ thất bại");
    }
  };

  const handlePin = async (id: number) => {
    // Tìm note hiện tại để lấy trạng thái cũ
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      // Gọi API update (Bạn cần đảm bảo backend hỗ trợ update 1 phần, hoặc gửi full object)
      // Ở đây ta giả định gửi object đã đổi isPinned
      await noteApi.update(id, { ...note, isPinned: !note.isPinned }); 
      
      // Update state cục bộ cho nhanh (Optimistic UI)
      setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    } catch (error) {
      message.error("Lỗi khi ghim ghi chú");
    }
  };

  // Cấu hình cột cho Masonry Layout
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  // Icon Loading
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="pb-10 px-4">
      {/* 1. Luôn hiển thị thanh tạo ghi chú ở trên cùng */}
      <CreateNoteInput onSuccess={fetchNotes} />
      {/* 2. Hiển thị Loading */}
      {loading && (
        <div className="flex justify-center my-10">
          <Spin indicator={antIcon} tip=" Đang tải dữ liệu..." />
        </div>
      )}

      {/* 3. Empty State (Chỉ hiện khi ko loading và list rỗng) */}
      {!loading && notes.length === 0 && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center mt-10 text-center"
        >
            <img 
              src={mascotZero} 
              alt="Empty" 
              className="w-48 h-48 object-cover mb-6 opacity-80 hover:scale-110 transition-transform duration-300"
            />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Chưa có ghi chú nào</h2>
            <p className="text-gray-500 mb-6 max-w-md">Những ý tưởng tuyệt vời đang chờ bạn viết ra. Hãy bắt đầu ngay thôi!</p>
            
            {/* Nút giả lập focus vào input (UX) */}
            <button 
                onClick={() => document.getElementById('create-note-input')?.focus()} // Cần id bên CreateNoteInput nếu muốn hoạt động
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
            >
              <Plus size={20} /> Tạo ghi chú đầu tiên
            </button>
        </motion.div>
      )}

      {/* 4. Danh sách Note (Masonry Grid) */}
      {!loading && notes.length > 0 && (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
        >
            {notes.map((note) => (
            <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <NoteCard 
                    note={note} 
                    onEdit={(n) => console.log("Edit:", n)} 
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onPin={handlePin}
                    // onRestore chỉ dùng ở trang Thùng rác, trang này không cần truyền
                />
            </motion.div>
            ))}
        </Masonry>
      )}
    </div>
  );
};

export default HomePage;