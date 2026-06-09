import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketSaleSessionDto } from './dto/create-ticket-sale-session.dto';
import { UpdateTicketSaleSessionDto } from './dto/update-ticket-sale-session.dto';
import { Prisma } from 'src/generated/prisma';

@Injectable()
export class TicketSaleSessionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo phiên bán vé mới
   */
  async create(createTicketSaleSessionDto: CreateTicketSaleSessionDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createTicketSaleSessionDto.campaignId },
    });
    if (!campaign) {
      throw new NotFoundException(
        `Không tìm thấy chiến dịch có ID: ${createTicketSaleSessionDto.campaignId}`,
      );
    }

    const data: Prisma.TicketSaleSessionCreateInput = {
      campaign: { connect: { id: createTicketSaleSessionDto.campaignId } },
      name: createTicketSaleSessionDto.name,
      startTime: new Date(createTicketSaleSessionDto.startTime),
      endTime: new Date(createTicketSaleSessionDto.endTime),
      status: createTicketSaleSessionDto.status || 'DRAFT',
    };

    return this.prisma.ticketSaleSession.create({
      data,
    });
  }

  /**
   * Lấy danh sách phiên bán vé có phân trang và bộ lọc
   */
  async findAll(query?: {
    page?: number;
    limit?: number;
    campaignId?: string;
    status?: string;
    search?: string;
  }) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketSaleSessionWhereInput = {};

    if (query?.campaignId) {
      where.campaignId = query.campaignId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [total, sessions] = await Promise.all([
      this.prisma.ticketSaleSession.count({ where }),
      this.prisma.ticketSaleSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Chi tiết phiên bán vé theo ID
   */
  async findOne(id: string) {
    const session = await this.prisma.ticketSaleSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy phiên bán vé có ID: ${id}`);
    }

    return session;
  }

  /**
   * Cập nhật thông tin phiên bán vé
   */
  async update(id: string, updateTicketSaleSessionDto: UpdateTicketSaleSessionDto) {
    const currentSession = await this.findOne(id);

    if (
      updateTicketSaleSessionDto.campaignId &&
      updateTicketSaleSessionDto.campaignId !== currentSession.campaignId
    ) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: updateTicketSaleSessionDto.campaignId },
      });
      if (!campaign) {
        throw new NotFoundException(
          `Không tìm thấy chiến dịch có ID: ${updateTicketSaleSessionDto.campaignId}`,
        );
      }
    }

    const data: Prisma.TicketSaleSessionUpdateInput = {};

    if (updateTicketSaleSessionDto.campaignId) {
      data.campaign = { connect: { id: updateTicketSaleSessionDto.campaignId } };
    }
    if (updateTicketSaleSessionDto.name !== undefined) {
      data.name = updateTicketSaleSessionDto.name;
    }
    if (updateTicketSaleSessionDto.startTime !== undefined) {
      data.startTime = new Date(updateTicketSaleSessionDto.startTime);
    }
    if (updateTicketSaleSessionDto.endTime !== undefined) {
      data.endTime = new Date(updateTicketSaleSessionDto.endTime);
    }
    if (updateTicketSaleSessionDto.status !== undefined) {
      data.status = updateTicketSaleSessionDto.status;
    }

    return this.prisma.ticketSaleSession.update({
      where: { id },
      data,
    });
  }

  /**
   * Xóa phiên bán vé
   */
  async remove(id: string) {
    await this.findOne(id);

    const deletedSession = await this.prisma.ticketSaleSession.delete({
      where: { id },
    });

    return {
      message: 'Xóa phiên bán vé thành công',
      id: deletedSession.id,
    };
  }
}
