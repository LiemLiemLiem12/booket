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
import { TicketSaleSessionService } from './ticket-sale-session.service';
import { CreateTicketSaleSessionDto } from './dto/create-ticket-sale-session.dto';
import { UpdateTicketSaleSessionDto } from './dto/update-ticket-sale-session.dto';

@Controller('ticket-sale-sessions')
export class TicketSaleSessionController {
  constructor(private readonly sessionService: TicketSaleSessionService) {}

  /**
   * API Tạo mới phiên bán vé
   * HTTP Method: POST /ticket-sale-sessions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateTicketSaleSessionDto) {
    return this.sessionService.create(createDto);
  }

  /**
   * API Lấy danh sách phiên bán vé (hỗ trợ phân trang, lọc theo campaign, status, tìm kiếm theo tên)
   * HTTP Method: GET /ticket-sale-sessions
   */
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('campaignId') campaignId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.sessionService.findAll({
      page,
      limit,
      campaignId,
      status,
      search,
    });
  }

  /**
   * API Chi tiết phiên bán vé theo ID
   * HTTP Method: GET /ticket-sale-sessions/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.findOne(id);
  }

  /**
   * API Cập nhật thông tin phiên bán vé
   * HTTP Method: PATCH /ticket-sale-sessions/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTicketSaleSessionDto,
  ) {
    return this.sessionService.update(id, updateDto);
  }

  /**
   * API Xóa phiên bán vé
   * HTTP Method: DELETE /ticket-sale-sessions/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.remove(id);
  }
}
