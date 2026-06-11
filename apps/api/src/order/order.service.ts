import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from 'src/generated/prisma/edge';
import OrderStatus from './enums/order-status.enum';
import TransactionStatus from './enums/transaction-status.enum';
import TicketStatus from 'src/ticket/enums/ticket-status.enum';
import { PaymentService } from 'src/payment/payment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const expiredAmount = Number(
      this.configService.get<any>('EXPIRE_AMOUNT', 1),
    );
    let startDateObj = new Date();
    const expireDateObj = new Date();
    expireDateObj.setMinutes(
      expireDateObj.getMinutes() + Number(expiredAmount),
    );
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
            : expireDateObj,
          createdAt: startDateObj,
          tickets: {
            connect: createOrderDto.ticketIds.map((id) => ({ id })),
          },
        },
      });
      return order;
    });

    return result;
  }

  async handleExpiredOrders() {
    const now = new Date();

    const expiredOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        expiresAt: {
          lt: now,
        },
      },
      include: {
        tickets: true,
      },
      take: 50,
    });

    if (expiredOrders.length === 0) {
      return { count: 0 };
    }

    let revertedCount = 0;
    for (const order of expiredOrders) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.FAILED },
          });

          const ticketIds = order.tickets.map((t) => t.id);
          if (ticketIds.length > 0) {
            await tx.ticket.updateMany({
              where: { id: { in: ticketIds } },
              data: { status: TicketStatus.AVAILABLE },
            });
          }

          await tx.paymentTransaction.updateMany({
            where: {
              orderId: order.id,
              status: TransactionStatus.PENDING,
            },
            data: { status: TransactionStatus.FAILED },
          });
        });
        revertedCount++;
      } catch (error) {
        // Quietly fail individual order transaction to let others proceed
      }
    }
    return { count: revertedCount };
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

  @OnEvent('order.payment.success')
  async handleOrderPaymentSuccess(query: any) {
    const transactionId = query['vnp_TxnRef'];
    const vnpAmount = Number(query['vnp_Amount']) / 100;

    const paymentTx = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        order: {
          include: {
            tickets: true,
          },
        },
      },
    });

    if (!paymentTx) {
      this.logger.error(`Transaction not found: ${transactionId}`);
      return;
    }

    const order = paymentTx.order;

    if (vnpAmount !== Number(order.totalPrice)) {
      this.logger.error(
        `Payment amount mismatch for transaction ${transactionId}. Expected: ${order.totalPrice}, Got: ${vnpAmount}`,
      );
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(
        `Order ${order.id} is already processed. Status: ${order.status}`,
      );
      return;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.SUCCESS },
        });

        const ticketIds = order.tickets.map((t) => t.id);
        if (ticketIds.length > 0) {
          await tx.ticket.updateMany({
            where: { id: { in: ticketIds } },
            data: { status: TicketStatus.SOLD },
          });
        }

        await tx.paymentTransaction.update({
          where: { id: paymentTx.id },
          data: {
            status: TransactionStatus.SUCCESS,
            callbackPayload: query,
          },
        });
      });
      this.logger.log(
        `Order ${order.id} marked as SUCCESS via VNPAY callback.`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating success status for order ${order.id}:`,
        error,
      );
    }
  }

  @OnEvent('order.payment.failed')
  async handleOrderPaymentFailed(query: any) {
    const transactionId = query['vnp_TxnRef'];

    const paymentTx = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        order: {
          include: {
            tickets: true,
          },
        },
      },
    });

    if (!paymentTx) {
      this.logger.error(`Transaction not found: ${transactionId}`);
      return;
    }

    const order = paymentTx.order;

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(
        `Order ${order.id} is already processed. Status: ${order.status}`,
      );
      return;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.FAILED },
        });

        const ticketIds = order.tickets.map((t) => t.id);
        if (ticketIds.length > 0) {
          await tx.ticket.updateMany({
            where: { id: { in: ticketIds } },
            data: { status: TicketStatus.AVAILABLE },
          });
        }

        await tx.paymentTransaction.update({
          where: { id: paymentTx.id },
          data: {
            status: TransactionStatus.FAILED,
            callbackPayload: query,
          },
        });
      });
      this.logger.log(
        `Order ${order.id} marked as FAILED via VNPAY callback. Tickets released.`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating failure status for order ${order.id}:`,
        error,
      );
    }
  }
}
