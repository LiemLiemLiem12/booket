import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SytemConfigService } from './sytem-config.service';
import { CreateSytemConfigDto } from './dto/create-sytem-config.dto';
import { UpdateSytemConfigDto } from './dto/update-sytem-config.dto';

@Controller('sytem-config')
export class SytemConfigController {
  constructor(private readonly sytemConfigService: SytemConfigService) {}

  @Post()
  create(@Body() createSytemConfigDto: CreateSytemConfigDto) {
    return this.sytemConfigService.create(createSytemConfigDto);
  }

  @Get()
  findAll() {
    return this.sytemConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sytemConfigService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSytemConfigDto: UpdateSytemConfigDto) {
    return this.sytemConfigService.update(+id, updateSytemConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sytemConfigService.remove(+id);
  }
}
