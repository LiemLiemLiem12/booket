import { Module } from '@nestjs/common';
import { TicketSaleSessionService } from './ticket-sale-session.service';
import { TicketSaleSessionController } from './ticket-sale-session.controller';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketSaleSessionController, TicketController],
  providers: [TicketSaleSessionService, TicketService],
  exports: [TicketSaleSessionService, TicketService],
})
export class TicketModule {}
