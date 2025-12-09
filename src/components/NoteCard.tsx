import React from 'react';
import { Note } from '../types';
import { Pin, Trash2, Archive, RotateCcw, Clock, Palette } from 'lucide-react';
import { Typography, Dropdown, MenuProps } from 'antd';

const { Paragraph } = Typography;

// Bộ màu chuẩn (Hex lưu DB - Class hiển thị Tailwind)
export const NOTE_COLORS = [
  { hex: '#ffffff', name: 'Trắng', body: 'bg-white', footer: 'bg-gray-50', border: 'border-gray-200' },
  { hex: '#f0f9ff', name: 'Xanh', body: 'bg-sky-50', footer: 'bg-sky-100', border: 'border-sky-200' },
  { hex: '#fdf2f8', name: 'Hồng', body: 'bg-pink-50', footer: 'bg-pink-100', border: 'border-pink-200' },
  { hex: '#fff7ed', name: 'Cam', body: 'bg-orange-50', footer: 'bg-orange-100', border: 'border-orange-200' },
  { hex: '#f0fdf4', name: 'Xanh Lá', body: 'bg-green-50', footer: 'bg-green-100', border: 'border-green-200' },
  { hex: '#faf5ff', name: 'Tím', body: 'bg-purple-50', footer: 'bg-purple-100', border: 'border-purple-200' },
  { hex: '#fefce8', name: 'Vàng', body: 'bg-yellow-50', footer: 'bg-yellow-100', border: 'border-yellow-200' },
];

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: number) => void;
  onArchive?: (id: number) => void;
  onRestore?: (id: number) => void;
  onPin?: (id: number) => void;
  onChangeColor?: (id: number, color: string) => void; // Prop mới
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit, onPin, onArchive, onRestore, onChangeColor }) => {
  
  const formattedDate = new Date(note.createdAt || new Date()).toLocaleString('vi-VN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Tìm style dựa trên mã màu từ DB
  const currentStyle = NOTE_COLORS.find(c => c.hex === note.backgroundColor) || NOTE_COLORS[0];

  const colorMenu: MenuProps['items'] = NOTE_COLORS.map((color) => ({
    key: color.hex,
    label: (
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full border border-gray-300 ${color.body}`}></div>
        <span className="text-xs">{color.name}</span>
      </div>
    ),
    onClick: (e) => {
        e.domEvent.stopPropagation();
        onChangeColor?.(note.id, color.hex);
    }
  }));

  const coverImage = note.attachments?.find(a => a.fileType.startsWith('image/'))?.filePath;

  return (
    <div className={`group relative rounded-2xl mb-4 transition-all duration-300 border ${currentStyle.border} flex flex-col overflow-hidden shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]`}>
      
      {/* Body: Click để sửa */}
      <div 
        onClick={() => !note.isDeleted && onEdit?.(note)}
        className={`flex-1 flex flex-col cursor-pointer ${currentStyle.body} transition-colors duration-300`}
      >
        {coverImage && (
            <div className="w-full h-40 overflow-hidden border-b border-black/5">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
            </div>
        )}

        <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 gap-2">
                {note.title && <h3 className="font-bold text-gray-800 text-lg leading-snug">{note.title}</h3>}
                {!note.isDeleted && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPin?.(note.id); }}
                        className={`p-1.5 rounded-full transition-all ${note.isPinned ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-black/10 opacity-0 group-hover:opacity-100'}`}
                    >
                        <Pin size={16} fill={note.isPinned ? "currentColor" : "none"} />
                    </button>
                )}
            </div>
            
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                <Paragraph ellipsis={{ rows: 6, expandable: false }} className="text-gray-700 mb-0 !text-sm">
                    {note.content}
                </Paragraph>
            </div>
        </div>
      </div>

      {/* Footer: Các nút hành động */}
      <div className={`px-3 py-2 ${currentStyle.footer} flex justify-between items-center border-t border-black/5 transition-colors duration-300`}>
          <span className="text-[10px] font-bold text-gray-500/70 flex items-center gap-1">
            <Clock size={12} /> {formattedDate}
          </span>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {!note.isDeleted ? (
                <>
                    {/* Menu chọn màu */}
                    <Dropdown menu={{ items: colorMenu }} trigger={['click']} placement="top">
                        <button onClick={(e) => e.stopPropagation()} className="p-1.5 hover:bg-black/10 rounded-full text-gray-600 transition-colors" title="Đổi màu">
                            <Palette size={16} />
                        </button>
                    </Dropdown>

                    <button onClick={(e) => {e.stopPropagation(); onArchive?.(note.id)}} className="p-1.5 hover:bg-black/10 rounded-full text-gray-600 transition-colors" title="Lưu trữ"><Archive size={16} /></button>
                    <button onClick={(e) => {e.stopPropagation(); onDelete?.(note.id)}} className="p-1.5 hover:bg-red-100 rounded-full text-red-500 transition-colors" title="Xóa"><Trash2 size={16} /></button>
                </>
            ) : (
                <>
                    <button onClick={(e) => {e.stopPropagation(); onRestore?.(note.id)}} className="p-1.5 hover:bg-green-100 rounded-full text-green-600 transition-colors" title="Khôi phục"><RotateCcw size={16} /></button>
                    <button onClick={(e) => {e.stopPropagation(); onDelete?.(note.id)}} className="p-1.5 hover:bg-red-100 rounded-full text-red-500 transition-colors" title="Xóa vĩnh viễn"><Trash2 size={16} /></button>
                </>
            )}
          </div>
      </div>
    </div>
  );
};

export default NoteCard;