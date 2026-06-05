import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SeatService } from './seat.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';

@Controller('seats')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  /**
   * API Tạo mới ghế
   * HTTP Method: POST /seats
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSeatDto: CreateSeatDto) {
    return this.seatService.create(createSeatDto);
  }

  /**
   * API Lấy danh sách ghế (hỗ trợ phân trang, lọc theo campaign, status, areaName)
   * HTTP Method: GET /seats
   */
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('campaignId') campaignId?: string,
    @Query('status') status?: string,
    @Query('areaName') areaName?: string,
  ) {
    return this.seatService.findAll({ page, limit, campaignId, status, areaName });
  }

  /**
   * API Chi tiết ghế theo ID
   * HTTP Method: GET /seats/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.seatService.findOne(id);
  }

  /**
   * API Cập nhật thông tin ghế
   * HTTP Method: PATCH /seats/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSeatDto: UpdateSeatDto,
  ) {
    return this.seatService.update(id, updateSeatDto);
  }

  /**
   * API Xóa ghế
   * HTTP Method: DELETE /seats/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.seatService.remove(id);
  }
}
