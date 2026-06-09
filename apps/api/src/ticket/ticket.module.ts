import { Module } from '@nestjs/common';
import { TicketSaleSessionService } from './ticket-sale-session.service';
import { TicketSaleSessionController } from './ticket-sale-session.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketSaleSessionController],
  providers: [TicketSaleSessionService],
  exports: [TicketSaleSessionService],
})
export class TicketModule {}
