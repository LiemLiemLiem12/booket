import { Controller, Get, Post, Body, Req, Query, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: Request,
  ) {
    let rawIp =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress;

    if (Array.isArray(rawIp)) {
      rawIp = rawIp[0];
    } else if (typeof rawIp === 'string' && rawIp.includes(',')) {
      rawIp = rawIp.split(',')[0].trim();
    }

    const ipAddr = rawIp === '::1' ? '127.0.0.1' : (rawIp as string);

    if (!ipAddr) throw new BadRequestException('Unknown IP Address');

    const result = await this.paymentService.createPaymentLink(
      createPaymentDto.orderId,
      createPaymentDto.paymentGateway,
      ipAddr,
    );

    return {
      success: true,
      data: result,
      message: 'Tạo liên kết thanh toán thành công',
    };
  }

  @Get('ipn')
  handleIPN(@Query() query: any) {
    const isValidSignature = this.paymentService.verifyWebhook('VNPAY', query);
    if (!isValidSignature) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const vnpResponseCode = query['vnp_ResponseCode'];
    if (vnpResponseCode === '00') {
      this.eventEmitter.emit('order.payment.success', query);
    } else {
      this.eventEmitter.emit('order.payment.failed', query);
    }

    return { RspCode: '00', Message: 'Confirm success' };
  }
}
