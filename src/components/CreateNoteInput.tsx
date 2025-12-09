import React, { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import { Image, CheckSquare, Paintbrush, Pin, Archive, Trash2, RotateCcw, Palette } from 'lucide-react'; 
import { noteApi } from '../api/axiosClient';
import { Note, NoteRequest } from '../types';

// Định nghĩa bộ màu (Copy từ NoteCard sang để dùng chung nếu cần, hoặc import)
const NOTE_COLORS = [
  { hex: '#ffffff', name: 'Trắng', body: 'bg-white' },
  { hex: '#f0f9ff', name: 'Xanh', body: 'bg-sky-50' },
  { hex: '#fdf2f8', name: 'Hồng', body: 'bg-pink-50' },
  { hex: '#fff7ed', name: 'Cam', body: 'bg-orange-50' },
  { hex: '#f0fdf4', name: 'Xanh Lá', body: 'bg-green-50' },
  { hex: '#faf5ff', name: 'Tím', body: 'bg-purple-50' },
  { hex: '#fefce8', name: 'Vàng', body: 'bg-yellow-50' },
];

interface CreateNoteInputProps {
  onSuccess?: () => void;      // Callback khi tạo mới thành công
  existingNote?: Note | null;  // Dữ liệu note cần sửa (nếu có)
  onUpdate?: (note: Note) => void; // Callback khi cập nhật thành công
  onClose?: () => void;        // Callback đóng form (dùng khi edit)
}

const CreateNoteInput: React.FC<CreateNoteInputProps> = ({ onSuccess, existingNote, onUpdate, onClose }) => {
  // Nếu có existingNote thì mặc định là đang mở (true), ngược lại là đóng (false)
  const [isExpanded, setIsExpanded] = useState(!!existingNote);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isPinned, setIsPinned] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load dữ liệu cũ nếu đang ở chế độ Edit
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title || '');
      setContent(existingNote.content || '');
      setBgColor(existingNote.backgroundColor || '#ffffff');
      setIsPinned(existingNote.isPinned);
      setIsExpanded(true); // Luôn mở khi edit
    }
  }, [existingNote]);

  // Xử lý click ra ngoài để đóng/lưu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isExpanded) {
             handleCollapse();
        }
      }
    };
    // Chỉ bắt sự kiện click ra ngoài nếu KHÔNG PHẢI đang edit trong Modal (vì Modal có lớp phủ riêng)
    // Nhưng với thiết kế Overlay mới, click vào overlay sẽ đóng, nên ta có thể bỏ qua check này ở đây
    // hoặc giữ nguyên logic tự đóng cho trường hợp tạo mới.
    if (!existingNote) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, title, content, bgColor, isPinned, existingNote]);

  const handleCollapse = () => {
    if (title.trim() || content.trim()) {
        handleSubmit();
    } else {
        // Nếu rỗng mà đang edit thì cứ đóng thôi
        if (existingNote && onClose) onClose();
    }
    if (!existingNote) setIsExpanded(false);
  };

  const handleSubmit = async () => {
    // Logic lưu dữ liệu (Chung cho cả Tạo và Sửa)
    if (!title.trim() && !content.trim()) return;

    try {
      const noteData: NoteRequest = {
        title,
        content,
        isPinned,
        isArchived: existingNote ? existingNote.isArchived : false,
        backgroundColor: bgColor,
        reminder: existingNote ? existingNote.reminder : null
      };

      if (existingNote) {
        // --- LOGIC CẬP NHẬT ---
        const response: any = await noteApi.update(existingNote.id, noteData);
        if (response.code === 1000) {
            // message.success('Đã cập nhật'); // Google Keep thường lưu thầm lặng
            if (onUpdate) onUpdate(response.result);
            if (onClose) onClose();
        }
      } else {
        // --- LOGIC TẠO MỚI ---
        const response: any = await noteApi.create(noteData);
        if (response.code === 1000) {
            message.success('Ghi chú đã được lưu');
            // Reset form
            setTitle('');
            setContent('');
            setBgColor('#ffffff');
            setIsPinned(false);
            if (onSuccess) onSuccess();
        }
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu');
    }
  };

  // Tìm class màu nền tương ứng để hiển thị
  const currentStyle = NOTE_COLORS.find(c => c.hex === bgColor) || NOTE_COLORS[0];

  return (
    <div className={`flex justify-center transition-all duration-300 ${existingNote ? 'w-full' : 'mb-8 mt-2 px-2'}`}>
      <div 
        ref={containerRef}
        className={`rounded-2xl border border-gray-200 shadow-[0_2px_5px_rgba(0,0,0,0.1)] transition-all duration-200 w-full ${existingNote ? '' : 'max-w-[600px]'} overflow-hidden ${isExpanded ? 'shadow-lg' : ''} ${currentStyle.body}`}
        style={{ backgroundColor: bgColor }} // Fallback nếu class tailwind không chạy
      >
        {!isExpanded ? (
          // --- TRẠNG THÁI ĐÓNG (Chỉ hiện khi Tạo mới) ---
          <div 
            className="flex items-center justify-between p-3 px-4 cursor-text"
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-gray-500 font-medium text-base">Tạo ghi chú mới...</span>
            <div className="flex gap-3 text-gray-400">
              <CheckSquare size={20} />
              <Paintbrush size={20} />
              <Image size={20} />
            </div>
          </div>
        ) : (
          // --- TRẠNG THÁI MỞ (Edit & Create Expanded) ---
          <div className="flex flex-col">
            {/* Header: Title + Pin */}
            <div className="flex justify-between items-start px-4 pt-4 pb-2">
                <input
                type="text"
                placeholder="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-bold placeholder-gray-500 border-none outline-none bg-transparent"
                />
                <button 
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-black/10 text-black' : 'text-gray-400 hover:bg-black/5'}`}
                >
                    <Pin size={20} fill={isPinned ? "currentColor" : "none"} />
                </button>
            </div>
            
            {/* Body: Content */}
            <textarea
              placeholder="Ghi chú..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 resize-none border-none outline-none bg-transparent text-gray-800 min-h-[100px] text-base"
              autoFocus={!existingNote} // Chỉ autofocus khi tạo mới
            />

            {/* Footer: Tools + Close */}
            <div className="flex justify-between items-center px-2 py-2 mt-2">
               <div className="flex gap-1 text-gray-500">
                  {/* Color Palette Logic đơn giản (Click để đổi ngẫu nhiên hoặc làm dropdown sau) */}
                  <div className="group relative">
                      <button className="hover:bg-black/5 p-2 rounded-full transition-colors"><Palette size={18}/></button>
                      {/* Menu màu mini (Hiện khi hover) */}
                      <div className="absolute bottom-full left-0 mb-2 p-2 bg-white shadow-lg rounded-lg border flex gap-1 hidden group-hover:flex z-50">
                          {NOTE_COLORS.map(c => (
                              <div 
                                key={c.hex} 
                                onClick={() => setBgColor(c.hex)}
                                className={`w-6 h-6 rounded-full border cursor-pointer ${c.body} hover:scale-110 transition-transform`}
                                title={c.name}
                              ></div>
                          ))}
                      </div>
                  </div>
                  
                  <button className="hover:bg-black/5 p-2 rounded-full transition-colors"><Image size={18}/></button>
                  <button className="hover:bg-black/5 p-2 rounded-full transition-colors"><Archive size={18}/></button>
               </div>
               
               <button 
                onClick={existingNote ? handleCollapse : handleCollapse}
                className="px-6 py-2 bg-transparent hover:bg-black/5 text-gray-800 font-medium rounded-md text-sm transition-colors"
               >
                 Đóng
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNoteInput;