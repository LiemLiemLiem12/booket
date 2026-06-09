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
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  /**
   * API Tạo mới chiến dịch
   * HTTP Method: POST /campaigns
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
  }

  /**
   * API Lấy danh sách chiến dịch (hỗ trợ phân trang, lọc theo creator, status, city, eventType, search)
   * HTTP Method: GET /campaigns
   */
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('creatorId') creatorId?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
    @Query('eventType') eventType?: string,
    @Query('search') search?: string,
  ) {
    return this.campaignService.findAll({
      page,
      limit,
      creatorId,
      status,
      city,
      eventType,
      search,
    });
  }

  /**
   * API Chi tiết chiến dịch theo ID
   * HTTP Method: GET /campaigns/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.findOne(id);
  }

  /**
   * API Cập nhật thông tin chiến dịch
   * HTTP Method: PATCH /campaigns/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(id, updateCampaignDto);
  }

  /**
   * API Xóa chiến dịch
   * HTTP Method: DELETE /campaigns/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.remove(id);
  }
}
