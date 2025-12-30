import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, List, message, Popconfirm } from 'antd';
import { Edit2, Trash2, Check, X, Plus, Tag } from 'lucide-react';
import { Label } from '../types';
import { labelApi } from '../api/axiosClient';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void; // Callback để reload sidebar
}

const LabelManagerModal: React.FC<Props> = ({ isOpen, onClose, onUpdate }) => {
    const [labels, setLabels] = useState<Label[]>([]);
    const [newLabel, setNewLabel] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        if (isOpen) fetchLabels();
    }, [isOpen]);

    const fetchLabels = async () => {
        try {
            const res: any = await labelApi.getAll();
            if (res.code === 1000) setLabels(res.result);
        } catch (e) { console.error(e); }
    };

    const handleCreate = async () => {
        if (!newLabel.trim()) return;
        try {
            await labelApi.create({ name: newLabel });
            setNewLabel('');
            fetchLabels();
            onUpdate();
        } catch (e) { message.error('Lỗi tạo nhãn'); }
    };

    const handleDelete = async (id: number) => {
        try {
            await labelApi.delete(id);
            message.success('Đã xóa nhãn');
            fetchLabels();
            onUpdate();
        } catch (e) { message.error('Lỗi xóa nhãn'); }
    };

    const handleRename = async (id: number) => {
        if (!editName.trim()) return;
        try {
            await labelApi.update(id, { name: editName });
            setEditingId(null);
            fetchLabels();
            onUpdate();
            message.success('Đã đổi tên');
        } catch (e) { message.error('Lỗi đổi tên'); }
    };

    return (
        <Modal 
            title="Chỉnh sửa nhãn" open={isOpen} onCancel={onClose} footer={null} width={400}
        >
            <div className="flex gap-2 mb-4">
                <Input 
                    prefix={<Plus size={16} className="text-gray-400"/>}
                    placeholder="Tạo nhãn mới" 
                    value={newLabel} onChange={e => setNewLabel(e.target.value)}
                    onPressEnter={handleCreate}
                />
                <Button type="text" onClick={handleCreate} disabled={!newLabel.trim()}>Tạo</Button>
            </div>

            <List
                dataSource={labels}
                renderItem={(item) => (
                    <List.Item className="group hover:bg-gray-50 px-2 rounded-md transition-colors">
                        {editingId === item.id ? (
                            <div className="flex w-full items-center gap-2">
                                <Input 
                                    value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                                    onPressEnter={() => handleRename(item.id)}
                                />
                                <Button size="small" icon={<Check size={14}/>} type="text" className="text-green-600" onClick={() => handleRename(item.id)}/>
                                <Button size="small" icon={<X size={14}/>} type="text" onClick={() => setEditingId(null)}/>
                            </div>
                        ) : (
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Tag size={16} className="text-gray-500" />
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                </div>
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button type="text" icon={<Edit2 size={14}/>} onClick={() => { setEditingId(item.id); setEditName(item.name); }} />
                                    <Popconfirm title="Xóa nhãn này?" onConfirm={() => handleDelete(item.id)}>
                                        <Button type="text" icon={<Trash2 size={14}/>} danger />
                                    </Popconfirm>
                                </div>
                            </div>
                        )}
                    </List.Item>
                )}
            />
             <div className="mt-4 text-right">
                <Button onClick={onClose}>Xong</Button>
            </div>
        </Modal>
    );
};
export default LabelManagerModal;