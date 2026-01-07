import React, { useState, useCallback, useEffect } from 'react';
import { X, User as UserIcon, Camera, Lock, Edit2, Save, XCircle, Calendar, MapPin, Smile, Mail } from 'lucide-react';
import { User } from '../types';
import { userApi, authApi } from '../api/axiosClient';
import { message, Tabs, Input, Button, Modal, Slider, Select, DatePicker, Tag } from 'antd';
import Cropper from 'react-easy-crop';
import dayjs from 'dayjs';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('1');
  
  // --- STATE QUẢN LÝ CHẾ ĐỘ XEM / SỬA ---
  const [isEditing, setIsEditing] = useState(false);

  // --- STATE FORM DATA ---
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('OTHER');
  const [dob, setDob] = useState<dayjs.Dayjs | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // --- SYNC DỮ LIỆU KHI MỞ MODAL HOẶC USER THAY ĐỔI ---
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAddress(user.address || '');
      setGender(user.gender || 'OTHER');
      setDob(user.dateOfBirth ? dayjs(user.dateOfBirth) : null);
    }
  }, [user, isOpen]);

  // --- CROP AVATAR STATE (Giữ nguyên) ---
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // --- CHANGE PASSWORD STATE (Giữ nguyên) ---
  const [passStep, setPassStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  // --- LOGIC ẢNH (Giữ nguyên) ---
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setOriginalFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveAvatar = async () => {
    if (!originalFile || !croppedAreaPixels) return;
    try {
      setUploadingAvatar(true);
      await userApi.uploadAvatar(originalFile, croppedAreaPixels);
      message.success("Cập nhật Avatar thành công!");
      setIsCropperOpen(false);
      onUpdateUser();
    } catch (e) {
      message.error("Lỗi khi tải ảnh lên");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- LOGIC LƯU THÔNG TIN ---
  const handleUpdateInfo = async () => {
    setLoadingUpdate(true);
    try {
      await userApi.updateProfile({ 
          fullName,
          address, 
          gender, 
          dateOfBirth: dob ? dob.format('YYYY-MM-DD') : undefined 
      });
      message.success("Cập nhật thông tin thành công");
      onUpdateUser();
      setIsEditing(false); // Tắt chế độ sửa sau khi lưu thành công
    } catch (e) { 
        message.error("Lỗi cập nhật"); 
        console.error(e);
    } finally { 
        setLoadingUpdate(false); 
    }
  };

  const handleCancelEdit = () => {
    // Reset lại dữ liệu về ban đầu nếu hủy
    if (user) {
        setFullName(user.fullName || '');
        setAddress(user.address || '');
        setGender(user.gender || 'OTHER');
        setDob(user.dateOfBirth ? dayjs(user.dateOfBirth) : null);
    }
    setIsEditing(false);
  }

  // --- HELPER HIỂN THỊ GIỚI TÍNH ---
  const getGenderLabel = (val: string) => {
    switch(val) {
        case 'MALE': return 'Nam';
        case 'FEMALE': return 'Nữ';
        default: return 'Khác';
    }
  }

  // --- CHANGE PASSWORD LOGIC (Giữ nguyên) ---
  const handleSendOtp = async () => {
    if(!user?.email) return;
    setLoadingPass(true);
    try {
        await authApi.forgotPassword({ email: user.email });
        message.success(`Mã OTP đã gửi về ${user.email}`);
        setPassStep(2);
    } catch(e) { message.error("Lỗi gửi mã OTP"); }
    finally { setLoadingPass(false); }
  };

  const handleSubmitChangePass = async () => {
    if(!user?.email) return;
    setLoadingPass(true);
    try {
        await authApi.resetPassword({
            email: user.email, code: otp, newPassword: newPassword
        });
        message.success("Đổi mật khẩu thành công!");
        setPassStep(1); setOtp(''); setNewPassword('');
    } catch(e) { message.error("Mã OTP sai hoặc lỗi hệ thống"); }
    finally { setLoadingPass(false); }
  };

  if (!isOpen || !user) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative flex-shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"><X size={20}/></button>
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white overflow-hidden shadow-lg">
                        {user.avatarUrl ? (
                             <img src={user.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (<UserIcon className="w-full h-full p-4 text-gray-400"/>)}
                    </div>
                    {/* Nút Upload Avatar */}
                    <label className="absolute bottom-0 right-0 p-2 bg-white text-gray-700 rounded-full shadow-lg cursor-pointer hover:bg-blue-50 transition-all hover:scale-110 active:scale-95">
                        <Camera size={16} className="text-blue-600" />
                        <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                    </label>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{user.fullName}</h2>
                    <p className="opacity-90 font-medium tracking-wide flex items-center gap-2">
                        <Mail size={14}/> {user.email}
                    </p>
                </div>
            </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            <Tabs activeKey={activeTab} onChange={setActiveTab} 
                items={[
                {
                    key: '1',
                    label: 'Thông tin cá nhân',
                    children: (
                        <div className="space-y-6 mt-2 max-w-lg mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                            
                            {/* NÚT CHUYỂN CHẾ ĐỘ (Góc trên phải) */}
                            <div className="absolute top-4 right-4">
                                {!isEditing ? (
                                    <Button 
                                        type="text" 
                                        icon={<Edit2 size={16} />} 
                                        className="text-blue-600 hover:bg-blue-50 font-medium"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button 
                                            size="small" 
                                            danger 
                                            icon={<XCircle size={14} />} 
                                            onClick={handleCancelEdit}
                                            disabled={loadingUpdate}
                                        >
                                            Hủy
                                        </Button>
                                        <Button 
                                            size="small" 
                                            type="primary" 
                                            icon={<Save size={14} />} 
                                            loading={loadingUpdate}
                                            onClick={handleUpdateInfo}
                                        >
                                            Lưu
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* NỘI DUNG CHÍNH (SWITCH VIEW/EDIT) */}
                            
                            {/* 1. HỌ TÊN */}
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Họ và tên</label>
                                {isEditing ? (
                                    <Input value={fullName} onChange={e => setFullName(e.target.value)} size="middle" />
                                ) : (
                                    <div className="text-gray-800 font-medium text-lg border-b border-transparent pb-1">
                                        {fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* 2. NGÀY SINH */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ngày sinh</label>
                                    {isEditing ? (
                                        <DatePicker 
                                            className="w-full" size="middle" 
                                            value={dob} onChange={setDob} 
                                            format="DD/MM/YYYY" placeholder="Chọn ngày"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-700 h-[32px]">
                                            <Calendar size={18} className="text-blue-500"/>
                                            <span>{dob ? dob.format('DD/MM/YYYY') : <span className="text-gray-400 italic">--/--/----</span>}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 3. GIỚI TÍNH */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Giới tính</label>
                                    {isEditing ? (
                                        <Select 
                                            className="w-full" size="middle" 
                                            value={gender} onChange={setGender}
                                            options={[
                                                {value: 'MALE', label: 'Nam'}, 
                                                {value: 'FEMALE', label: 'Nữ'}, 
                                                {value: 'OTHER', label: 'Khác'}
                                            ]}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-700 h-[32px]">
                                            <Smile size={18} className="text-orange-500"/>
                                            <span>{getGenderLabel(gender)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 4. ĐỊA CHỈ */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Địa chỉ</label>
                                {isEditing ? (
                                    <Input.TextArea 
                                        rows={2} 
                                        value={address} onChange={e => setAddress(e.target.value)} 
                                        placeholder="Nhập địa chỉ..."
                                    />
                                ) : (
                                    <div className="flex items-start gap-2 text-gray-700">
                                        <MapPin size={18} className="text-red-500 mt-1 flex-shrink-0"/>
                                        <span className="leading-relaxed">
                                            {address || <span className="text-gray-400 italic">Chưa có thông tin địa chỉ</span>}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Email (Luôn Read-only) */}
                            <div className="pt-4 border-t border-gray-100 mt-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email đăng nhập</label>
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-gray-500 text-sm">
                                    <Lock size={14} />
                                    {user.email}
                                    <Tag color="blue" className="ml-auto m-0 border-0">Verified</Tag>
                                </div>
                            </div>

                        </div>
                    )
                },
                // --- TAB BẢO MẬT (Giữ nguyên code cũ) ---
                {
                    key: '2',
                    label: 'Bảo mật',
                    children: (
                        <div className="space-y-6 mt-2 max-w-lg mx-auto">
                             <div className="p-5 border border-blue-100 bg-white rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Lock size={18} className="text-blue-600"/> Đổi mật khẩu
                                </h3>
                                
                                {passStep === 1 ? (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Để bảo mật, mã OTP xác nhận sẽ được gửi đến <b>{user.email}</b>.
                                        </p>
                                        <Button type="primary" onClick={handleSendOtp} loading={loadingPass} className="self-start">
                                            Gửi mã OTP xác nhận
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 animate-in slide-in-from-right-4">
                                        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                                            <Edit2 size={16} /> Đã gửi mã đến email
                                        </div>
                                        <Input placeholder="Nhập mã OTP (6 số)" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} size="large"/>
                                        <Input.Password placeholder="Mật khẩu mới" value={newPassword} onChange={e => setNewPassword(e.target.value)} size="large"/>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <Button onClick={() => setPassStep(1)}>Hủy</Button>
                                            <Button type="primary" onClick={handleSubmitChangePass} loading={loadingPass}>Đổi mật khẩu</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
            ]} />
        </div>
      </div>
    </div>

    {/* MODAL CẮT ẢNH (Giữ nguyên) */}
    <Modal 
        open={isCropperOpen} 
        onCancel={() => setIsCropperOpen(false)} 
        onOk={handleSaveAvatar}
        confirmLoading={uploadingAvatar}
        title="Chỉnh sửa ảnh đại diện"
        width={500}
        centered
    >
        <div className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            {imageSrc && (
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            )}
        </div>
        <div className="mt-6 px-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Thu phóng</label>
            <Slider min={1} max={3} step={0.1} value={zoom} onChange={setZoom} />
        </div>
    </Modal>
    </>
  );
};

export default ProfileModal;