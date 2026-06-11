import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PaymentModule } from 'src/payment/payment.module';
import { OrderCronService } from './order-cron.service';

@Module({
  imports: [PaymentModule],
  controllers: [OrderController],
  providers: [OrderService, OrderCronService],
})
export class OrderModule {}
