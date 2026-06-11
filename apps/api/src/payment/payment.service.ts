import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IPaymentStrategy } from './interfaces/payment-strategy.interface';
import VnpayStrategy from './strategies/vnpay.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private paymentStrategies: Map<string, IPaymentStrategy> = new Map();

  constructor(
    private readonly vnpayStrategy: VnpayStrategy,
    private readonly prisma: PrismaService,
  ) {
    this.paymentStrategies.set('VNPAY', this.vnpayStrategy);
  }

  async createPaymentLink(
    orderId: string,
    paymentGateway: string,
    ipAddress: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Đơn hàng với ID ${orderId} không tồn tại`);
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Đơn hàng với ID ${orderId} không ở trạng thái PENDING`,
      );
    }

    const existingTx = await this.prisma.paymentTransaction.findFirst({
      where: {
        orderId: order.id,
        status: 'PENDING',
      },
    });

    let paymentTx = existingTx;

    if (!paymentTx) {
      paymentTx = await this.prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          transactionReference: `${paymentGateway}_${order.id}_${Date.now()}`,
          amount: order.totalPrice,
          status: 'PENDING',
        },
      });
    }

    // Tạo liên kết thanh toán
    const url = await this.createPayment(
      paymentGateway,
      order.id,
      Number(order.totalPrice),
      null,
      ipAddress,
      paymentTx.id,
    );

    return { url };
  }

  createPayment(
    provider: string,
    orderId: string,
    amount: number,
    bankCode: string | null,
    ipAddress: string,
    transactionId: string,
  ) {
    const strategy = this.paymentStrategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider ${provider} not supported`);
    }
    return strategy.createPayment(
      orderId,
      amount,
      bankCode,
      ipAddress,
      transactionId,
    );
  }

  verifyWebhook(provider: string, data: any) {
    const strategy = this.paymentStrategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider ${provider} not supported`);
    }
    return strategy.verifyWebhook(data);
  }
}
