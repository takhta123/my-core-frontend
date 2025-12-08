// Định nghĩa User (Dựa trên User.java)
export interface User {
    id: number;
    email: string;
    fullName: string;
    avatarUrl?: string; // Có thể null
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
    backgroundColor?: string;
    isPinned: boolean;    // Backend trả về 'pinned' hay 'isPinned' tùy cấu hình Jackson, ta cứ để isPinned trước
    isArchived: boolean;
    isDeleted: boolean;
    reminder?: string;    // ISO Date String
    isReminderSent: boolean;
    labels: Label[];
    checklists: Checklist[];
    attachments: Attachment[];
    createdAt: string;
    updatedAt: string;
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