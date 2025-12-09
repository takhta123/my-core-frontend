import React, { useEffect, useState, useRef } from 'react';
import { Modal, Input, message, Tooltip, Dropdown, MenuProps } from 'antd';
import { Note, NoteRequest } from '../types';
import { noteApi } from '../api/axiosClient';
import { Pin, Trash2, Archive, Image, Palette } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { NOTE_COLORS } from './NoteCard'; // Import bộ màu từ NoteCard

dayjs.extend(relativeTime);
dayjs.locale('vi');

interface NoteModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onUpdate: (updatedNote: Note) => void;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, note, onClose, onUpdate, onArchive, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff'); // State màu tạm thời
  const [loading, setLoading] = useState(false);
  
  const initialNoteRef = useRef<{ title: string; content: string; isPinned: boolean; bgColor: string } | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
      setBgColor(note.backgroundColor || '#ffffff');
      initialNoteRef.current = { 
          title: note.title, 
          content: note.content, 
          isPinned: note.isPinned,
          bgColor: note.backgroundColor || '#ffffff'
      };
    }
  }, [note]);

  const handleSave = async () => {
    if (!note) return;

    const hasChanged =
      title !== initialNoteRef.current?.title ||
      content !== initialNoteRef.current?.content ||
      isPinned !== initialNoteRef.current?.isPinned ||
      bgColor !== initialNoteRef.current?.bgColor;

    if (!hasChanged) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const updateData: NoteRequest = {
        title: title,
        content: content,
        isPinned: isPinned,
        isArchived: note.isArchived,
        backgroundColor: bgColor, // Lưu màu mới
        reminder: note.reminder
      };

      const response: any = await noteApi.update(note.id, updateData);

      if (response.code === 1000) {
        onUpdate(response.result);
        onClose();
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu ghi chú');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => handleSave();
  
  // Lấy style hiện tại (để hiển thị border/footer đậm)
  const currentStyle = NOTE_COLORS.find(c => c.hex === bgColor) || NOTE_COLORS[0];

  // Menu chọn màu (Dropdown)
  const colorMenu: MenuProps['items'] = NOTE_COLORS.map((color) => ({
    key: color.hex,
    label: (
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full border border-gray-300 ${color.body}`}></div>
        <span className="text-sm">{color.name}</span>
      </div>
    ),
    onClick: () => setBgColor(color.hex) // Đổi màu ngay lập tức trên UI modal
  }));

  // --- CUSTOM HEADER ---
  const CustomHeader = (
      <div className={`flex justify-between items-start px-6 pt-6 pb-2 ${currentStyle.body}`}>
          <Input
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-none shadow-none focus:shadow-none p-0 bg-transparent placeholder-gray-400 flex-1 mr-4 text-gray-800"
          />
          <Tooltip title={isPinned ? "Bỏ ghim" : "Ghim ghi chú"}>
              <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:bg-black/5'}`}
              >
                  <Pin size={22} fill={isPinned ? "currentColor" : "none"} />
              </button>
          </Tooltip>
      </div>
  );

  // --- CUSTOM FOOTER ---
  const CustomFooter = (
      <div className={`flex justify-between items-center px-4 py-3 border-t-2 ${currentStyle.border} ${currentStyle.footer} rounded-b-xl`}>
          {/* HIỂN THỊ THỜI GIAN EDIT (Chỉ hiện ở Modal) */}
          <div className="text-xs text-gray-500 font-semibold select-none">
              {note ? `Đã chỉnh sửa ${dayjs(note.updatedAt || note.createdAt).fromNow()}` : ''}
          </div>
          
          <div className="flex items-center gap-2">
              {/* Nút Chọn Màu (Click Dropdown) */}
              <Dropdown menu={{ items: colorMenu }} trigger={['click']} placement="top">
                  <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Đổi màu">
                      <Palette size={20} />
                  </button>
              </Dropdown>

              <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Thêm ảnh">
                  <Image size={20} />
              </button>
              
              <button onClick={() => { note && onArchive?.(note.id); onClose(); }} className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Lưu trữ">
                  <Archive size={20} />
              </button>
              
              <button onClick={() => { note && onDelete?.(note.id); onClose(); }} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors" title="Xóa">
                  <Trash2 size={20} />
              </button>

              <button
                  onClick={handleClose}
                  className="px-6 py-2 ml-4 bg-transparent hover:bg-black/5 text-gray-900 font-bold rounded-md text-sm transition-colors"
              >
                  Đóng
              </button>
          </div>
      </div>
  );

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null} // Tắt footer mặc định
      title={null}  // Tắt title mặc định
      closeIcon={null}
      width={600}
      destroyOnClose
      centered
      // Dùng modalRender để CUSTOM TOÀN BỘ khung Modal
      modalRender={(dom) => (
        <div 
            className={`rounded-2xl border-[3px] ${currentStyle.border} overflow-hidden shadow-2xl flex flex-col`}
            style={{ pointerEvents: 'auto' }} // Đảm bảo click được
        >
            {/* Header Tự Làm */}
            {CustomHeader}
            
            {/* Body Nội dung */}
            <div className={`px-6 pb-6 pt-2 ${currentStyle.body} min-h-[150px]`}>
                <Input.TextArea
                    placeholder="Ghi chú..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    autoSize={{ minRows: 5, maxRows: 20 }}
                    className="text-lg text-gray-800 border-none shadow-none focus:shadow-none p-0 bg-transparent resize-none leading-relaxed"
                />
            </div>

            {/* Footer Tự Làm */}
            {CustomFooter}
        </div>
      )}
    />
  );
};

export default NoteModal;