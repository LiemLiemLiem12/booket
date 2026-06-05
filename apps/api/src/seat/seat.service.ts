import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { Prisma } from 'src/generated/prisma';

@Injectable()
export class SeatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo ghế mới
   */
  async create(createSeatDto: CreateSeatDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createSeatDto.campaignId },
    });
    if (!campaign) {
      throw new NotFoundException(
        `Không tìm thấy chiến dịch có ID: ${createSeatDto.campaignId}`,
      );
    }

    const existingSeat = await this.prisma.seat.findUnique({
      where: {
        campaignId_rowName_colName: {
          campaignId: createSeatDto.campaignId,
          rowName: createSeatDto.rowName,
          colName: createSeatDto.colName,
        },
      },
    });

    if (existingSeat) {
      throw new ConflictException(
        `Ghế tại vị trí Row ${createSeatDto.rowName}, Col ${createSeatDto.colName} đã tồn tại trong chiến dịch này`,
      );
    }

    const data: Prisma.SeatCreateInput = {
      campaign: { connect: { id: createSeatDto.campaignId } },
      areaName: createSeatDto.areaName,
      rowName: createSeatDto.rowName,
      colName: createSeatDto.colName,
      status: createSeatDto.status || 'AVAILABLE',
    };

    return this.prisma.seat.create({
      data,
      include: {
        drawSeat: true,
      },
    });
  }

  /**
   * Lấy danh sách ghế có phân trang và bộ lọc
   */
  async findAll(query?: {
    page?: number;
    limit?: number;
    campaignId?: string;
    status?: string;
    areaName?: string;
  }) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SeatWhereInput = {};

    if (query?.campaignId) {
      where.campaignId = query.campaignId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.areaName) {
      where.areaName = {
        contains: query.areaName,
        mode: 'insensitive',
      };
    }

    const [total, seats] = await Promise.all([
      this.prisma.seat.count({ where }),
      this.prisma.seat.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          drawSeat: true,
        },
      }),
    ]);

    return {
      data: seats,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Chi tiết ghế theo ID
   */
  async findOne(id: string) {
    const seat = await this.prisma.seat.findUnique({
      where: { id },
      include: {
        drawSeat: true,
      },
    });

    if (!seat) {
      throw new NotFoundException(`Không tìm thấy ghế có ID: ${id}`);
    }

    return seat;
  }

  /**
   * Cập nhật thông tin ghế
   */
  async update(id: string, updateSeatDto: UpdateSeatDto) {
    const currentSeat = await this.findOne(id);

    // Nếu thay đổi các trường tạo nên khoá unique, cần kiểm tra trùng lặp
    const campaignId = updateSeatDto.campaignId || currentSeat.campaignId;
    const rowName = updateSeatDto.rowName || currentSeat.rowName;
    const colName = updateSeatDto.colName || currentSeat.colName;

    if (
      updateSeatDto.campaignId ||
      updateSeatDto.rowName ||
      updateSeatDto.colName
    ) {
      // Nếu có đổi campaignId, kiểm tra campaign mới có tồn tại hay không
      if (
        updateSeatDto.campaignId &&
        updateSeatDto.campaignId !== currentSeat.campaignId
      ) {
        const campaign = await this.prisma.campaign.findUnique({
          where: { id: updateSeatDto.campaignId },
        });
        if (!campaign) {
          throw new NotFoundException(
            `Không tìm thấy chiến dịch có ID: ${updateSeatDto.campaignId}`,
          );
        }
      }

      const existingSeat = await this.prisma.seat.findFirst({
        where: {
          campaignId,
          rowName,
          colName,
          id: { not: id },
        },
      });

      if (existingSeat) {
        throw new ConflictException(
          `Vị trí ghế Row ${rowName}, Col ${colName} đã được sử dụng trong chiến dịch này bởi một ghế khác`,
        );
      }
    }

    const data: Prisma.SeatUpdateInput = {};

    if (updateSeatDto.campaignId) {
      data.campaign = { connect: { id: updateSeatDto.campaignId } };
    }
    if (updateSeatDto.areaName !== undefined) {
      data.areaName = updateSeatDto.areaName;
    }
    if (updateSeatDto.rowName !== undefined) {
      data.rowName = updateSeatDto.rowName;
    }
    if (updateSeatDto.colName !== undefined) {
      data.colName = updateSeatDto.colName;
    }
    if (updateSeatDto.status !== undefined) {
      data.status = updateSeatDto.status;
    }

    return this.prisma.seat.update({
      where: { id },
      data,
      include: {
        drawSeat: true,
      },
    });
  }

  /**
   * Xóa ghế
   */
  async remove(id: string) {
    await this.findOne(id);

    const deletedSeat = await this.prisma.seat.delete({
      where: { id },
    });

    return {
      message: 'Xóa ghế thành công',
      id: deletedSeat.id,
    };
  }
}
