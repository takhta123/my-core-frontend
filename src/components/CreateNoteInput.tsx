import React, { useState, useRef, useEffect } from 'react';
import { message, Dropdown, MenuProps } from 'antd';
import { Image, CheckSquare, Paintbrush, Undo, Redo, Palette } from 'lucide-react'; 
import { noteApi } from '../api/axiosClient';
import { NoteRequest } from '../types';
import { NOTE_COLORS } from './NoteCard'; 

interface CreateNoteInputProps {
  onSuccess?: () => void;
}

const CreateNoteInput: React.FC<CreateNoteInputProps> = ({ onSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const containerRef = useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra xem click có nằm trong containerRef không
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isExpanded) {
             handleCollapse();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, title, content, bgColor]);

  const handleCollapse = () => {
    if (title.trim() || content.trim()) {
        handleSubmit();
    } else {
        setIsExpanded(false);
        setBgColor('#ffffff');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) return;

    const newNote: NoteRequest = {
      title: title,
      content: content,
      isPinned: false,
      isArchived: false,
      backgroundColor: bgColor // Gửi màu
    };

    try {
      await noteApi.create(newNote);
      message.success('Ghi chú đã được lưu');
      setTitle('');
      setContent('');
      setBgColor('#ffffff');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tạo ghi chú');
    } finally {
        setIsExpanded(false);
    }
  };

  const currentStyle = NOTE_COLORS.find(c => c.hex.toLowerCase() === bgColor.toLowerCase()) || NOTE_COLORS[0];

  const colorMenu: MenuProps['items'] = NOTE_COLORS.map((color) => ({
    key: color.hex,
    label: (
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full border border-gray-300`} style={{ backgroundColor: color.hex }}></div>
        <span className="text-xs">{color.name}</span>
      </div>
    ),
    onClick: () => setBgColor(color.hex)
  }));

  return (
    <div className="flex justify-center mb-8 mt-4 px-2">
      <div 
        ref={containerRef}
        // Áp dụng màu nền
        className={`rounded-xl border ${currentStyle.border} shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-300 w-full max-w-[600px] overflow-visible ${isExpanded ? 'shadow-lg' : ''}`}
        style={{ backgroundColor: bgColor }}
      >
        {!isExpanded ? (
          <div 
            className="flex items-center justify-between p-3 px-4 cursor-text"
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-gray-500 font-medium text-sm">Tạo ghi chú mới...</span>
            <div className="flex gap-4 text-gray-400">
              <CheckSquare size={20} />
              <Paintbrush size={20} />
              <Image size={20} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 pt-3 pb-2 text-base font-semibold placeholder-gray-500 border-none outline-none bg-transparent text-gray-800"
            />
            
            <textarea
              placeholder="Ghi chú..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 resize-none border-none outline-none bg-transparent text-gray-700 min-h-[100px] text-sm leading-relaxed"
              autoFocus
            />

            <div className={`flex justify-between items-center px-2 py-2 mt-2 border-t border-black/5`}>
               <div className="flex gap-1 text-gray-600 px-2">
                  <Dropdown 
                    menu={{ items: colorMenu }} 
                    trigger={['click']} 
                    placement="top"
                    // QUAN TRỌNG: Giúp dropdown render vào trong containerRef để không bị coi là "Click Outside"
                    getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                  >
                    <button className="hover:bg-black/5 p-2 rounded-full transition-colors" title="Đổi màu nền">
                        <Palette size={18}/>
                    </button>
                  </Dropdown>

                  <button className="hover:bg-black/5 p-2 rounded-full transition-colors"><Image size={18}/></button>
                  <button className="hover:bg-black/5 p-2 rounded-full transition-colors disabled:opacity-30" disabled><Undo size={18}/></button>
                  <button className="hover:bg-black/5 p-2 rounded-full transition-colors disabled:opacity-30" disabled><Redo size={18}/></button>
               </div>
               
               <button 
                onClick={handleCollapse}
                className="px-6 py-1.5 bg-transparent hover:bg-black/5 text-gray-800 font-medium rounded text-xs transition-colors mr-2"
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