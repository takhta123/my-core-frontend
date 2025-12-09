import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { message, Spin, Modal } from 'antd';
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import { noteApi } from '../api/axiosClient';
import { Note } from '../types';
import NoteCard from '../components/NoteCard';

const TrashPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // --- API: Lấy danh sách Thùng rác ---
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

  // --- HANDLER: Khôi phục ---
  const handleRestore = async (id: number) => {
    try {
      await noteApi.restore(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success("Đã khôi phục ghi chú");
    } catch (e) { message.error("Lỗi khôi phục"); }
  };

  // --- HANDLER: Xóa vĩnh viễn ---
  const handleDeleteForever = (id: number) => {
    Modal.confirm({
        title: 'Xóa vĩnh viễn?',
        content: 'Bạn không thể hoàn tác hành động này. Ghi chú sẽ bị xóa khỏi hệ thống.',
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

  const breakpointColumnsObj = { default: 4, 1100: 3, 700: 2, 500: 1 };
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="pb-10 px-4">
      {/* Header Thông báo */}
      <div className="py-4 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 italic bg-gray-100 px-4 py-2 rounded-full text-sm">
            <DeleteOutlined /> Ghi chú trong thùng rác sẽ bị xóa vĩnh viễn sau 7 ngày
          </div>
      </div>

      {loading && <div className="flex justify-center my-10"><Spin indicator={antIcon} /></div>}

      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-400 opacity-60">
            <DeleteOutlined style={{ fontSize: 64, marginBottom: 16 }} />
            <p className="text-lg font-medium">Thùng rác trống</p>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <Masonry breakpointCols={breakpointColumnsObj} className="flex w-auto -ml-4" columnClassName="pl-4 bg-clip-padding">
            {notes.map((note) => (
            <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <NoteCard 
                    note={note} 
                    // Trong thùng rác:
                    // onDelete đóng vai trò là "Delete Forever"
                    // onRestore đóng vai trò khôi phục
                    onDelete={handleDeleteForever}
                    onRestore={handleRestore}
                    
                    // Vô hiệu hóa các chức năng khác
                    onEdit={() => {}} // Không cho sửa
                    onPin={undefined} 
                    onChangeColor={undefined}
                />
            </motion.div>
            ))}
        </Masonry>
      )}
    </div>
  );
};

export default TrashPage;