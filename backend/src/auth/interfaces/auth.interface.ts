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

export interface AuthResponse {
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
}