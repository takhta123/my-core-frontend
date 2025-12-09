import React from 'react';
import { Note } from '../types';
import { Pin, Trash2, Archive, RotateCcw, Palette, Clock } from 'lucide-react';
import { Typography, Dropdown, MenuProps } from 'antd';

const { Paragraph } = Typography;

// Export để dùng chung
export const NOTE_COLORS = [
  { hex: '#ffffff', name: 'Trắng', body: 'bg-white', footer: 'bg-gray-100', border: 'border-gray-300' },
  { hex: '#f0f9ff', name: 'Xanh Dương', body: 'bg-sky-50', footer: 'bg-sky-200', border: 'border-sky-300' },
  { hex: '#fdf2f8', name: 'Hồng', body: 'bg-pink-50', footer: 'bg-pink-200', border: 'border-pink-300' },
  { hex: '#fff7ed', name: 'Cam', body: 'bg-orange-50', footer: 'bg-orange-200', border: 'border-orange-300' },
  { hex: '#f0fdf4', name: 'Xanh Lá', body: 'bg-green-50', footer: 'bg-green-200', border: 'border-green-300' },
  { hex: '#faf5ff', name: 'Tím', body: 'bg-purple-50', footer: 'bg-purple-200', border: 'border-purple-300' },
  { hex: '#fefce8', name: 'Vàng', body: 'bg-yellow-50', footer: 'bg-yellow-200', border: 'border-yellow-300' },
];

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: number) => void;
  onArchive?: (id: number) => void;
  onRestore?: (id: number) => void;
  onPin?: (id: number) => void;
  onChangeColor?: (id: number, color: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete, onEdit, onPin, onArchive, onRestore, onChangeColor }) => {
  
  const formattedDate = new Date(note.createdAt || new Date()).toLocaleString('vi-VN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Tìm style border/footer tương ứng (So sánh không phân biệt hoa thường)
  const currentStyle = NOTE_COLORS.find(c => c.hex.toLowerCase() === (note.backgroundColor || '#ffffff').toLowerCase()) || NOTE_COLORS[0];

  const colorMenu: MenuProps['items'] = NOTE_COLORS.map((color) => ({
    key: color.hex,
    label: (
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full border border-gray-300`} style={{ backgroundColor: color.hex }}></div>
        <span className="text-sm font-medium text-gray-700">{color.name}</span>
      </div>
    ),
    onClick: (e) => {
        e.domEvent.stopPropagation();
        onChangeColor?.(note.id, color.hex);
    }
  }));

  const coverImage = note.attachments?.find(a => a.fileType.startsWith('image/'))?.filePath;

  return (
    <div 
      className={`group relative rounded-2xl mb-4 transition-all duration-300 border-[3px] ${currentStyle.border} flex flex-col overflow-hidden shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1`}
    >
      {/* Body: Click để sửa */}
      <div 
        onClick={() => !note.isDeleted && onEdit?.(note)}
        // QUAN TRỌNG: Thêm style backgroundColor trực tiếp
        className={`flex-1 flex flex-col cursor-pointer transition-colors duration-300`}
        style={{ backgroundColor: note.backgroundColor || '#ffffff' }}
      >
        {coverImage && (
            <div className={`w-full h-40 overflow-hidden border-b-2 ${currentStyle.border}`}>
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
            </div>
        )}

        <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 gap-2">
                {note.title && <h3 className="font-bold text-gray-800 text-lg leading-snug">{note.title}</h3>}
                {!note.isDeleted && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPin?.(note.id); }}
                        className={`p-1.5 rounded-full transition-all ${note.isPinned ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-black/5 opacity-0 group-hover:opacity-100'}`}
                    >
                        <Pin size={18} fill={note.isPinned ? "currentColor" : "none"} />
                    </button>
                )}
            </div>
            
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                <Paragraph ellipsis={{ rows: 6, expandable: false }} className="text-gray-700 mb-0 !text-sm">
                    {note.content}
                </Paragraph>
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`px-4 py-3 ${currentStyle.footer} flex justify-end items-center border-t-2 ${currentStyle.border} min-h-[48px] transition-colors duration-300`}>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {!note.isDeleted ? (
                <>
                    {/* Bọc div chặn sự kiện click lan ra ngoài */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <Dropdown menu={{ items: colorMenu }} trigger={['click']} placement="top">
                            <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Đổi màu">
                                <Palette size={18} />
                            </button>
                        </Dropdown>
                    </div>

                    <button onClick={(e) => {e.stopPropagation(); onArchive?.(note.id)}} className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Lưu trữ"><Archive size={18} /></button>
                    <button onClick={(e) => {e.stopPropagation(); onDelete?.(note.id)}} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors" title="Xóa"><Trash2 size={18} /></button>
                </>
            ) : (
                <>
                    <button onClick={(e) => {e.stopPropagation(); onRestore?.(note.id)}} className="p-2 hover:bg-green-100 rounded-full text-green-700 transition-colors" title="Khôi phục"><RotateCcw size={18} /></button>
                    <button onClick={(e) => {e.stopPropagation(); onDelete?.(note.id)}} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors" title="Xóa vĩnh viễn"><Trash2 size={18} /></button>
                </>
            )}
          </div>
      </div>
    </div>
  );
};

export default NoteCard;