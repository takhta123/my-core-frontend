import axiosClient from "../api/axiosClient";

export interface User {
    id: number;
    email: string;
    fullName: string;
    avatarUrl: string; 
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
}

// Định nghĩa Label (Dựa trên Label.java)
export interface Label {
    id: number;
    name: string;
}

// Định nghĩa Checklist (Dựa trên Checklist.java)
export interface Checklist {
    id: number;
    content: string;
    completed: boolean; // Lưu ý: Backend trả về 'completed' do Jackson cắt chữ 'is'
}

// Định nghĩa Attachment (Dựa trên Attachment.java - Cloudinary)
export interface Attachment {
    id: number;
    fileName: string; // Public ID của Cloudinary
    filePath: string; // URL ảnh
    fileType: string;
}

// Định nghĩa Note (Dựa trên Note.java)
export interface Note {
    id: number;
    title: string;
    content: string;
    isPinned: boolean;
    isArchived: boolean;
    isDeleted: boolean;
    backgroundColor: string;
    reminder: string | null; // ISO Date String
    createdAt: string;
    updatedAt: string;
    labels: Label[];          // [MỚI] Danh sách nhãn
    attachments: Attachment[]; // [MỚI] Danh sách file đính kèm
}

// Định nghĩa Response chuẩn từ Backend (ApiResponse.java)
export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

// Định nghĩa Login Response (AuthResponse.java)
export interface AuthResponse {
    token: string;
    authenticated: boolean;
}


export interface LoginRequest {
    email: string;
    password: string;
    deviceId?: string;    // Dấu ? nghĩa là có thể không có (optional)
    deviceToken?: string;
    deviceType?: string;
}

// Dữ liệu gửi lên khi Đăng ký (Khớp với RegisterRequest.java)
export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

// Dữ liệu gửi lên khi Xác thực (Khớp với VerifyRequest.java)
export interface VerifyRequest {
    email: string;
    code: string;
}

// Dữ liệu gửi lên khi Quên mật khẩu
export interface ForgotPasswordRequest {
    email: string;
}

// Dữ liệu gửi lên khi Đặt lại mật khẩu
export interface ResetPasswordRequest {
    email: string;
    code: string;
    newPassword: string;
}

export interface GoogleLoginRequest {
    idToken: string;       // Token lấy từ Firebase/Google
    deviceId?: string;     // Tùy chọn: ID thiết bị
    deviceToken?: string;  // Tùy chọn: FCM Token để push notification
    deviceType?: string;   // Tùy chọn: WEB/ANDROID/IOS
}

export interface NoteRequest {
    title: string;
    content: string;
    isPinned?: boolean;
    isArchived?: boolean;
    backgroundColor?: string;
    reminder?: string | null; // [MỚI] Gửi lên backend
}

export interface LabelRequest {
    name: string;
}

export const attachmentApi = {

    upload: (file: File, noteId: number) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return axiosClient.post(`/attachments/notes/${noteId}`, formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Xóa file
    delete: (id: string) => axiosClient.delete(`/attachments/${id}`),
};