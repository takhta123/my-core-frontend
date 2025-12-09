import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { noteApi } from '../api/axiosClient';
import { Note } from '../types';
import mascotZero from '../assets/Mascot zero notes.png';

// Import 2 component riêng biệt
import NoteCard from '../components/NoteCard';
import CreateNoteInput from '../components/CreateNoteInput'; 
import NoteModal from '../components/NoteModal'; // Component sửa chuyên biệt

const HomePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Edit
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Handlers
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

  const handlePin = async (id: number) => { /* Code ghim cũ */ };
  const handleColorChange = async (id: number, color: string) => { /* Code đổi màu cũ */ };

  // Mở Modal Sửa
  const openEditModal = (note: Note) => {
      setEditingNote(note);
      setIsModalOpen(true);
  };

  // Cập nhật sau khi sửa xong
  const handleUpdateSuccess = (updatedNote: Note) => {
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      // Không cần setEditingNote(null) ở đây vì Modal sẽ tự đóng và gọi onClose
  };

  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="pb-10 px-4">
      {/* 1. Tạo mới: Dùng CreateNoteInput (Giao diện trắng, viền mỏng) */}
      <CreateNoteInput onSuccess={fetchNotes} />

      {/* 2. Danh sách Note */}
      {loading && <div className="flex justify-center my-10"><Spin indicator={antIcon} /></div>}
      
      {!loading && notes.length > 0 && (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
            {notes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <NoteCard 
                    note={note} 
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onPin={handlePin}
                    onChangeColor={handleColorChange}
                    onEdit={openEditModal} // Click vào note sẽ gọi hàm này
                />
            </motion.div>
            ))}
        </Masonry>
      )}

      {/* 3. Modal Sửa: Dùng NoteModal (Giao diện đậm, input trong suốt) */}
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