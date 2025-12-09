import React, { useEffect, useState, useRef } from 'react';
import { Modal, Dropdown, MenuProps, message, Tooltip } from 'antd';
import { Note, NoteRequest } from '../types';
import { noteApi } from '../api/axiosClient';
import { Pin, Trash2, Archive, Image, Palette } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { NOTE_COLORS } from './NoteCard';

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
  const [bgColor, setBgColor] = useState('#ffffff');
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
        title, content, isPinned,
        isArchived: note.isArchived,
        backgroundColor: bgColor,
        reminder: note.reminder
      };

      const response: any = await noteApi.update(note.id, updateData);
      if (response.code === 1000) {
        onUpdate(response.result);
        onClose();
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => handleSave();
  const currentStyle = NOTE_COLORS.find(c => c.hex === bgColor) || NOTE_COLORS[0];

  const colorMenu: MenuProps['items'] = NOTE_COLORS.map((color) => ({
    key: color.hex,
    label: (
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full border border-gray-300 ${color.body}`}></div>
        <span className="text-xs">{color.name}</span>
      </div>
    ),
    onClick: () => setBgColor(color.hex)
  }));

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null} title={null} closeIcon={null}
      width={600} destroyOnClose centered
      modalRender={() => (
        <div 
            className={`rounded-2xl border-[3px] ${currentStyle.border} overflow-hidden shadow-2xl flex flex-col transition-colors duration-300`}
            style={{ pointerEvents: 'auto', backgroundColor: bgColor }}
        >
            {/* Header: Title + Pin */}
            <div className={`flex justify-between items-start px-6 pt-5 pb-2 ${currentStyle.body}`}>
                <input
                    type="text"
                    placeholder="Tiêu đề"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    // SỬA: text-2xl -> text-lg (cho vừa mắt), font-bold -> font-semibold
                    className="w-full text-lg font-semibold placeholder-gray-500 border-none outline-none bg-transparent text-gray-800 flex-1 mr-4"
                />
                <Tooltip title={isPinned ? "Bỏ ghim" : "Ghim"}>
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-black/10'}`}
                    >
                        <Pin size={20} fill={isPinned ? "currentColor" : "none"} />
                    </button>
                </Tooltip>
            </div>
            
            {/* Body: Content */}
            <div className={`px-6 pb-6 pt-2 ${currentStyle.body} min-h-[150px]`}>
                <textarea
                    placeholder="Ghi chú..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    // SỬA: text-lg -> text-sm (14px) hoặc text-base (16px)
                    className="w-full h-full text-sm font-medium text-gray-800 border-none outline-none bg-transparent resize-none leading-relaxed"
                    style={{ minHeight: '150px' }}
                />
            </div>

            {/* Footer */}
            <div className={`flex justify-between items-center px-4 py-3 border-t-2 ${currentStyle.border} ${currentStyle.footer} transition-colors duration-300`}>
                <div className="text-[10px] text-gray-500 font-semibold select-none">
                    {note ? `Đã chỉnh sửa ${dayjs(note.updatedAt || note.createdAt).fromNow()}` : ''}
                </div>
                
                <div className="flex items-center gap-1">
                    <Dropdown menu={{ items: colorMenu }} trigger={['click']} placement="top">
                        <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Đổi màu">
                            <Palette size={18} />
                        </button>
                    </Dropdown>

                    <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"><Image size={18} /></button>
                    <button onClick={() => { note && onArchive?.(note.id); onClose(); }} className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"><Archive size={18} /></button>
                    <button onClick={() => { note && onDelete?.(note.id); onClose(); }} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors"><Trash2 size={18} /></button>

                    <button
                        onClick={handleClose}
                        className="px-5 py-1.5 ml-3 bg-transparent hover:bg-black/5 text-gray-900 font-bold rounded-md text-xs transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
      )}
    />
  );
};

export default NoteModal;