import { Injectable } from '@nestjs/common';
import type { IPaymentStrategy } from './interfaces/payment-strategy.interface';
import VnpayStrategy from './strategies/vnpay.strategy';

@Injectable()
export class PaymentService {
  private paymentStrategies: Map<string, IPaymentStrategy> = new Map();

  constructor(private readonly vnpayStrategy: VnpayStrategy) {
    this.paymentStrategies.set('VNPAY', this.vnpayStrategy);
  }

  createPayment(
    provider: string,
    orderId: string,
    amount: number,
    bankCode: string | null,
    ipAddress: string,
  ) {
    const strategy = this.paymentStrategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider ${provider} not supported`);
    }
    return strategy.createPayment(orderId, amount, bankCode, ipAddress);
  }

  verifyWebhook(provider: string, data: any) {
    const strategy = this.paymentStrategies.get(provider);
    if (!strategy) {
      throw new Error(`Payment provider ${provider} not supported`);
    }
    return strategy.verifyWebhook(data);
  }
}
