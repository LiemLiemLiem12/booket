import { Module } from '@nestjs/common';
import { SytemConfigService } from './sytem-config.service';
import { SytemConfigController } from './sytem-config.controller';

@Module({
  controllers: [SytemConfigController],
  providers: [SytemConfigService],
})
export class SytemConfigModule {}
