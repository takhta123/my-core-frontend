import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin, Modal, Empty } from 'antd';
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import { noteApi } from '../api/axiosClient';
import { Note } from '../types';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal'; // Import Modal

const TrashPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingNote, setViewingNote] = useState<Note | null>(null); // State xem note
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      const response: any = await noteApi.getTrashed(0, 50);
      if (response.code === 1000) {
        setNotes(response.result.content);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleRestore = async (id: number) => {
    try {
      await noteApi.restore(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success("Đã khôi phục ghi chú");
    } catch (e) { message.error("Lỗi khôi phục"); }
  };

  const handleDeleteForever = (id: number) => {
    Modal.confirm({
        title: 'Xóa vĩnh viễn?',
        content: 'Bạn không thể hoàn tác hành động này.',
        okText: 'Xóa vĩnh viễn',
        okType: 'danger',
        cancelText: 'Hủy',
        centered: true,
        onOk: async () => {
            try {
                await noteApi.deleteForever(id);
                setNotes(prev => prev.filter(n => n.id !== id));
                message.success("Đã xóa vĩnh viễn");
            } catch (e) { message.error("Lỗi xóa"); }
        }
    });
  };

  // Hàm mở modal xem chi tiết
  const openViewModal = (note: Note) => {
      setViewingNote(note);
      setIsModalOpen(true);
  };

  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="pb-10 px-4">
      <div className="py-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full text-sm font-medium">
            <DeleteOutlined /> Ghi chú trong thùng rác sẽ bị xóa vĩnh viễn sau 7 ngày
          </div>
      </div>

      {loading && <div className="flex justify-center my-20"><Spin indicator={antIcon} /></div>}

      {!loading && notes.length === 0 && (
        <div className="mt-20">
            <Empty image={<DeleteOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />} description={<span className="text-gray-500 font-medium text-lg">Thùng rác trống</span>} />
        </div>
      )}

      {!loading && notes.length > 0 && (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
            {notes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <NoteCard
                    note={note}
                    onDelete={handleDeleteForever}
                    onRestore={handleRestore}
                    // Truyền hàm mở modal vào onEdit để cho phép click xem
                    onEdit={openViewModal} 
                    onArchive={undefined}
                    onChangeColor={undefined}
                    onPin={undefined}
                />
            </motion.div>
            ))}
        </Masonry>
      )}

      {/* MODAL Ở CHẾ ĐỘ READ-ONLY */}
      <NoteModal 
        isOpen={isModalOpen}
        note={viewingNote}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => {}} // Không cần update gì cả
        readOnly={true} // Bật chế độ chỉ xem
      />
    </div>
  );
};

export default TrashPage;