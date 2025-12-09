import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest, VerifyRequest } from '../types';

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

export default axiosClient;