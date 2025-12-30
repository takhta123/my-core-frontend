import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin, Empty } from 'antd';
import { Tag } from 'lucide-react';
import { noteApi } from '../api/axiosClient';
import { Note, NoteRequest } from '../types';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

const LabelPage: React.FC = () => {
  const { labelId } = useParams(); // Lấy ID từ URL
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Notes khi labelId thay đổi
  useEffect(() => {
    if (labelId) fetchNotes(Number(labelId));
  }, [labelId]);

  const fetchNotes = async (id: number) => {
    setLoading(true);
    try {
      const response: any = await noteApi.getByLabel(id);
      if (response.code === 1000) setNotes(response.result.content);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // 1. Xóa Note: Biến mất khỏi trang
  const handleDelete = async (id: number) => {
    try {
      await noteApi.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success("Đã chuyển vào thùng rác");
    } catch (e) { message.error("Lỗi xóa"); }
  };

  // 2. Lưu trữ: CHỈ đổi trạng thái, VẪN GIỮ trên trang này
  const handleArchive = async (id: number) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const newStatus = !note.isArchived;
    
    // Optimistic Update
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isArchived: newStatus, isPinned: false } : n));

    try {
        if (newStatus) await noteApi.archive(id);
        else await noteApi.unarchive(id);
    } catch (e) { fetchNotes(Number(labelId)); }
  };

  // 3. Ghim: CHỈ đổi trạng thái, VẪN GIỮ trên trang này
  const handlePin = async (id: number) => {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      const newStatus = !note.isPinned;

      // UI Update
      setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: newStatus } : n));
      
      try {
          // Tạo request chỉ chứa các trường cần thiết
          const updateData: NoteRequest = { 
              title: note.title,
              content: note.content,
              isPinned: newStatus,
              isArchived: note.isArchived,
              backgroundColor: note.backgroundColor,
              reminder: note.reminder
          }; 
          await noteApi.update(id, updateData);
      } catch (e) { fetchNotes(Number(labelId)); }
  };

  // 4. Đổi màu
  const handleColorChange = async (id: number, color: string) => {
      const note = notes.find(n => n.id === id);
      if (!note) return;

      // UI Update ngay lập tức
      setNotes(prev => prev.map(n => n.id === id ? { ...n, backgroundColor: color } : n));

      try {
          const updateData: NoteRequest = {
              title: note.title,
              content: note.content,
              isPinned: note.isPinned,
              isArchived: note.isArchived,
              backgroundColor: color, // Cập nhật màu
              reminder: note.reminder
          };
          await noteApi.update(id, updateData);
      } catch (e) { 
          message.error("Lỗi đổi màu");
          fetchNotes(Number(labelId)); // Revert nếu lỗi
      }
  };


  // 5. Update Modal
  const handleUpdateSuccess = (updatedNote: Note) => {
      const currentLabelId = Number(labelId);
      const hasLabel = updatedNote.labels?.some(l => l.id === currentLabelId);

      if (!hasLabel) {
          setNotes(prev => prev.filter(n => n.id !== updatedNote.id));
      } else {
          setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      }
  };
  
  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };

  return (
    <div className="pb-10 px-4">
      {loading ? <div className="flex justify-center my-10"><Spin /></div> : (
        notes.length === 0 ? (
           <div className="mt-20 flex flex-col items-center text-gray-400">
               <Tag size={64} strokeWidth={1} />
               <p className="mt-4 font-medium">Chưa có ghi chú nào với nhãn này</p>
           </div>
        ) : (
           <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
              {notes.map((note) => (
                <motion.div key={note.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <NoteCard 
                    note={note} 
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                    onPin={handlePin}
                    onChangeColor={handleColorChange} 
                    onEdit={(n) => { setEditingNote(n); setIsModalOpen(true); }}
                  />
                </motion.div>
              ))}
           </Masonry>
        )
      )}
      <NoteModal 
        isOpen={isModalOpen} note={editingNote} onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateSuccess} onArchive={handleArchive} onDelete={handleDelete}
      />
    </div>
  );
};
export default LabelPage;