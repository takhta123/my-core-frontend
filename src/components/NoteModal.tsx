import React, { useEffect, useState, useRef } from 'react';
import { Modal, Input, message, Tooltip } from 'antd';
import { Note, NoteRequest } from '../types';
import { noteApi } from '../api/axiosClient';
import { Pin, Trash2, Archive, Image, Palette, Undo, Redo } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

// Cấu hình dayjs để hiển thị thời gian tiếng Việt (VD: "vài giây trước")
dayjs.extend(relativeTime);
dayjs.locale('vi');

interface NoteModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onUpdate: (updatedNote: Note) => void; // Callback cập nhật list bên ngoài
  onPin?: (id: number) => void;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, note, onClose, onUpdate, onPin, onArchive, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dùng useRef để lưu trạng thái ban đầu, giúp so sánh xem có thay đổi không
  const initialNoteRef = useRef<{ title: string; content: string; isPinned: boolean } | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
      // Lưu lại trạng thái gốc khi mở modal
      initialNoteRef.current = { title: note.title, content: note.content, isPinned: note.isPinned };
    }
  }, [note]);

  // Hàm lưu dữ liệu
  const handleSave = async () => {
    if (!note) return;

    // Kiểm tra xem có thay đổi gì không
    const hasChanged =
      title !== initialNoteRef.current?.title ||
      content !== initialNoteRef.current?.content ||
      isPinned !== initialNoteRef.current?.isPinned;

    // Nếu không có gì thay đổi thì đóng luôn, không gọi API
    if (!hasChanged) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const updateData: NoteRequest = {
        title: title,
        content: content,
        isPinned: isPinned, // Sử dụng trạng thái ghim mới
        isArchived: note.isArchived,
        backgroundColor: note.backgroundColor,
        reminder: note.reminder
      };

      const response: any = await noteApi.update(note.id, updateData);

      if (response.code === 1000) {
        // message.success('Đã lưu thay đổi'); // Google Keep thường lưu âm thầm
        onUpdate(response.result); // Cập nhật lại ghi chú trong danh sách cha
        onClose(); // Đóng modal
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu ghi chú');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi bấm nút "Đóng" hoặc click ra ngoài
  const handleClose = () => {
      handleSave(); // Gọi lưu trước khi đóng
  };

  // Xử lý khi bấm nút Ghim trong modal
  const handlePinClick = () => {
      setIsPinned(!isPinned); // Chỉ đổi state nội bộ, sẽ lưu khi đóng modal
  };

  // Format thời gian sửa cuối (VD: "Đã chỉnh sửa vài giây trước")
  const lastEdited = note ? `Đã chỉnh sửa ${dayjs(note.updatedAt || note.createdAt).fromNow()}` : '';

  // --- CUSTOM HEADER (Title + Pin) ---
  const CustomTitle = (
      <div className="flex justify-between items-start px-6 pt-5 pb-2">
          <Input
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold border-none shadow-none focus:shadow-none p-0 bg-transparent placeholder-gray-500 flex-1 mr-4"
          />
          <Tooltip title={isPinned ? "Bỏ ghim" : "Ghim ghi chú"}>
              <button
                  onClick={handlePinClick}
                  className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-black/10'}`}
              >
                  <Pin size={22} fill={isPinned ? "currentColor" : "none"} />
              </button>
          </Tooltip>
      </div>
  );

  // --- CUSTOM FOOTER (Time + Icons + Close Button) ---
  const CustomFooter = (
      <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200/50">
          {/* Thời gian sửa cuối */}
          <div className="text-xs text-gray-500 font-medium ml-2 select-none">
              {lastEdited}
          </div>
          
          {/* Các nút chức năng */}
          <div className="flex items-center gap-1">
              <Tooltip title="Đổi màu">
                  <button className="p-2 hover:bg-black/10 rounded-full text-gray-600 transition-colors">
                      <Palette size={18} />
                  </button>
              </Tooltip>
              <Tooltip title="Thêm ảnh">
                  <button className="p-2 hover:bg-black/10 rounded-full text-gray-600 transition-colors">
                      <Image size={18} />
                  </button>
              </Tooltip>
              <Tooltip title="Lưu trữ">
                  <button onClick={() => { note && onArchive?.(note.id); onClose(); }} className="p-2 hover:bg-black/10 rounded-full text-gray-600 transition-colors">
                      <Archive size={18} />
                  </button>
              </Tooltip>
              <Tooltip title="Xóa">
                  <button onClick={() => { note && onDelete?.(note.id); onClose(); }} className="p-2 hover:bg-red-100 rounded-full text-red-500 transition-colors">
                      <Trash2 size={18} />
                  </button>
              </Tooltip>
               {/* Các nút Undo/Redo (Demo - chưa có chức năng) */}
              <button className="p-2 text-gray-300 cursor-not-allowed"><Undo size={18} /></button>
              <button className="p-2 text-gray-300 cursor-not-allowed"><Redo size={18} /></button>


              {/* Nút Đóng */}
              <button
                  onClick={handleClose}
                  className="px-6 py-2 ml-4 bg-transparent hover:bg-black/5 text-gray-800 font-semibold rounded-[4px] text-sm transition-colors"
              >
                  Đóng
              </button>
          </div>
      </div>
  );

  return (
    <Modal
      title={CustomTitle}
      open={isOpen}
      onCancel={handleClose} // Gọi handleClose khi click ra ngoài hoặc bấm ESC
      footer={CustomFooter}
      confirmLoading={loading}
      width={600}
      destroyOnClose
      centered
      closeIcon={null} // Ẩn nút X mặc định ở góc trên phải
      modalRender={(dom) => (
        <div
            style={{
                backgroundColor: note?.backgroundColor || '#ffffff', // Màu nền động
                borderRadius: '16px',
                overflow: 'hidden', // Để bo góc không bị nội dung chém mất
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: 0
            }}
        >
            {dom}
        </div>
    )}
    >
      <Input.TextArea
        placeholder="Ghi chú..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        autoSize={{ minRows: 4, maxRows: 20 }}
        className="text-base text-gray-800 border-none shadow-none focus:shadow-none p-0 bg-transparent resize-none"
      />
    </Modal>
  );
};

export default NoteModal;