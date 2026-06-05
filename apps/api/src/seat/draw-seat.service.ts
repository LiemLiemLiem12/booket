import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDrawSeatDto } from './dto/create-draw-seat.dto';
import { UpdateDrawSeatDto } from './dto/update-draw-seat.dto';
import { Prisma } from 'src/generated/prisma';

@Injectable()
export class DrawSeatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo toạ độ/thiết kế vẽ ghế mới
   */
  async create(createDrawSeatDto: CreateDrawSeatDto) {
    // Kiểm tra xem Seat có tồn tại hay không
    const seat = await this.prisma.seat.findUnique({
      where: { id: createDrawSeatDto.seatId },
    });
    if (!seat) {
      throw new NotFoundException(
        `Không tìm thấy ghế có ID: ${createDrawSeatDto.seatId}`,
      );
    }

    // Kiểm tra xem Seat này đã được cấu hình toạ độ vẽ DrawSeat chưa (Quan hệ 1-1)
    const existingDrawSeat = await this.prisma.drawSeat.findUnique({
      where: { seatId: createDrawSeatDto.seatId },
    });
    if (existingDrawSeat) {
      throw new ConflictException(
        `Ghế có ID: ${createDrawSeatDto.seatId} đã được thiết lập toạ độ vẽ. Không thể tạo thêm.`,
      );
    }

    const data: Prisma.DrawSeatCreateInput = {
      seat: { connect: { id: createDrawSeatDto.seatId } },
      xCoord: createDrawSeatDto.xCoord,
      yCoord: createDrawSeatDto.yCoord,
      color: createDrawSeatDto.color,
      label: createDrawSeatDto.label,
    };

    return this.prisma.drawSeat.create({
      data,
      include: {
        seat: true,
      },
    });
  }

  /**
   * Lấy danh sách toạ độ vẽ ghế có phân trang và bộ lọc
   */
  async findAll(query?: {
    page?: number;
    limit?: number;
    seatId?: string;
  }) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.DrawSeatWhereInput = {};

    if (query?.seatId) {
      where.seatId = query.seatId;
    }

    const [total, drawSeats] = await Promise.all([
      this.prisma.drawSeat.count({ where }),
      this.prisma.drawSeat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seat: true,
        },
      }),
    ]);

    return {
      data: drawSeats,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết toạ độ vẽ ghế theo ID
   */
  async findOne(id: string) {
    const drawSeat = await this.prisma.drawSeat.findUnique({
      where: { id },
      include: {
        seat: true,
      },
    });

    if (!drawSeat) {
      throw new NotFoundException(`Không tìm thấy toạ độ vẽ ghế có ID: ${id}`);
    }

    return drawSeat;
  }

  /**
   * Cập nhật toạ độ vẽ ghế
   */
  async update(id: string, updateDrawSeatDto: UpdateDrawSeatDto) {
    const currentDrawSeat = await this.findOne(id);

    // Nếu thay đổi seatId
    if (updateDrawSeatDto.seatId && updateDrawSeatDto.seatId !== currentDrawSeat.seatId) {
      // Kiểm tra xem Seat mới có tồn tại hay không
      const seat = await this.prisma.seat.findUnique({
        where: { id: updateDrawSeatDto.seatId },
      });
      if (!seat) {
        throw new NotFoundException(
          `Không tìm thấy ghế có ID: ${updateDrawSeatDto.seatId}`,
        );
      }

      // Kiểm tra xem Seat mới đã có DrawSeat chưa
      const existingDrawSeat = await this.prisma.drawSeat.findFirst({
        where: {
          seatId: updateDrawSeatDto.seatId,
          id: { not: id },
        },
      });
      if (existingDrawSeat) {
        throw new ConflictException(
          `Ghế có ID: ${updateDrawSeatDto.seatId} đã có toạ độ vẽ được gán cho bản ghi khác`,
        );
      }
    }

    const data: Prisma.DrawSeatUpdateInput = {};

    if (updateDrawSeatDto.seatId) {
      data.seat = { connect: { id: updateDrawSeatDto.seatId } };
    }
    if (updateDrawSeatDto.xCoord !== undefined) {
      data.xCoord = updateDrawSeatDto.xCoord;
    }
    if (updateDrawSeatDto.yCoord !== undefined) {
      data.yCoord = updateDrawSeatDto.yCoord;
    }
    if (updateDrawSeatDto.color !== undefined) {
      data.color = updateDrawSeatDto.color;
    }
    if (updateDrawSeatDto.label !== undefined) {
      data.label = updateDrawSeatDto.label;
    }

    return this.prisma.drawSeat.update({
      where: { id },
      data,
      include: {
        seat: true,
      },
    });
  }

  /**
   * Xoá toạ độ vẽ ghế
   */
  async remove(id: string) {
    await this.findOne(id);

    const deleted = await this.prisma.drawSeat.delete({
      where: { id },
    });

    return {
      message: 'Xóa toạ độ vẽ ghế thành công',
      id: deleted.id,
    };
  }
}
