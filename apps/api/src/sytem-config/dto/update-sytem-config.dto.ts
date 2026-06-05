import { PartialType } from '@nestjs/mapped-types';
import { CreateSytemConfigDto } from './create-sytem-config.dto';

export class UpdateSytemConfigDto extends PartialType(CreateSytemConfigDto) {}
