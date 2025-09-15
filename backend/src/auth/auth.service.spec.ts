
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('$argon2id$v=19$mockhash'),
  verify: jest.fn().mockResolvedValue(true),
}));
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { AuthService } from './auth.service';
import { User } from '../common/entities/user.entity';
import { UserActivityLog } from '../common/entities/user-activity-log.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let activityLogRepository: Repository<UserActivityLog>;
  let jwtService: JwtService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password_hash: 'hashedPassword',
    first_name: 'John',
    last_name: 'Doe',
    role: UserRole.EMPLOYEE,
    is_active: true,
    is_locked: false,
    failed_login_attempts: 0,
    must_change_password: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockActivityLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserActivityLog),
          useValue: mockActivityLogRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    activityLogRepository = module.get<Repository<UserActivityLog>>(
      getRepositoryToken(UserActivityLog),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.EMPLOYEE,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockConfigService.get.mockReturnValue('mock-refresh-secret');
      mockActivityLogRepository.create.mockReturnValue({});
      mockActivityLogRepository.save.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password_hash');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      jest.mock('argon2', () => ({
        hash: jest.fn().mockResolvedValue('hashedPassword'),
        verify: jest.fn().mockResolvedValue(true),
      }));

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockConfigService.get.mockReturnValue('mock-refresh-secret');
      mockActivityLogRepository.create.mockReturnValue({});
      mockActivityLogRepository.save.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password_hash');
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password hash', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password_hash');
      expect(result.email).toBe(mockUser.email);
    });
  });
});