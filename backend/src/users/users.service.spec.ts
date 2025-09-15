import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from './users.service';
import { User } from '../common/entities/user.entity';
import { UserActivityLog } from '../common/entities/user-activity-log.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

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
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockActivityLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserActivityLog),
          useValue: mockActivityLogRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.EMPLOYEE,
      };

      mockUserRepository.findOne.mockResolvedValue(null); // User doesn't exist
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockActivityLogRepository.create.mockReturnValue({});
      mockActivityLogRepository.save.mockResolvedValue({});

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password_hash');
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('findAll', () => {
    it('should return paginated users list', async () => {
      const users = [mockUser];
      const total = 1;

      mockUserRepository.findAndCount.mockResolvedValue([users, total]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        users: users.map(user => ({ ...user, password_hash: undefined })),
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password_hash');
      expect(result.id).toBe(mockUser.id);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto = {
        firstName: 'Jane',
        lastName: 'Updated',
      };

      const updatedUser = { ...mockUser, first_name: 'Jane', last_name: 'Updated' };

      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call in update method
        .mockResolvedValueOnce(updatedUser); // Second call in findOne method

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockActivityLogRepository.create.mockReturnValue({});
      mockActivityLogRepository.save.mockResolvedValue({});

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password_hash');
    });
  });
});