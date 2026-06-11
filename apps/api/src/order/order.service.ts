import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from 'src/generated/prisma/edge';
import OrderStatus from './enums/order-status.enum';
import TransactionStatus from './enums/transaction-status.enum';
import TicketStatus from 'src/ticket/enums/ticket-status.enum';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async create(createOrderDto: CreateOrderDto, ipAddress: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const buyer = await tx.user.findUnique({
        where: { id: createOrderDto.buyerId },
      });
      if (!buyer) throw new BadRequestException('Buyer not found');

      const campaign = await tx.campaign.findUnique({
        where: {
          id: createOrderDto.campaignId,
        },
      });

      if (!campaign) throw new BadRequestException('Campaign not found');

      const updatedTickets = await tx.ticket.updateMany({
        where: {
          id: { in: createOrderDto.ticketIds },
          status: TicketStatus.AVAILABLE,
          sessionId: createOrderDto.sessionId,
        },
        data: {
          status: TicketStatus.PENDING,
        },
      });

      if (updatedTickets.count !== createOrderDto.ticketIds.length) {
        throw new BadRequestException(
          'Vé đã bị người khác mua hoặc không hợp lệ. Vui lòng chọn lại!',
        );
      }

      const tickets = await tx.ticket.findMany({
        where: {
          id: { in: createOrderDto.ticketIds },
        },
      });

      const calculatedOrderPrice = tickets.reduce(
        (sum, ticket) => sum + Number(ticket.price),
        0,
      );

      const order = await tx.order.create({
        data: {
          buyerId: createOrderDto.buyerId,
          campaignId: createOrderDto.campaignId,
          sessionId: createOrderDto.sessionId,
          totalPrice: calculatedOrderPrice,
          status: createOrderDto.status || OrderStatus.PENDING,
          paymentGateway: createOrderDto.paymentGateway,
          expiresAt: createOrderDto.expiresAt
            ? new Date(createOrderDto.expiresAt)
            : undefined,
          tickets: {
            connect: createOrderDto.ticketIds.map((id) => ({ id })),
          },
        },
      });

      const paymentTx = await tx.paymentTransaction.create({
        data: {
          orderId: order.id,
          transactionReference: `${createOrderDto.paymentGateway}_${order.id}_${Date.now()}`,
          amount: calculatedOrderPrice,
          status: TransactionStatus.PENDING,
        },
      });

      return { order, paymentTx };
    });

    const res = this.paymentService.createPayment(
      createOrderDto.paymentGateway,
      result.order.id,
      createOrderDto.totalPrice,
      null,
      ipAddress,
    );

    return res;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
