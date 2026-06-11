import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Prisma } from 'src/generated/prisma';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo vé mới
   */
  async create(createTicketDto: CreateTicketDto) {
    // Kiểm tra session tồn tại
    const session = await this.prisma.ticketSaleSession.findUnique({
      where: { id: createTicketDto.sessionId },
    });
    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy phiên bán vé có ID: ${createTicketDto.sessionId}`,
      );
    }

    // Kiểm tra seat tồn tại
    const seat = await this.prisma.seat.findUnique({
      where: { id: createTicketDto.seatId },
    });
    if (!seat) {
      throw new NotFoundException(
        `Không tìm thấy ghế có ID: ${createTicketDto.seatId}`,
      );
    }

    // Kiểm tra trùng lặp cặp (sessionId, seatId)
    const existingTicket = await this.prisma.ticket.findUnique({
      where: {
        sessionId_seatId: {
          sessionId: createTicketDto.sessionId,
          seatId: createTicketDto.seatId,
        },
      },
    });
    if (existingTicket) {
      throw new ConflictException(
        `Vé cho phiên bán vé và ghế này đã tồn tại`,
      );
    }

    // Kiểm tra danh sách orders nếu có
    if (createTicketDto.orderIds && createTicketDto.orderIds.length > 0) {
      for (const orderId of createTicketDto.orderIds) {
        const order = await this.prisma.order.findUnique({
          where: { id: orderId },
        });
        if (!order) {
          throw new NotFoundException(`Không tìm thấy đơn hàng có ID: ${orderId}`);
        }
      }
    }

    const data: Prisma.TicketCreateInput = {
      session: { connect: { id: createTicketDto.sessionId } },
      seat: { connect: { id: createTicketDto.seatId } },
      price: createTicketDto.price,
      status: createTicketDto.status || 'AVAILABLE',
    };

    if (createTicketDto.orderIds && createTicketDto.orderIds.length > 0) {
      data.orders = {
        connect: createTicketDto.orderIds.map((id) => ({ id })),
      };
    }

    return this.prisma.ticket.create({
      data,
      include: {
        session: true,
        seat: true,
        orders: true,
      },
    });
  }

  /**
   * Lấy danh sách vé có phân trang và bộ lọc
   */
  async findAll(query?: {
    page?: number;
    limit?: number;
    sessionId?: string;
    seatId?: string;
    status?: string;
    orderId?: string;
  }) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {};

    if (query?.sessionId) {
      where.sessionId = query.sessionId;
    }

    if (query?.seatId) {
      where.seatId = query.seatId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.orderId) {
      where.orders = {
        some: { id: query.orderId },
      };
    }

    const [total, tickets] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          session: true,
          seat: true,
          orders: true,
        },
      }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Chi tiết vé theo ID
   */
  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        session: true,
        seat: true,
        orders: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Không tìm thấy vé có ID: ${id}`);
    }

    return ticket;
  }

  /**
   * Cập nhật thông tin vé
   */
  async update(id: string, updateTicketDto: UpdateTicketDto) {
    const currentTicket = await this.findOne(id);

    const sessionId = updateTicketDto.sessionId || currentTicket.sessionId;
    const seatId = updateTicketDto.seatId || currentTicket.seatId;

    // Kiểm tra session và seat khi cập nhật
    if (updateTicketDto.sessionId && updateTicketDto.sessionId !== currentTicket.sessionId) {
      const session = await this.prisma.ticketSaleSession.findUnique({
        where: { id: updateTicketDto.sessionId },
      });
      if (!session) {
        throw new NotFoundException(
          `Không tìm thấy phiên bán vé có ID: ${updateTicketDto.sessionId}`,
        );
      }
    }

    if (updateTicketDto.seatId && updateTicketDto.seatId !== currentTicket.seatId) {
      const seat = await this.prisma.seat.findUnique({
        where: { id: updateTicketDto.seatId },
      });
      if (!seat) {
        throw new NotFoundException(
          `Không tìm thấy ghế có ID: ${updateTicketDto.seatId}`,
        );
      }
    }

    // Nếu thay đổi session hoặc seat, kiểm tra trùng lặp khóa unique
    if (updateTicketDto.sessionId || updateTicketDto.seatId) {
      const existingTicket = await this.prisma.ticket.findFirst({
        where: {
          sessionId,
          seatId,
          id: { not: id },
        },
      });
      if (existingTicket) {
        throw new ConflictException(
          `Vé cho phiên bán vé và ghế này đã tồn tại ở một bản ghi khác`,
        );
      }
    }

    // Kiểm tra danh sách orders nếu có cập nhật
    if (updateTicketDto.orderIds) {
      for (const orderId of updateTicketDto.orderIds) {
        const order = await this.prisma.order.findUnique({
          where: { id: orderId },
        });
        if (!order) {
          throw new NotFoundException(`Không tìm thấy đơn hàng có ID: ${orderId}`);
        }
      }
    }

    const data: Prisma.TicketUpdateInput = {};

    if (updateTicketDto.sessionId) {
      data.session = { connect: { id: updateTicketDto.sessionId } };
    }
    if (updateTicketDto.seatId) {
      data.seat = { connect: { id: updateTicketDto.seatId } };
    }
    if (updateTicketDto.price !== undefined) {
      data.price = updateTicketDto.price;
    }
    if (updateTicketDto.status !== undefined) {
      data.status = updateTicketDto.status;
    }
    if (updateTicketDto.orderIds !== undefined) {
      data.orders = {
        set: updateTicketDto.orderIds.map((id) => ({ id })),
      };
    }

    return this.prisma.ticket.update({
      where: { id },
      data,
      include: {
        session: true,
        seat: true,
        orders: true,
      },
    });
  }

  /**
   * Xóa vé
   */
  async remove(id: string) {
    await this.findOne(id);

    const deletedTicket = await this.prisma.ticket.delete({
      where: { id },
    });

    return {
      message: 'Xóa vé thành công',
      id: deletedTicket.id,
    };
  }
}
