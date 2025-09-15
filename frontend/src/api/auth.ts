import api from './axios';
import type { LoginDto, ChangePasswordDto, AuthResponse, RefreshResponse, User } from '../types/auth';

export async function login(loginDto: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', loginDto);
    return response.data;
}

export async function refreshToken(): Promise<string> {
    const response = await api.post<RefreshResponse>('/auth/refresh');
    return response.data.accessToken;
}

export async function getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
}

export async function changePassword(changePasswordDto: ChangePasswordDto): Promise<void> {
    await api.post('/auth/change-password', changePasswordDto);
}

export async function logout(): Promise<void> {
    await api.post('/auth/logout');
}
