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
import { DrawSeatService } from './draw-seat.service';
import { CreateDrawSeatDto } from './dto/create-draw-seat.dto';
import { UpdateDrawSeatDto } from './dto/update-draw-seat.dto';

@Controller('draw-seats')
export class DrawSeatController {
  constructor(private readonly drawSeatService: DrawSeatService) {}

  /**
   * API Tạo mới toạ độ vẽ ghế
   * HTTP Method: POST /draw-seats
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDrawSeatDto: CreateDrawSeatDto) {
    return this.drawSeatService.create(createDrawSeatDto);
  }

  /**
   * API Lấy danh sách toạ độ vẽ ghế (phân trang, lọc theo seatId)
   * HTTP Method: GET /draw-seats
   */
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('seatId') seatId?: string,
  ) {
    return this.drawSeatService.findAll({ page, limit, seatId });
  }

  /**
   * API Lấy chi tiết toạ độ vẽ ghế theo ID
   * HTTP Method: GET /draw-seats/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.drawSeatService.findOne(id);
  }

  /**
   * API Cập nhật toạ độ vẽ ghế
   * HTTP Method: PATCH /draw-seats/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrawSeatDto: UpdateDrawSeatDto,
  ) {
    return this.drawSeatService.update(id, updateDrawSeatDto);
  }

  /**
   * API Xoá toạ độ vẽ ghế
   * HTTP Method: DELETE /draw-seats/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.drawSeatService.remove(id);
  }
}
