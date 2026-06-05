import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CampaignModule } from './campaign/campaign.module';
import { SeatModule } from './seat/seat.module';
import { TicketModule } from './ticket/ticket.module';
import { OrderModule } from './order/order.module';
import { SytemConfigModule } from './sytem-config/sytem-config.module';

@Module({
  imports: [PrismaModule, UserModule, CampaignModule, SeatModule, TicketModule, OrderModule, SytemConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
