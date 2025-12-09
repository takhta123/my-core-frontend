import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin, Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { noteApi } from '../api/axiosClient';
import { Note, NoteRequest } from '../types'; 
import mascotZero from '../assets/Mascot zero notes.png';
import NoteModal from '../components/NoteModal';

import NoteCard from '../components/NoteCard';
import CreateNoteInput from '../components/CreateNoteInput';

const HomePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // --- API GET ALL ---
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

  // --- CÁC HÀM XỬ LÝ (HANDLERS) ---
  
  const handleDelete = async (id: number) => {
    try {
      await noteApi.delete(id);
      message.success("Đã chuyển vào thùng rác");
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) { message.error("Lỗi xóa"); }
  };

  const handleArchive = async (id: number) => {
    try {
      await noteApi.archive(id);
      message.success("Đã lưu trữ");
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) { message.error("Lỗi lưu trữ"); }
  };

  const handlePin = async (id: number) => {
      const note = notes.find(n => n.id === id);
      if(!note) return;
      
      // Update UI ngay lập tức (Optimistic update)
      const newStatus = !note.isPinned;
      setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: newStatus } : n));

      try {
          // Backend yêu cầu gửi full object khi update
          const updateData: NoteRequest = {
              title: note.title,
              content: note.content,
              isPinned: newStatus, // Đổi trạng thái
              isArchived: note.isArchived,
              backgroundColor: note.backgroundColor,
              reminder: note.reminder // Gửi y nguyên
          };
          await noteApi.update(id, updateData);
      } catch (e) {
          message.error("Lỗi ghim note");
          fetchNotes(); // Revert nếu lỗi
      }
  };

  const handleColorChange = async (id: number, color: string) => {
      const note = notes.find(n => n.id === id);
      if(!note) return;

      setNotes(prev => prev.map(n => n.id === id ? { ...n, backgroundColor: color } : n));

      try {
          const updateData: NoteRequest = {
              title: note.title,
              content: note.content,
              isPinned: note.isPinned,
              isArchived: note.isArchived,
              backgroundColor: color, // Đổi màu
              reminder: note.reminder
          };
          await noteApi.update(id, updateData);
      } catch (e) {
          message.error("Lỗi đổi màu");
          fetchNotes();
      }
  };
// Hàm cập nhật UI sau khi sửa xong
  const updateNoteInList = (updatedNote: Note) => {
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      setEditingNote(null); // Đóng modal
  };

  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


  
  return (
    <div className="pb-10 px-4">
      <CreateNoteInput onSuccess={fetchNotes} />

      {loading && <div className="flex justify-center my-10"><Spin indicator={antIcon} /></div>}

      {!loading && notes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center mt-10 text-center">
            <img src={mascotZero} alt="Empty" className="w-48 h-48 object-cover mb-6 opacity-80" />
            <h2 className="text-xl font-bold text-gray-600">Chưa có ghi chú nào</h2>
        </motion.div>
      )}

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
                    onEdit={(n) => setEditingNote(n)} // <--- Bấm vào note thì set state này
                />
            </motion.div>
            ))}
        </Masonry>
      )}

      {/* 3. EDIT MODAL OVERLAY (Đoạn code bạn yêu cầu) */}
      {editingNote && (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={(e) => {
                // Đóng khi click vào vùng đen (overlay)
                if (e.target === e.currentTarget) setEditingNote(null);
            }}
        >
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
             {/* Tái sử dụng CreateNoteInput ở chế độ Edit */}
             <CreateNoteInput 
                existingNote={editingNote} 
                onUpdate={updateNoteInList}
                onClose={() => setEditingNote(null)}
             />
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;