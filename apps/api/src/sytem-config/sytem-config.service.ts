import { Injectable } from '@nestjs/common';
import { CreateSytemConfigDto } from './dto/create-sytem-config.dto';
import { UpdateSytemConfigDto } from './dto/update-sytem-config.dto';

@Injectable()
export class SytemConfigService {
  create(createSytemConfigDto: CreateSytemConfigDto) {
    return 'This action adds a new sytemConfig';
  }

  findAll() {
    return `This action returns all sytemConfig`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sytemConfig`;
  }

  update(id: number, updateSytemConfigDto: UpdateSytemConfigDto) {
    return `This action updates a #${id} sytemConfig`;
  }

  remove(id: number) {
    return `This action removes a #${id} sytemConfig`;
  }
}
