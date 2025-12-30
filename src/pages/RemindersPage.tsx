import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin, Empty } from 'antd';
import { Bell } from 'lucide-react'; // Dùng icon Bell cho Empty state
import { noteApi } from '../api/axiosClient';
import { Note, NoteRequest } from '../types';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

const RemindersPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch dữ liệu
  const fetchNotes = async () => {
    try {
      const response: any = await noteApi.getReminders(0, 50);
      if (response.code === 1000) {
        setNotes(response.result.content);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  // 2. Xử lý Xóa Note: Biến mất khỏi trang này
  const handleDelete = async (id: number) => {
    try {
      await noteApi.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id)); // Loại bỏ ngay lập tức
      message.success("Đã chuyển vào thùng rác");
    } catch (e) { message.error("Lỗi xóa"); }
  };

  // 3. Xử lý Lưu trữ: CHỈ đổi trạng thái, VẪN GIỮ trên trang này
  const handleArchive = async (id: number) => {
    const note = notes.find(n => n.id === id);
    if(!note) return;

    // UI Optimistic Update: Đổi trạng thái isArchived nhưng không xóa khỏi list
    const newStatus = !note.isArchived;
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isArchived: newStatus, isPinned: false } : n));

    try {
        if(newStatus) await noteApi.archive(id);
        else await noteApi.unarchive(id);
        message.success(newStatus ? "Đã lưu trữ" : "Đã hủy lưu trữ");
    } catch (e) { 
        fetchNotes(); // Revert nếu lỗi
    }
  };

  // 4. Xử lý Ghim: CHỈ đổi trạng thái, VẪN GIỮ trên trang này
  const handlePin = async (id: number) => {
      const note = notes.find(n => n.id === id);
      if(!note) return;
      
      const newStatus = !note.isPinned;
      // UI Update: Đổi isPinned, vẫn giữ nguyên vị trí hoặc sort lại tùy bạn
      // (Ở trang Reminder thường sort theo giờ nhắc nên không cần sort lại theo pin)
      setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: newStatus } : n));

      try {
          const updateData: NoteRequest = {
              title: note.title,
              content: note.content,
              isPinned: newStatus, 
              isArchived: note.isArchived,
              backgroundColor: note.backgroundColor,
              reminder: note.reminder
          };
          await noteApi.update(id, updateData);
      } catch (e) { fetchNotes(); }
  };

  const handleColorChange = async (id: number, color: string) => {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, backgroundColor: color } : n));
      // Gọi API update color tương tự HomePage...
      // (Bạn tự implement phần gọi API update giống HomePage nhé)
      const note = notes.find(n => n.id === id);
      if(note) {
           await noteApi.update(id, { ...note, backgroundColor: color } as any); 
      }
  };

  // 5. Xử lý sau khi sửa trong Modal
  const handleUpdateSuccess = (updatedNote: Note) => {
      // LOGIC QUAN TRỌNG:
      // Nếu người dùng xóa reminder trong modal (updatedNote.reminder == null)
      // -> Loại bỏ khỏi danh sách này.
      if (!updatedNote.reminder) {
          setNotes(prev => prev.filter(n => n.id !== updatedNote.id));
      } else {
          // Ngược lại cập nhật thông tin hiển thị
          setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      }
  };

  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
  
  // Sắp xếp: Note nào quá hạn hoặc sắp đến hạn nhất lên đầu
  const sortedNotes = [...notes].sort((a, b) => {
      const dateA = a.reminder ? new Date(a.reminder).getTime() : 0;
      const dateB = b.reminder ? new Date(b.reminder).getTime() : 0;
      return dateA - dateB;
  });

  return (
    <div className="pb-10 px-4">
      {/* Header nhỏ */}
      <div className="py-4 pl-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          Lời nhắc sắp tới
      </div>

      {loading && <div className="flex justify-center my-10"><Spin /></div>}
      
      {!loading && sortedNotes.length === 0 && (
        <div className="mt-20 flex flex-col items-center text-gray-400">
            <Bell size={64} strokeWidth={1} />
            <p className="mt-4 font-medium">Không có lời nhắc nào</p>
        </div>
      )}

      {!loading && sortedNotes.length > 0 && (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
            {sortedNotes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <NoteCard 
                    note={note} 
                    onDelete={handleDelete}
                    onArchive={handleArchive} // Dùng hàm handleArchive riêng của trang này
                    onPin={handlePin}         // Dùng hàm handlePin riêng
                    onChangeColor={handleColorChange}
                    onEdit={(n) => { setEditingNote(n); setIsModalOpen(true); }}
                />
            </motion.div>
            ))}
        </Masonry>
      )}

      <NoteModal 
        isOpen={isModalOpen}
        note={editingNote}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateSuccess}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default RemindersPage;