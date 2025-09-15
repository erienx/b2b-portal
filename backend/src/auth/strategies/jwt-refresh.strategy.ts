import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/auth.interface';
import { User } from 'src/common/entities/user.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) {
        const refreshTokenSecret = configService.get<string>('JWT_REFRESH_SECRET');
        if (!refreshTokenSecret) {
            throw new Error('JWT_REFRESH_SECRET is not defined');
        }

        super({
            jwtFromRequest: (req) => {
                return req?.cookies?.refreshToken;
            },
            secretOrKey: refreshTokenSecret,
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { sub: userId } = payload;

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user || !user.is_active) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }
}
