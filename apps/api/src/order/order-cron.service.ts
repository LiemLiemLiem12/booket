import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { OrderService } from './order.service';

@Injectable()
export class OrderCronService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderCronService.name);
  private expiryInterval!: NodeJS.Timeout;

  constructor(private readonly orderService: OrderService) {}

  onModuleInit() {
    this.logger.log(
      'Order Expiry Watcher starting. Checking for expired orders every 30 seconds...',
    );

    this.expiryInterval = setInterval(async () => {
      try {
        const result = await this.orderService.handleExpiredOrders();
        if (result.count > 0) {
          this.logger.log(
            `Successfully reverted ${result.count} expired orders.`,
          );
        }
      } catch (error) {
        this.logger.error(
          'Error during scheduled expired orders check:',
          error,
        );
      }
    }, 30000);
  }

  onModuleDestroy() {
    if (this.expiryInterval) {
      clearInterval(this.expiryInterval);
      this.logger.log('Order Expiry Watcher stopped.');
    }
  }
}
