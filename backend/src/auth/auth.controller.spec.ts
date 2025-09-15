import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { User } from 'src/common/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    getProfile: jest.fn(),
    changePassword: jest.fn(),
    logout: jest.fn(),
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password_hash: 'hashedPassword123!',
    first_name: 'John',
    last_name: 'Doe',
    role: UserRole.EMPLOYEE,
    is_active: true,
    is_locked: false,
    failed_login_attempts: 0,
    password_changed_at: null,
    must_change_password: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.EMPLOYEE,
      };

      const authResult = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockAuthService.register.mockResolvedValue(authResult);

      const result = await controller.register(registerDto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.any(Object),
      );
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'mock-access-token',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const authResult = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockAuthService.login.mockResolvedValue(authResult);

      const result = await controller.login(loginDto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.any(Object),
      );
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'mock-access-token',
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockAuthService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockUser);

      expect(authService.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });
});