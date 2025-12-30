import React, { useEffect, useState, useRef } from 'react';
import { Modal, Dropdown, MenuProps, message, Tooltip, DatePicker, Popover, Checkbox, Input, Button, Divider, Spin } from 'antd';
import { Note, NoteRequest, Label } from '../types';
import { noteApi, labelApi, attachmentApi } from '../api/axiosClient';
import { Pin, Trash2, Archive, Image, Palette, Bell, Tag as TagIcon, Plus, X } from 'lucide-react'; 
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
  readOnly?: boolean;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, note, onClose, onUpdate, onArchive, onDelete, readOnly = false }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [reminder, setReminder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // [MỚI] Cập nhật ref để theo dõi thay đổi của cả reminder
  const initialNoteRef = useRef<{ title: string; content: string; isPinned: boolean; bgColor: string; reminder: string | null } | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
      setBgColor(note.backgroundColor || '#ffffff');
      setAttachments(note.attachments || []);
      setReminder(note.reminder || null);

      initialNoteRef.current = { 
          title: note.title, 
          content: note.content, 
          isPinned: note.isPinned, 
          bgColor: note.backgroundColor || '#ffffff',
          reminder: note.reminder || null
      };
    }
  }, [note]);

useEffect(() => {
    if (isOpen) {
      const fetchLabels = async () => {
        try {
          const res: any = await labelApi.getAll();
          if (res.code === 1000) setAllLabels(res.result);
        } catch (e) { console.error(e); }
      };
      fetchLabels();
    }
  }, [isOpen]);

  // 2. Đồng bộ nhãn của Note hiện tại vào state (để hiển thị tick xanh)
  useEffect(() => {
    if (note) {
      setSelectedLabelIds(note.labels ? note.labels.map(l => l.id) : []);
    }
  }, [note]);

  // 3. Xử lý khi tick chọn/bỏ chọn nhãn (Lưu ngay lập tức)
  const handleLabelToggle = async (labelId: number, checked: boolean) => {
    if (!note) return;
    try {
      // Gọi API cập nhật Backend
      if (checked) {
        await noteApi.addLabel(note.id, labelId);
        setSelectedLabelIds(prev => [...prev, labelId]);
      } else {
        await noteApi.removeLabel(note.id, labelId); // Cần đảm bảo axiosClient có hàm này
        setSelectedLabelIds(prev => prev.filter(id => id !== labelId));
      }

      // Cập nhật UI ngay lập tức (Optimistic UI) để NoteCard bên ngoài hiển thị nhãn mới
      const labelObj = allLabels.find(l => l.id === labelId);
      if (labelObj) {
        const currentLabels = note.labels || [];
        const newLabels = checked
          ? [...currentLabels, labelObj]
          : currentLabels.filter(l => l.id !== labelId);
        
        // Gọi callback cập nhật lên cha
        onUpdate({ ...note, labels: newLabels });
      }
    } catch (e) { message.error("Lỗi cập nhật nhãn"); }
  };

  // 4. Tạo nhãn mới nhanh
  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const res: any = await labelApi.create({ name: newLabelName });
      if (res.code === 1000) {
        const newLabel = res.result;
        setAllLabels(prev => [...prev, newLabel]);
        setNewLabelName('');
        // Tự động tick chọn nhãn vừa tạo cho ghi chú này
        if (note) handleLabelToggle(newLabel.id, true);
      }
    } catch (e) { message.error("Lỗi tạo nhãn"); }
  };

  // Nội dung menu chọn nhãn (Popover Body)
  const labelContent = (
    <div className="w-64">
      <div className="mb-2 text-xs font-semibold text-gray-500 uppercase px-1">Gắn nhãn ghi chú</div>
      <div className="max-h-48 overflow-y-auto flex flex-col gap-1 mb-2">
        {allLabels.map(label => (
          <div key={label.id} 
               className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded cursor-pointer transition-colors"
               onClick={() => handleLabelToggle(label.id, !selectedLabelIds.includes(label.id))}
          >
            <Checkbox 
              checked={selectedLabelIds.includes(label.id)} 
              className="pointer-events-none" // Để click vào div cũng ăn check
            />
            <span className="text-sm truncate select-none flex-1 text-gray-700">{label.name}</span>
          </div>
        ))}
      </div>
      <Divider className="my-2" />
      <div className="flex gap-1 px-1 pb-1">
        <Input 
          size="small" 
          placeholder="Tạo nhãn mới" 
          value={newLabelName} 
          onChange={e => setNewLabelName(e.target.value)}
          onPressEnter={handleCreateLabel}
          className="text-xs"
        />
        <Button size="small" icon={<Plus size={14}/>} onClick={handleCreateLabel}/>
      </div>
    </div>
  );

  const handleSave = async () => {
    if (!note || readOnly) return;

    const hasChanged =
      title !== initialNoteRef.current?.title ||
      content !== initialNoteRef.current?.content ||
      isPinned !== initialNoteRef.current?.isPinned ||
      bgColor !== initialNoteRef.current?.bgColor ||
      reminder !== initialNoteRef.current?.reminder; // [MỚI] Check thay đổi reminder

    if (!hasChanged) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const updateData: NoteRequest = {
        title, 
        content, 
        isPinned,
        isArchived: note.isArchived,
        backgroundColor: bgColor,
        reminder: reminder // [MỚI] Gửi reminder lên server
      };

      const response: any = await noteApi.update(note.id, updateData);
      if (response.code === 1000) {
        onUpdate(response.result);
        onClose();
        message.success("Đã lưu thay đổi"); // Thêm thông báo nhỏ
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi lưu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
      if (readOnly) onClose();
      else handleSave();
  };
  
  const currentStyle = NOTE_COLORS.find(c => c.hex.toLowerCase() === bgColor.toLowerCase()) || NOTE_COLORS[0];

  const colorMenu: MenuProps['items'] = NOTE_COLORS.map((color) => ({
    key: color.hex,
    label: (
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded-full border border-gray-300 ${color.body}`}></div>
        <span className="text-xs">{color.name}</span>
      </div>
    ),
    onClick: () => !readOnly && setBgColor(color.hex)
  }));

 const onDateChange = (date: dayjs.Dayjs | null) => {
     if (date) {
         // SỬA: Dùng format để giữ nguyên giờ Local (VD: 23:43) thay vì chuyển sang UTC (16:43)
         setReminder(date.format('YYYY-MM-DDTHH:mm:ss')); 
     } else {
         setReminder(null);
     }
  };

  const triggerFileUpload = () => {
    // Kiểm tra nếu là ghi chú mới chưa có ID
    if (!note?.id) {
        message.warning("Vui lòng lưu ghi chú trước khi tải ảnh!"); // Thêm thông báo này
        return;
    }
    
    // Kiểm tra xem ref có hoạt động không
    if (fileInputRef.current) {
        fileInputRef.current.click();
    } else {
        console.error("Input file không tìm thấy trong DOM");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !note) return;

    // Validate cơ bản (VD: < 5MB)
    if (file.size > 5 * 1024 * 1024) {
        message.error("File quá lớn (Tối đa 5MB)");
        return;
    }

    setIsUploading(true);
    try {
        const res: any = await attachmentApi.upload(file, note.id);
        if (res.code === 1000) {
            const newAttachment = res.result;
            const updatedAttachments = [...attachments, newAttachment];
            setAttachments(updatedAttachments);
            
            // Cập nhật lại UI cha
            onUpdate({ ...note, attachments: updatedAttachments });
            message.success("Đã tải ảnh lên");
        }
    } catch (error) {
        console.error(error);
        message.error("Lỗi tải ảnh");
    } finally {
        setIsUploading(false);
        // Reset input để chọn lại cùng file nếu muốn
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
      if (!note) return;
      try {
          await attachmentApi.delete(attachmentId);
          // Filter cũng so sánh số với số
          const updatedAttachments = attachments.filter(a => a.id !== attachmentId);
          setAttachments(updatedAttachments);
          onUpdate({ ...note, attachments: updatedAttachments });
          message.success("Đã xóa ảnh");
      } catch (error) {
          message.error("Lỗi xóa ảnh");
      }
  };

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
          <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
                style={{ display: 'none' }}
          />

            {/* Header */}
            <div className={`flex justify-between items-start px-6 pt-5 pb-2 ${currentStyle.body}`}>
                <input
                    type="text"
                    placeholder="Tiêu đề"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    readOnly={readOnly}
                    className={`w-full text-lg font-semibold placeholder-gray-500 border-none outline-none bg-transparent text-gray-800 flex-1 mr-4 ${readOnly ? 'cursor-default' : ''}`}
                />

              
                {!readOnly && (
                    <Tooltip title={isPinned ? "Bỏ ghim" : "Ghim"}>
                        <button onClick={() => setIsPinned(!isPinned)} className={`p-2 rounded-full transition-colors ${isPinned ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-black/10'}`}>
                            <Pin size={20} fill={isPinned ? "currentColor" : "none"} />
                        </button>
                    </Tooltip>
                )}
            </div>
            
            {/* Body */}
            <div className={`px-6 pb-2 pt-2 ${currentStyle.body}`}>
                <textarea
                    placeholder="Ghi chú..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    readOnly={readOnly}
                    className={`w-full text-sm font-medium text-gray-800 border-none outline-none bg-transparent resize-none leading-relaxed ${readOnly ? 'cursor-default' : ''}`}
                    style={{ minHeight: '150px' }}
                />
            </div>

            {!readOnly && (
                <div className={`px-6 pb-4 pt-0 ${currentStyle.body} flex items-center`}>
                     <div className="flex items-center bg-black/5 hover:bg-black/10 rounded-full px-3 py-1 transition-colors w-fit">
                        <Bell size={14} className="text-gray-600 mr-2" />
                        <DatePicker 
                            showTime={{ format: 'HH:mm' }} 
                            format="DD/MM/YYYY HH:mm" 
                            placeholder="Hẹn giờ nhắc..." 
                            value={reminder ? dayjs(reminder) : null}
                            onChange={onDateChange}
                            bordered={false}
                            suffixIcon={null}
                            allowClear={true}
                            className="bg-transparent p-0 text-xs w-[140px] !border-none !shadow-none hover:bg-transparent"
                            popupClassName="custom-datepicker-popup" // Có thể style thêm css nếu cần
                        />
                     </div>
                </div>
            )}
            {readOnly && reminder && (
                 <div className={`px-6 pb-4 pt-0 ${currentStyle.body} flex items-center gap-2 text-xs text-gray-500 font-medium`}>
                    <Bell size={14} />
                    <span>Hẹn nhắc: {dayjs(reminder).format('DD/MM/YYYY HH:mm')}</span>
                 </div>
            )}

            {attachments.length > 0 && (
                <div className={`px-6 pb-2 grid grid-cols-2 gap-2 ${currentStyle.body}`}>
                    {attachments.map(att => (
                        <div key={att.id} className="relative group rounded-lg overflow-hidden border border-black/5">
                            <img src={att.filePath} alt="Attachment" className="w-full h-32 object-cover" />
                            {!readOnly && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteAttachment(att.id); }}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                    {isUploading && (
                        <div className="flex items-center justify-center h-32 bg-black/5 rounded-lg">
                            <Spin size="small" />
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className={`flex justify-between items-center px-4 py-3 border-t-2 ${currentStyle.border} ${currentStyle.footer} transition-colors duration-300`}>
                <div className="text-[10px] text-gray-500 font-semibold select-none">
                    {readOnly ? 'Ghi chú trong thùng rác' : (note ? `Đã chỉnh sửa ${dayjs(note.updatedAt || note.createdAt).fromNow()}` : '')}
                </div>
                
                <div className="flex items-center gap-1">
                    {!readOnly && (
                        <>
                            <Dropdown menu={{ items: colorMenu }} trigger={['click']} placement="top">
                                <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Đổi màu"><Palette size={18} /></button>
                            </Dropdown>
                            <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"><Image size={18} /></button>
                            <Popover content={labelContent} trigger="click" placement="bottom" arrow={false}>
                                <button className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors" title="Gắn nhãn">
                                    <TagIcon size={18} />
                                </button>
                            </Popover>
                            <button onClick={() => { note && onArchive?.(note.id); onClose(); }} className="p-2 hover:bg-black/10 rounded-full text-gray-700 transition-colors"><Archive size={18} /></button>
                            <button onClick={() => { note && onDelete?.(note.id); onClose(); }} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors"><Trash2 size={18} /></button>
                        </>
                    )}

                    <button
                        onClick={handleClose}
                        className="px-5 py-1.5 ml-3 bg-black/5 hover:bg-black/10 text-gray-900 font-bold rounded-md text-xs transition-colors"
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