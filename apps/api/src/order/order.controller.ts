import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { Request } from 'express';
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ) {
    let rawIp =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress;

    if (Array.isArray(rawIp)) {
      rawIp = rawIp[0];
    } else if (typeof rawIp === 'string' && rawIp.includes(',')) {
      rawIp = rawIp.split(',')[0].trim();
    }

    // Map IPv6 localhost (::1) về IPv4 (127.0.0.1)
    const ipAddr = rawIp === '::1' ? '127.0.0.1' : (rawIp as string);

    if (!ipAddr) throw new BadRequestException('Unknow Address');

    const result = await this.orderService.create(createOrderDto, ipAddr);
    return {
      success: true,
      url: result,
      message: 'Tạo payment thành công',
    };
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
