import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/generated/prisma/edge';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as cryptoUltils from './utils/hash-password.util';
import * as formatUser from './utils/format-user.utiil';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const userData: User = {
    email: 'test@example.com',
    passwordHash: 'hashedPassword123',
    role: 'USER',
    status: 'ACTIVE',
    companyName: 'Test Company',
    phone: '123-456-7890',
    kycStatus: 'PENDING',
    id: 'user-uuid-123',
    createdAt: new Date('01-02-2005'),
    updatedAt: new Date('01-02-2005'),
  };

  const formattedUserData = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    role: 'USER',
    status: 'ACTIVE',
    companyName: 'Test Company',
    phone: '123-456-7890',
    kycStatus: 'PENDING',
    createdAt: new Date('01-02-2005'),
    updatedAt: new Date('01-02-2005'),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When creating a user', () => {
    it('should create a user successfully and return user data', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      jest
        .spyOn(cryptoUltils, 'hashPassword')
        .mockImplementation(async () => 'hashedPassword123');

      (prisma.user.create as jest.Mock).mockResolvedValueOnce(userData);

      const createUserDto: CreateUserDto = {
        email: userData.email,
        password: 'plainTextPassword',
        role: userData.role,
        status: userData.status,
        companyName: 'Test Company',
        phone: '0000000',
        kycStatus: userData.kycStatus,
      };

      const result = await service.create(createUserDto);
      expect(result).toEqual(formattedUserData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          passwordHash: 'hashedPassword123',
          role: createUserDto.role,
          status: createUserDto.status,
          companyName: createUserDto.companyName,
          phone: createUserDto.phone,
          kycStatus: createUserDto.kycStatus,
        },
      });
    });

    it('should creating failed and throw exception', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(userData);

      const createUserDto: CreateUserDto = {
        email: userData.email,
        password: 'plainTextPassword',
        role: userData.role,
        status: userData.status,
        companyName: 'Test Company',
        phone: '0000000',
        kycStatus: userData.kycStatus,
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        new HttpException(
          'Email đã tồn tại trong hệ thống',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('When finding all users', () => {
    it('should return a list of users with pagination and filters', async () => {
      const users = [userData];
      (prisma.user.findMany as jest.Mock).mockResolvedValueOnce(users);
      (prisma.user.count as jest.Mock).mockResolvedValueOnce(1);

      const usersFetch = await service.findAll({
        page: 1,
        limit: 10,
        search: 'test',
        role: 'USER',
        status: 'ACTIVE',
      });

      expect(usersFetch).toEqual({
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(1 / 10),
        },
        data: [formattedUserData],
      });
    });
  });

  describe('When finding a user by id', () => {
    it('should return user data if user exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(userData);

      const result = await service.findOne('user-uuid-123');
      expect(result).toEqual(formattedUserData);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid-123' },
      });
    });

    it('should return null if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('user-uuid-123')).rejects.toThrow(
        new HttpException(
          'Không tìm thấy người dùng có ID: user-uuid-123',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('When updating a user', () => {
    it('should update user data successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(userData);
      (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({
        ...userData,
        email: 'updated@example.com',
      });

      const updateUserDto = {
        email: 'updated@example.com',
      };

      const result = await service.update('user-uuid-123', updateUserDto);
      expect(result).toEqual({
        ...formattedUserData,
        email: 'updated@example.com',
      });
    });

    it('should throw exception if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.update('user-uuid-123', { email: 'updated@example.com' }),
      ).rejects.toThrow(
        new HttpException(
          'Không tìm thấy người dùng có ID: user-uuid-123',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw exception if email is already used by another user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(userData);
      (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({
        ...userData,
        id: 'another-user-uuid',
      });

      await expect(
        service.update('user-uuid-123', { email: 'updated@example.com' }),
      ).rejects.toThrow(
        new HttpException(
          'Email đã được sử dụng bởi người dùng khác',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('When removing a user', () => {
    it('should remove user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(userData);
      (prisma.user.delete as jest.Mock).mockResolvedValueOnce(userData);

      const result = await service.remove('user-uuid-123');
      expect(result).toEqual({
        id: 'user-uuid-123',
        message: 'Xóa người dùng thành công',
      });
    });

    it('should throw exception if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.remove('user-uuid-123')).rejects.toThrow(
        new HttpException(
          'Không tìm thấy người dùng có ID: user-uuid-123',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
