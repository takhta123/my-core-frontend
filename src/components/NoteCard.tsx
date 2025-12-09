import React from 'react';
import { Note } from '../types';
import { Pin, Trash2, Archive, RotateCcw, Clock, Palette, CheckSquare } from 'lucide-react';
import { Typography, Dropdown, MenuProps } from 'antd'; // Dùng Dropdown của Antd cho menu màu

const { Paragraph } = Typography;

// --- ĐỊNH NGHĨA BỘ MÀU (HEX để lưu DB + Class Tailwind để hiển thị) ---
export const NOTE_COLORS = [
  { hex: '#ffffff', name: 'White', body: 'bg-white', footer: 'bg-gray-100', border: 'border-gray-200' },
  { hex: '#f0f9ff', name: 'Blue', body: 'bg-sky-50', footer: 'bg-sky-200', border: 'border-sky-200' },
  { hex: '#fdf2f8', name: 'Pink', body: 'bg-pink-50', footer: 'bg-pink-200', border: 'border-pink-200' },
  { hex: '#fff7ed', name: 'Orange', body: 'bg-orange-50', footer: 'bg-orange-200', border: 'border-orange-200' },
  { hex: '#f0fdf4', name: 'Green', body: 'bg-green-50', footer: 'bg-green-200', border: 'border-green-200' },
  { hex: '#faf5ff', name: 'Purple', body: 'bg-purple-50', footer: 'bg-purple-200', border: 'border-purple-200' },
  { hex: '#fefce8', name: 'Yellow', body: 'bg-yellow-50', footer: 'bg-yellow-200', border: 'border-yellow-200' },
];

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: number) => void;
  onArchive?: (id: number) => void;
  onRestore?: (id: number) => void;
  onPin?: (id: number) => void;
  onChangeColor?: (id: number, color: string) => void; // Thêm prop đổi màu
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit, onPin, onArchive, onRestore, onChangeColor }) => {
  
  const formattedDate = new Date(note.createdAt || new Date()).toLocaleString('vi-VN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const previewChecklists = note.checklists ? note.checklists.slice(0, 3) : [];
  const remainingChecklists = note.checklists ? Math.max(0, note.checklists.length - 3) : 0;
  const coverImage = note.attachments?.find(a => a.fileType.startsWith('image/'))?.filePath;

  // Lấy style dựa trên màu hiện tại của note (hoặc mặc định White)
  const currentStyle = NOTE_COLORS.find(c => c.hex === note.backgroundColor) || NOTE_COLORS[0];

  // Menu chọn màu cho Dropdown
  const colorMenu: MenuProps['items'] = NOTE_COLORS.map((color) => ({
    key: color.hex,
    label: (
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full border border-gray-200 ${color.body}`}></div>
        <span>{color.name}</span>
      </div>
    ),
    onClick: (e) => {
        e.domEvent.stopPropagation(); // Chặn click lan ra ngoài (để không mở modal edit)
        onChangeColor?.(note.id, color.hex);
    }
  }));

  return (
    <div 
      // Áp dụng style border động
      className={`group relative rounded-2xl mb-4 transition-all duration-300 border-2 ${currentStyle.border} flex flex-col overflow-hidden shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-1`}
    >
      {/* 1. CLICK VÀO ĐÂY ĐỂ SỬA (Đã fix lỗi mất khả năng sửa) */}
      <div 
        onClick={() => !note.isDeleted && onEdit?.(note)}
        className={`flex-1 flex flex-col cursor-pointer ${currentStyle.body}`} // Áp dụng background body động
      >
        {coverImage && (
            <div className="w-full h-32 overflow-hidden border-b border-black/5">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
            </div>
        )}

        <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 gap-2">
                {note.title && (
                    <h3 className="font-bold text-gray-800 text-lg break-words leading-tight line-clamp-2">
                        {note.title}
                    </h3>
                )}
                {!note.isDeleted && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPin?.(note.id); }}
                        className={`p-1.5 rounded-full transition-colors ${note.isPinned ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-white/50 opacity-0 group-hover:opacity-100'}`}
                    >
                        <Pin size={16} fill={note.isPinned ? "currentColor" : "none"} />
                    </button>
                )}
            </div>
            
            <div className="text-gray-700 text-sm leading-relaxed mb-3 break-words whitespace-pre-wrap">
                {note.checklists && note.checklists.length > 0 ? (
                    <div className="space-y-1.5">
                        {previewChecklists.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 rounded-sm border flex-shrink-0 flex items-center justify-center ${item.completed ? 'bg-blue-400 border-blue-400' : 'border-gray-500'}`}>
                                    {item.completed && <span className="text-white text-[10px] font-bold">✓</span>}
                                </div>
                                <span className={`truncate text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                    {item.content}
                                </span>
                            </div>
                        ))}
                        {remainingChecklists > 0 && <div className="text-xs text-gray-500 pl-6 font-medium">+ {remainingChecklists} mục khác</div>}
                    </div>
                ) : (
                    <Paragraph ellipsis={{ rows: 6, expandable: false }} className="text-gray-700 mb-0 !text-sm">
                        {note.content}
                    </Paragraph>
                )}
            </div>
        </div>
      </div>

      {/* 2. FOOTER (Màu đậm hơn body) */}
      <div className={`px-4 py-2 ${currentStyle.footer} flex justify-between items-center border-t border-black/5 min-h-[40px]`}>
          <span className="text-[10px] font-bold text-gray-500/70 flex items-center gap-1">
            <Clock size={12} /> {formattedDate}
          </span>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {!note.isDeleted ? (
                <>
                    {/* Nút Đổi màu (Mới) */}
                    <Dropdown menu={{ items: colorMenu }} trigger={['click']} placement="top">
                        <button onClick={(e) => e.stopPropagation()} className="p-1.5 hover:bg-white/40 rounded-full text-gray-700 transition-colors" title="Đổi màu">
                            <Palette size={15} />
                        </button>
                    </Dropdown>

                    {/* Đã xóa nút Edit (Cây bút) theo yêu cầu */}

                    <button onClick={(e) => {e.stopPropagation(); onArchive?.(note.id)}} className="p-1.5 hover:bg-white/40 rounded-full text-gray-700 transition-colors" title="Lưu trữ"><Archive size={15} /></button>
                    <button onClick={(e) => {e.stopPropagation(); onDelete?.(note.id)}} className="p-1.5 hover:bg-red-100 rounded-full text-red-500 transition-colors" title="Xóa"><Trash2 size={15} /></button>
                </>
            ) : (
                <>
                    <button onClick={(e) => {e.stopPropagation(); onRestore?.(note.id)}} className="p-1.5 hover:bg-green-100 rounded-full text-green-600 transition-colors" title="Khôi phục"><RotateCcw size={15} /></button>
                    <button onClick={(e) => {e.stopPropagation(); onDelete?.(note.id)}} className="p-1.5 hover:bg-red-100 rounded-full text-red-500 transition-colors" title="Xóa vĩnh viễn"><Trash2 size={15} /></button>
                </>
            )}
          </div>
      </div>
    </div>
  );
};

export default NoteCard;