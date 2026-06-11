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
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * API Tạo mới vé
   * HTTP Method: POST /tickets
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }

  /**
   * API Lấy danh sách vé (hỗ trợ phân trang, lọc theo session, seat, status, order)
   * HTTP Method: GET /tickets
   */
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sessionId') sessionId?: string,
    @Query('seatId') seatId?: string,
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.ticketService.findAll({
      page,
      limit,
      sessionId,
      seatId,
      status,
      orderId,
    });
  }

  /**
   * API Chi tiết vé theo ID
   * HTTP Method: GET /tickets/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketService.findOne(id);
  }

  /**
   * API Cập nhật thông tin vé
   * HTTP Method: PATCH /tickets/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketService.update(id, updateTicketDto);
  }

  /**
   * API Xóa vé
   * HTTP Method: DELETE /tickets/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketService.remove(id);
  }
}
