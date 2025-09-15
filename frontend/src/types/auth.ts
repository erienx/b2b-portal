export const UserRole = {
    EMPLOYEE: 'EMPLOYEE',
    DISTRIBUTOR: 'DISTRIBUTOR',
    EXPORT_MANAGER: 'EXPORT_MANAGER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_active: boolean;
    is_locked: boolean;
    must_change_password: boolean;
    created_at: string;
    updated_at: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface RefreshResponse {
    accessToken: string;
}