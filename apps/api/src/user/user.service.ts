import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, User } from 'src/generated/prisma';
import { hashPassword } from './utils/hash-password.util';
import { formatUser } from './utils/format-user.utiil';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo người dùng mới
   */
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const passwordHash = await hashPassword(createUserDto.password);

    const data: Prisma.UserCreateInput = {
      email: createUserDto.email,
      passwordHash,
      role: createUserDto.role || 'USER',
      status: createUserDto.status || 'ACTIVE',
      companyName: createUserDto.companyName,
      phone: createUserDto.phone,
      kycStatus: createUserDto.kycStatus || 'PENDING',
    };

    const user = await this.prisma.user.create({ data });
    return formatUser(user);
  }

  /**
   * Lấy danh sách người dùng kèm phân trang, tìm kiếm và bộ lọc
   */
  async findAll(query?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    // Tìm kiếm tương đối theo email, tên công ty hoặc số điện thoại (không phân biệt chữ hoa/thường)
    if (query?.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.role) {
      where.role = query.role;
    }

    if (query?.status) {
      where.status = query.status;
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: users.map((user) => formatUser(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Chi tiết người dùng theo ID (UUID)
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng có ID: ${id}`);
    }

    return formatUser(user);
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    if (updateUserDto.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          id: { not: id },
        },
      });
      if (existingEmail) {
        throw new ConflictException(
          'Email đã được sử dụng bởi người dùng khác',
        );
      }
    }

    const data: Prisma.UserUpdateInput = {
      email: updateUserDto.email,
      role: updateUserDto.role,
      status: updateUserDto.status,
      companyName: updateUserDto.companyName,
      phone: updateUserDto.phone,
      kycStatus: updateUserDto.kycStatus,
    };

    if (updateUserDto.password) {
      data.passwordHash = updateUserDto.password;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return formatUser(updatedUser);
  }

  /**
   * Xóa người dùng (Xóa vật lý)
   */
  async remove(id: string) {
    await this.findOne(id);

    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'Xóa người dùng thành công',
      id: deletedUser.id,
    };
  }
}
