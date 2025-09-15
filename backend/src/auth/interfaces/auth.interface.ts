import { User } from "src/common/entities/user.entity";
import { UserRole } from "src/common/enums/user-role.enum";

export interface JwtPayload {
    sub: string; //user id
    email: string;
    role: UserRole;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface SanitizedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    isLocked: boolean;
    mustChangePassword: boolean;
}

export interface AuthResponse {
    user: SanitizedUser;
    accessToken: string;
    refreshToken: string;
}