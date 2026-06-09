import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Prisma } from 'src/generated/prisma';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo chiến dịch mới
   */
  async create(createCampaignDto: CreateCampaignDto) {
    const creator = await this.prisma.user.findUnique({
      where: { id: createCampaignDto.creatorId },
    });
    if (!creator) {
      throw new NotFoundException(
        `Không tìm thấy người dùng (creator) có ID: ${createCampaignDto.creatorId}`,
      );
    }

    const data: Prisma.CampaignCreateInput = {
      creator: { connect: { id: createCampaignDto.creatorId } },
      title: createCampaignDto.title,
      description: createCampaignDto.description,
      bannerUrl: createCampaignDto.bannerUrl,
      avatarUrl: createCampaignDto.avatarUrl,
      eventType: createCampaignDto.eventType,
      city: createCampaignDto.city,
      location: createCampaignDto.location,
      startTime: new Date(createCampaignDto.startTime),
      endTime: new Date(createCampaignDto.endTime),
      status: createCampaignDto.status || 'DRAFT',
      maxSeatsPerOrder: createCampaignDto.maxSeatsPerOrder !== undefined ? createCampaignDto.maxSeatsPerOrder : 4,
    };

    return this.prisma.campaign.create({
      data,
    });
  }

  /**
   * Lấy danh sách chiến dịch có phân trang và bộ lọc
   */
  async findAll(query?: {
    page?: number;
    limit?: number;
    creatorId?: string;
    status?: string;
    city?: string;
    eventType?: string;
    search?: string;
  }) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {};

    if (query?.creatorId) {
      where.creatorId = query.creatorId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.city) {
      where.city = {
        contains: query.city,
        mode: 'insensitive',
      };
    }

    if (query?.eventType) {
      where.eventType = {
        contains: query.eventType,
        mode: 'insensitive',
      };
    }

    if (query?.search) {
      where.title = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [total, campaigns] = await Promise.all([
      this.prisma.campaign.count({ where }),
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: campaigns,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Chi tiết chiến dịch theo ID
   */
  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException(`Không tìm thấy chiến dịch có ID: ${id}`);
    }

    return campaign;
  }

  /**
   * Cập nhật thông tin chiến dịch
   */
  async update(id: string, updateCampaignDto: UpdateCampaignDto) {
    const currentCampaign = await this.findOne(id);

    if (
      updateCampaignDto.creatorId &&
      updateCampaignDto.creatorId !== currentCampaign.creatorId
    ) {
      const creator = await this.prisma.user.findUnique({
        where: { id: updateCampaignDto.creatorId },
      });
      if (!creator) {
        throw new NotFoundException(
          `Không tìm thấy người dùng (creator) có ID: ${updateCampaignDto.creatorId}`,
        );
      }
    }

    const data: Prisma.CampaignUpdateInput = {};

    if (updateCampaignDto.creatorId) {
      data.creator = { connect: { id: updateCampaignDto.creatorId } };
    }
    if (updateCampaignDto.title !== undefined) {
      data.title = updateCampaignDto.title;
    }
    if (updateCampaignDto.description !== undefined) {
      data.description = updateCampaignDto.description;
    }
    if (updateCampaignDto.bannerUrl !== undefined) {
      data.bannerUrl = updateCampaignDto.bannerUrl;
    }
    if (updateCampaignDto.avatarUrl !== undefined) {
      data.avatarUrl = updateCampaignDto.avatarUrl;
    }
    if (updateCampaignDto.eventType !== undefined) {
      data.eventType = updateCampaignDto.eventType;
    }
    if (updateCampaignDto.city !== undefined) {
      data.city = updateCampaignDto.city;
    }
    if (updateCampaignDto.location !== undefined) {
      data.location = updateCampaignDto.location;
    }
    if (updateCampaignDto.startTime !== undefined) {
      data.startTime = new Date(updateCampaignDto.startTime);
    }
    if (updateCampaignDto.endTime !== undefined) {
      data.endTime = new Date(updateCampaignDto.endTime);
    }
    if (updateCampaignDto.status !== undefined) {
      data.status = updateCampaignDto.status;
    }
    if (updateCampaignDto.maxSeatsPerOrder !== undefined) {
      data.maxSeatsPerOrder = updateCampaignDto.maxSeatsPerOrder;
    }

    return this.prisma.campaign.update({
      where: { id },
      data,
    });
  }

  /**
   * Xóa chiến dịch
   */
  async remove(id: string) {
    await this.findOne(id);

    const deletedCampaign = await this.prisma.campaign.delete({
      where: { id },
    });

    return {
      message: 'Xóa chiến dịch thành công',
      id: deletedCampaign.id,
    };
  }
}
