import { Module } from '@nestjs/common';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';
import { DrawSeatService } from './draw-seat.service';
import { DrawSeatController } from './draw-seat.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeatController, DrawSeatController],
  providers: [SeatService, DrawSeatService],
  exports: [SeatService, DrawSeatService],
})
export class SeatModule {}
