import React, { useState, useCallback } from 'react';
import { X, User as UserIcon, Shield, Camera, Save, Lock, Loader } from 'lucide-react';
import { User } from '../types';
import { userApi, authApi } from '../api/axiosClient';
import { message, Tabs, Input, Button, Modal, Slider, Select, DatePicker } from 'antd';
import Cropper from 'react-easy-crop';
import { getCroppedImg }from '../utils/cropImage';
import dayjs from 'dayjs'; // Cần cài dayjs nếu dùng DatePicker của Antd

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('1');
  
  // --- STATE CHO EDIT INFO ---
  const [fullName, setFullName] = useState(user?.fullName || '');
  // Các state cho Giai đoạn 2 (để sẵn)
  const [address, setAddress] = useState(user?.address || '');
  const [gender, setGender] = useState(user?.gender || 'OTHER');
  const [dob, setDob] = useState<dayjs.Dayjs | null>(user?.dateOfBirth ? dayjs(user.dateOfBirth) : null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // --- STATE CHO CROP AVATAR ---
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // --- STATE CHO ĐỔI MẬT KHẨU (OTP Flow) ---
  const [passStep, setPassStep] = useState(1); // 1: Start, 2: OTP Form
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);

  // --- LOGIC ẢNH ---
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setIsCropperOpen(true);
    }
  };

  const readFile = (file: File) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.readAsDataURL(file);
  });

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveAvatar = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setUploadingAvatar(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (!croppedBlob) {
            console.error("Lỗi: Không thể cắt ảnh");
            return;
        }
    
      const file = new File([croppedBlob], "avatar.png", { type: "image/png" });
      
      
      await userApi.uploadAvatar(file);
      message.success("Cập nhật Avatar thành công!");
      setIsCropperOpen(false);
      onUpdateUser(); // Reload data
    } catch (e) {
      message.error("Lỗi upload ảnh");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- LOGIC UPDATE INFO ---
  const handleUpdateInfo = async () => {
    setLoadingUpdate(true);
    try {
      // Giai đoạn 1: Chỉ gửi fullName. Giai đoạn 2: Sẽ gửi thêm address, gender...
      await userApi.updateProfile({ 
          fullName, address, gender, dateOfBirth: dob ? dob.format('YYYY-MM-DD') : null 
      });
      message.success("Cập nhật thông tin thành công");
      onUpdateUser();
    } catch (e) { message.error("Lỗi cập nhật"); }
    finally { setLoadingUpdate(false); }
  };

  // --- LOGIC ĐỔI MẬT KHẨU ---
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
            email: user.email,
            code: otp,
            newPassword: newPassword
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
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full"><X size={20}/></button>
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white overflow-hidden">
                        {user.avatarUrl ? (
                             <img src={user.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (<UserIcon className="w-full h-full p-4 text-gray-400"/>)}
                    </div>
                    {/* Nút Upload Avatar */}
                    <label className="absolute bottom-0 right-0 p-2 bg-white text-gray-700 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-transform hover:scale-105">
                        <Camera size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                    </label>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{user.fullName}</h2>
                    <p className="opacity-90">{user.email}</p>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
                {
                    key: '1',
                    label: 'Thông tin cá nhân',
                    children: (
                        <div className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <Input value={fullName} onChange={e => setFullName(e.target.value)} size="large" />
                            </div>
                           
                           
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                    <DatePicker className="w-full" size="large" value={dob} onChange={setDob} format="DD/MM/YYYY"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                    <Select className="w-full" size="large" value={gender} onChange={setGender} options={[
                                        {value: 'MALE', label: 'Nam'}, {value: 'FEMALE', label: 'Nữ'}, {value: 'OTHER', label: 'Khác'}
                                    ]}/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                <Input value={address} onChange={e => setAddress(e.target.value)} size="large" />
                            </div> 
                            

                            <Button type="primary" icon={<Save size={16}/>} size="large" onClick={handleUpdateInfo} loading={loadingUpdate} className="mt-2">
                                Lưu thay đổi
                            </Button>
                        </div>
                    )
                },
                {
                    key: '2',
                    label: 'Bảo mật',
                    children: (
                        <div className="space-y-6">
                            <div className="p-5 border border-blue-100 bg-blue-50/50 rounded-xl">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Lock size={18} className="text-blue-600"/> Đổi mật khẩu
                                </h3>
                                
                                {passStep === 1 ? (
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-600">Chúng tôi sẽ gửi mã xác nhận (OTP) đến email của bạn để thực hiện thay đổi.</p>
                                        <Button type="primary" onClick={handleSendOtp} loading={loadingPass}>
                                            Gửi mã OTP
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 animate-in slide-in-from-right-4">
                                        <p className="text-sm text-green-600 font-medium">Đã gửi mã đến {user.email}</p>
                                        <Input placeholder="Nhập mã OTP (6 số)" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}/>
                                        <Input.Password placeholder="Mật khẩu mới" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                        <div className="flex gap-2 justify-end pt-2">
                                            <Button onClick={() => setPassStep(1)}>Hủy</Button>
                                            <Button type="primary" onClick={handleSubmitChangePass} loading={loadingPass}>Xác nhận đổi</Button>
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

    {/* MODAL CẮT ẢNH */}
    <Modal 
        open={isCropperOpen} 
        onCancel={() => setIsCropperOpen(false)} 
        onOk={handleSaveAvatar}
        confirmLoading={uploadingAvatar}
        title="Chỉnh sửa ảnh đại diện"
        width={500}
    >
        <div className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden">
            {imageSrc && (
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // Tỉ lệ 1:1
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            )}
        </div>
        <div className="mt-4">
            <label className="text-sm text-gray-500">Thu phóng</label>
            <Slider min={1} max={3} step={0.1} value={zoom} onChange={setZoom} />
        </div>
    </Modal>
    </>
  );
};

export default ProfileModal;