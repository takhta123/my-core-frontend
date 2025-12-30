import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { noteApi } from '../api/axiosClient';
import { Note, NoteRequest } from '../types';
import mascotZero from '../assets/Mascot zero notes.png';

import NoteCard from '../components/NoteCard';
import CreateNoteInput from '../components/CreateNoteInput'; 
import NoteModal from '../components/NoteModal'; 

const HomePage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- API: Lấy danh sách ---
  const fetchNotes = async () => {
    setLoading(true); // Nên set loading true mỗi khi search lại
    try {
      // 3. Truyền searchKeyword vào hàm API
      // Lưu ý: Backend controller dùng @RequestParam(required=false) String search
      const response: any = await noteApi.getAll(0, 50, searchKeyword);
      if (response.code === 1000) {
        setNotes(response.result.content);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { 
      fetchNotes(); 
  }, [searchKeyword]);

  // --- HANDLER: Xóa & Lưu trữ ---
  const handleDelete = async (id: number) => {
    try {
      await noteApi.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success("Đã chuyển vào thùng rác");
    } catch (e) { message.error("Lỗi xóa"); }
  };

  const handleArchive = async (id: number) => {
    try {
        await noteApi.archive(id);
        setNotes(prev => prev.filter(n => n.id !== id));
        message.success("Đã lưu trữ");
    } catch (e) { message.error("Lỗi lưu trữ"); }
  };

  const sortNotes = (notesList: Note[]) => {
      return [...notesList].sort((a, b) => {
          // Ưu tiên ghim
          if (a.isPinned === b.isPinned) {
              // Nếu cùng trạng thái ghim -> So sánh NGÀY TẠO (createdAt)
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return a.isPinned ? -1 : 1;
      });
  };

  // --- HANDLER: Ghim ---
  const handlePin = async (id: number) => {
      const note = notes.find(n => n.id === id);
      if(!note) return;
      
      const newStatus = !note.isPinned;

      setNotes(prev => {
          const updated = prev.map(n => n.id === id ? { ...n, isPinned: newStatus } : n);
          return sortNotes(updated); // <--- Gọi hàm sort theo createdAt
      });

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
          message.error("Lỗi khi ghim");
          fetchNotes(); // Revert
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
              backgroundColor: color,
              reminder: note.reminder
          };
          await noteApi.update(id, updateData);
      } catch (e) { fetchNotes(); }
  };

  const openEditModal = (note: Note) => {
      setEditingNote(note);
      setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updatedNote: Note) => {
      setNotes(prev => {
        const newNotes = prev.map(n => n.id === updatedNote.id ? updatedNote : n);
        return sortNotes(newNotes); // <--- Gọi hàm sort theo createdAt
      });
  };
  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  // --- TÁCH MẢNG NOTE THÀNH 2 PHẦN ---
  const pinnedNotes = notes.filter(n => n.isPinned);
  const otherNotes = notes.filter(n => !n.isPinned);

  return (
    <div className="pb-10 px-4">
      <CreateNoteInput onSuccess={fetchNotes} />

      {loading && <div className="flex justify-center my-10"><Spin indicator={antIcon} /></div>}
      
      {!loading && notes.length === 0 && (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center mt-10 text-center"
        >
            {searchKeyword ? (
                <>
                    <img 
                        src={mascotZero} 
                        alt="Not Found" 
                        className="w-48 h-48 object-cover mb-6 opacity-100" 
                    />
                    <h2 className="text-xl font-bold text-gray-500">
                        Không tìm thấy kết quả cho "{searchKeyword}"
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">
                        Hãy thử tìm bằng từ khóa khác hoặc kiểm tra lại chính tả.
                    </p>
                </>
            ) : (
                <>
                    <img 
                        src={mascotZero} 
                        alt="Empty" 
                        className="w-48 h-48 object-cover mb-6 opacity-100" 
                    />
                    <h2 className="text-xl font-bold text-gray-600">
                        Chưa có ghi chú nào
                    </h2>
                    <p className="text-sm text-gray-400 mt-2">
                        Những ghi chú bạn thêm sẽ xuất hiện tại đây.
                    </p>
                </>
            )}
        </motion.div>
      )}

      {/* --- PHẦN 1: GHI CHÚ ĐƯỢC GHIM --- */}
      {!loading && pinnedNotes.length > 0 && (
        <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-2">Được ghim</h3>
            <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
                {pinnedNotes.map((note) => (
                <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <NoteCard 
                        note={note} 
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onPin={handlePin}
                        onChangeColor={handleColorChange}
                        onEdit={openEditModal}
                    />
                </motion.div>
                ))}
            </Masonry>
        </div>
      )}

      {/* --- PHẦN 2: GHI CHÚ KHÁC --- */}
      {!loading && otherNotes.length > 0 && (
        <div>
            {/* Chỉ hiện tiêu đề "Khác" nếu có mục được ghim */}
            {pinnedNotes.length > 0 && (
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-2">Khác</h3>
            )}
            
            <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
                {otherNotes.map((note) => (
                <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <NoteCard 
                        note={note} 
                        onDelete={handleDelete}
                        onArchive={handleArchive}
                        onPin={handlePin}
                        onChangeColor={handleColorChange}
                        onEdit={openEditModal}
                    />
                </motion.div>
                ))}
            </Masonry>
        </div>
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

export default HomePage;