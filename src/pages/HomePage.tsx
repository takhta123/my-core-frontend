import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { noteApi } from '../api/axiosClient';
import { Note, NoteRequest } from '../types';
import mascotZero from '../assets/Mascot zero notes.png';

// Import Components
import NoteCard from '../components/NoteCard';
import CreateNoteInput from '../components/CreateNoteInput'; 
import NoteModal from '../components/NoteModal'; 

const HomePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Edit Modal
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. LẤY DỮ LIỆU ---
  const fetchNotes = async () => {
    try {
      const response: any = await noteApi.getAll(0, 50);
      if (response.code === 1000) {
        setNotes(response.result.content);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  // --- 2. XỬ LÝ XÓA & LƯU TRỮ ---
  const handleDelete = async (id: number) => {
    try {
      await noteApi.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success("Đã xóa");
    } catch (e) { message.error("Lỗi xóa"); }
  };

  const handleArchive = async (id: number) => {
    try {
        await noteApi.archive(id);
        setNotes(prev => prev.filter(n => n.id !== id));
        message.success("Đã lưu trữ");
    } catch (e) { message.error("Lỗi lưu trữ"); }
  };

  // --- 3. XỬ LÝ GHIM (UPDATE) ---
  const handlePin = async (id: number) => {
      const note = notes.find(n => n.id === id);
      if(!note) return;
      
      const newStatus = !note.isPinned;
      // Optimistic Update
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
      } catch (e) {
          message.error("Lỗi ghim note");
          fetchNotes(); // Revert nếu lỗi
      }
  };

  // --- 4. XỬ LÝ ĐỔI MÀU (ĐÃ SỬA LOGIC) ---
  const handleColorChange = async (id: number, color: string) => {
      const note = notes.find(n => n.id === id);
      if(!note) return;

      // 1. Cập nhật giao diện ngay lập tức
      setNotes(prev => prev.map(n => n.id === id ? { ...n, backgroundColor: color } : n));

      try {
          // 2. Gọi API Update
          const updateData: NoteRequest = {
              title: note.title,
              content: note.content,
              isPinned: note.isPinned,
              isArchived: note.isArchived,
              backgroundColor: color, // Màu mới
              reminder: note.reminder
          };
          await noteApi.update(id, updateData);
      } catch (e) {
          message.error("Lỗi đổi màu");
          fetchNotes(); // Revert
      }
  };

  // Mở Modal Sửa
  const openEditModal = (note: Note) => {
      setEditingNote(note);
      setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updatedNote: Note) => {
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="pb-10 px-4">
      {/* Create Note */}
      <CreateNoteInput onSuccess={fetchNotes} />

      {/* Loading & Empty State */}
      {loading && <div className="flex justify-center my-10"><Spin indicator={antIcon} /></div>}
      {!loading && notes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center mt-10 text-center">
            <img src={mascotZero} alt="Empty" className="w-48 h-48 object-cover mb-6 opacity-80" />
            <h2 className="text-xl font-bold text-gray-600">Chưa có ghi chú nào</h2>
        </motion.div>
      )}

      {/* Note List */}
      {!loading && notes.length > 0 && (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
            {notes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <NoteCard 
                    note={note} 
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onPin={handlePin}
                    onChangeColor={handleColorChange} // Đã kết nối hàm xử lý
                    onEdit={openEditModal}
                />
            </motion.div>
            ))}
        </Masonry>
      )}

      {/* Edit Modal */}
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

export default HomePage;