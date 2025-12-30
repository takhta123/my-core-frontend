import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest, VerifyRequest, NoteRequest, LabelRequest, User } from '../types';

const axiosClient: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => Promise.reject(error)
);

// --- CÁC HÀM API AUTH ---
export const authApi = {
    login: (data: LoginRequest) => axiosClient.post('/auth/login', data),
    register: (data: RegisterRequest) => axiosClient.post('/auth/register', data),
    googleLogin: (data: GoogleLoginRequest) => axiosClient.post('/auth/google', data),
    forgotPassword: (data: ForgotPasswordRequest) => axiosClient.post('/auth/forgot-password', data),
    verifyAccount: (data: VerifyRequest) => axiosClient.post('/auth/verify', data),
    resendCode: (email: string) => axiosClient.post(`/auth/resend-code?email=${email}`),
    resetPassword: (data: ResetPasswordRequest) => axiosClient.post('/auth/reset-password', data)
};

export const labelApi = {
    getAll: () => axiosClient.get('/labels'),
    create: (data: LabelRequest) => axiosClient.post('/labels', data),
    update: (id: number, data: LabelRequest) => axiosClient.put(`/labels/${id}`, data),
    delete: (id: number) => axiosClient.delete(`/labels/${id}`),
};

export const attachmentApi = {
  upload: (file: File, noteId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // SỬA: Phải khớp chính xác với backend là /attachments/notes/${noteId}
    return axiosClient.post(`/attachments/notes/${noteId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

    delete: (id: number) => axiosClient.delete(`/attachments/${id}`),
};

export const noteApi = {
    getAll: (page: number = 0, size: number = 10, search?: string) => {
        let url = `/notes?page=${page}&size=${size}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        return axiosClient.get(url);
    },

    create: (data: NoteRequest) => axiosClient.post('/notes', data),

    update: (id: number, data: NoteRequest) => axiosClient.put(`/notes/${id}`, data),

    delete: (id: number) => axiosClient.delete(`/notes/${id}`),

    archive: (id: number) => axiosClient.put(`/notes/${id}/archive`),

    addLabel: (noteId: number, labelId: number) => 
        axiosClient.post(`/notes/${noteId}/labels/${labelId}`),

    removeLabel: (noteId: number, labelId: number) => 
        axiosClient.delete(`/notes/${noteId}/labels/${labelId}`),

    getArchived: (page: number = 0, size: number = 10) => 
        axiosClient.get(`/notes/archived?page=${page}&size=${size}`),

    getTrashed: (page: number = 0, size: number = 10) => 
        axiosClient.get(`/notes/trash?page=${page}&size=${size}`),

    restore: (id: number) => axiosClient.put(`/notes/${id}/restore`),

    deleteForever: (id: number) => axiosClient.delete(`/notes/${id}/permanent`),

    unarchive: (id: number) => axiosClient.put(`/notes/${id}/unarchive`),

    getReminders: (page: number = 0, size: number = 50) => 
      axiosClient.get(`/notes/reminders?page=${page}&size=${size}`),

    getByLabel: (labelId: number, page: number = 0, size: number = 50) => 
        axiosClient.get(`/notes/label/${labelId}?page=${page}&size=${size}`),
};

export const userApi = {
    getMyProfile: () => axiosClient.get('/users/me'),

    updateProfile: (data: { fullName?: string; avatarUrl?: string }) => 
        axiosClient.put('/users/profile', data),

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    changePassword: (data: any) => axiosClient.put('/users/change-password', data),
};



export default axiosClient;