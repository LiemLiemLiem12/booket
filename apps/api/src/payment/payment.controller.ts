import { Controller, Get, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('ipn')
  handleIPN(@Req() request: any) {
    let params = { request };
    return this.paymentService.verifyWebhook('VNPAY', params);
  }
}
