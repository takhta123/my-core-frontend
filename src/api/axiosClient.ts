import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest, VerifyRequest, NoteRequest } from '../types';

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

export const noteApi = {
    // Lấy danh sách (Có phân trang)
    getAll: (page: number = 0, size: number = 10) => 
        axiosClient.get(`/notes?page=${page}&size=${size}`),

    // Tạo mới
    create: (data: NoteRequest) => axiosClient.post('/notes', data),

    // Cập nhật
    update: (id: number, data: NoteRequest) => axiosClient.put(`/notes/${id}`, data),

    // Xóa mềm (Vào thùng rác)
    delete: (id: number) => axiosClient.delete(`/notes/${id}`),

    // Lưu trữ
    archive: (id: number) => axiosClient.put(`/notes/${id}/archive`),

    // Gán nhãn
    addLabel: (noteId: number, labelId: number) => 
        axiosClient.post(`/notes/${noteId}/labels/${labelId}`),
};

export default axiosClient;