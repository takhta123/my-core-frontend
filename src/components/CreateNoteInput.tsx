import React, { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import { Image, CheckSquare, Brush } from 'lucide-react'; 
import { noteApi } from '../api/axiosClient';
import { NoteRequest } from '../types';

interface CreateNoteInputProps {
  onSuccess?: () => void; // Callback để reload danh sách sau khi tạo xong
}

const CreateNoteInput: React.FC<CreateNoteInputProps> = ({ onSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Xử lý click ra ngoài để đóng form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCollapse();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title, content]);

  const handleCollapse = () => {
    if (title.trim() || content.trim()) {
        handleSubmit(); // Tự động lưu khi đóng nếu có nội dung
    }
    setIsExpanded(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) return;

    const newNote: NoteRequest = {
      title: title,
      content: content,
      isPinned: false,
      isArchived: false,
      backgroundColor: '#ffffff'
    };

    try {
      await noteApi.create(newNote);
      message.success('Đã tạo ghi chú');
      setTitle('');
      setContent('');
      if (onSuccess) onSuccess(); // Gọi reload list bên HomePage
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tạo ghi chú');
    }
  };

  return (
    <div className="flex justify-center mb-8 mt-4">
      <div 
        ref={containerRef}
        className={`bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-200 w-full max-w-[600px] ${isExpanded ? 'p-4' : 'p-0'}`}
      >
        {!isExpanded ? (
          // --- TRẠNG THÁI ĐÓNG (Thu gọn) ---
          <div 
            className="flex items-center justify-between p-3 cursor-text text-gray-600 font-medium"
            onClick={() => setIsExpanded(true)}
          >
            <span>Tạo ghi chú...</span>
            <div className="flex gap-4 text-gray-500">
              <CheckSquare size={20} />
              <Brush size={20} />
              <Image size={20} />
            </div>
          </div>
        ) : (
          // --- TRẠNG THÁI MỞ (Nhập liệu) ---
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold placeholder-gray-500 border-none outline-none bg-transparent"
            />
            
            <textarea
              placeholder="Ghi chú..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none border-none outline-none bg-transparent text-gray-700 min-h-[100px]"
              autoFocus
            />

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-transparent">
               <div className="flex gap-3 text-gray-500">
                  <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Brush size={18}/></button>
                  <button className="hover:bg-gray-100 p-2 rounded-full transition-colors"><Image size={18}/></button>
               </div>
               
               <button 
                onClick={handleCollapse}
                className="px-6 py-2 bg-transparent hover:bg-gray-100 text-gray-700 font-medium rounded text-sm transition-colors"
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