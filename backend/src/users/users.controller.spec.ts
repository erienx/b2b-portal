// users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from 'src/common/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from 'src/common/enums/user-role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    unlockAccount: jest.fn(),
    resetPassword: jest.fn(),
    getUserActivity: jest.fn(),
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: UserRole.ADMIN,
    is_active: true,
    is_locked: false,
    failed_login_attempts: 0,
    must_change_password: false,
    password_changed_at: null,
    password_hash: 'hashedPassword',
    created_at: new Date(),
    updated_at: new Date(),
    assignments: [],
    activityLogs: [],
    uploadedFiles: [],
    managedDistributors: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.EMPLOYEE,
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto, mockUser);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto, mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      const paginatedResult = {
        users: [mockUser],
        total: 1,
        totalPages: 1,
      };

      mockUsersService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 10);

      expect(usersService.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Updated',
      };

      const updatedUser = { ...mockUser, first_name: 'Jane', last_name: 'Updated' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, updateUserDto, mockUser);

      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, updateUserDto, mockUser.id);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUsersService.delete.mockResolvedValue({ deleted: true });

      const result = await controller.delete(mockUser.id, mockUser);

      expect(usersService.delete).toHaveBeenCalledWith(mockUser.id, mockUser.id);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('unlockAccount', () => {
    it('should unlock a user account', async () => {
      mockUsersService.unlockAccount.mockResolvedValue({ unlocked: true });

      const result = await controller.unlock(mockUser.id, mockUser);

      expect(usersService.unlockAccount).toHaveBeenCalledWith(mockUser.id, mockUser.id);
      expect(result).toEqual({ unlocked: true });
    });
  });

  describe('resetPassword', () => {
    it('should reset a user password', async () => {
      const resetPasswordDto: ResetPasswordDto = { newPassword: 'NewPass123!' };
      mockUsersService.resetPassword.mockResolvedValue({ reset: true });

      const result = await controller.resetPassword(mockUser.id, resetPasswordDto, mockUser);

      expect(usersService.resetPassword).toHaveBeenCalledWith(mockUser.id, resetPasswordDto.newPassword, mockUser.id);
      expect(result).toEqual({ reset: true });
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity', async () => {
      const activityResult = { logs: [], total: 0, totalPages: 0 };
      mockUsersService.getUserActivity.mockResolvedValue(activityResult);

      const result = await controller.getUserActivity(mockUser.id, 1, 10);

      expect(usersService.getUserActivity).toHaveBeenCalledWith(mockUser.id, 1, 10);
      expect(result).toEqual(activityResult);
    });
  });
});
