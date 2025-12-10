import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin } from 'antd';
import { LoadingOutlined, InboxOutlined } from '@ant-design/icons';
import { noteApi } from '../api/axiosClient';
import { Note, NoteRequest } from '../types';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

const ArchivePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      const response: any = await noteApi.getArchived(0, 50);
      if (response.code === 1000) {
        setNotes(response.result.content);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  // --- HANDLER: Bỏ lưu trữ ---
  const handleUnarchive = async (id: number) => {
    try {
      await noteApi.unarchive(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success("Đã chuyển về ghi chú chính");
    } catch (e) { message.error("Lỗi bỏ lưu trữ"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await noteApi.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success("Đã chuyển vào thùng rác");
    } catch (e) { message.error("Lỗi xóa"); }
  };

  // --- HANDLER: Ghim (Ghim + Unarchive) ---
  const handlePin = async (id: number) => {
      const note = notes.find(n => n.id === id);
      if(!note) return;

      // Optimistic: Xóa khỏi danh sách Archive ngay lập tức
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success("Đã ghim và chuyển về trang chính");

      try {
          // Gọi API Update: Pin=True, Archive=False
          const updateData: NoteRequest = {
              title: note.title,
              content: note.content,
              isPinned: true,    // Bật ghim
              isArchived: false, // Tắt lưu trữ
              backgroundColor: note.backgroundColor,
              reminder: note.reminder
          };
          await noteApi.update(id, updateData);
      } catch (e) {
          message.error("Lỗi khi ghim");
          fetchNotes(); // Revert
      }
  };

  const openEditModal = (note: Note) => {
      setEditingNote(note);
      setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updatedNote: Note) => {
      if (!updatedNote.isArchived) {
          setNotes(prev => prev.filter(n => n.id !== updatedNote.id));
      } else {
          setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      }
  };

  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="pb-10 px-4">
      <div className="py-6 flex items-center gap-2 text-gray-600 border-b border-gray-100 mb-4">
        <InboxOutlined className="text-2xl" />
        <h1 className="text-2xl font-bold">Lưu trữ</h1>
      </div>

      {loading && <div className="flex justify-center my-10"><Spin indicator={antIcon} /></div>}

      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-400 opacity-60">
            <InboxOutlined style={{ fontSize: 64, marginBottom: 16 }} />
            <p className="text-lg font-medium">Ghi chú đã lưu trữ sẽ xuất hiện ở đây</p>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
            {notes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <NoteCard 
                    note={note} 
                    onDelete={handleDelete}
                    onArchive={handleUnarchive}
                    onPin={handlePin} // TRUYỀN HÀM GHIM ĐẶC BIỆT
                    onEdit={openEditModal}
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
        onArchive={handleUnarchive}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ArchivePage;