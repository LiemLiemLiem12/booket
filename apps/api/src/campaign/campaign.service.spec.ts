import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { NotFoundException } from '@nestjs/common';

describe('CampaignService', () => {
  let service: CampaignService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-uuid-123',
    email: 'creator@test.com',
  };

  const mockCampaign = {
    id: 'campaign-uuid-123',
    creatorId: 'user-uuid-123',
    title: 'Rock Concert 2026',
    description: 'Awesome rock concert',
    bannerUrl: 'banner.png',
    avatarUrl: 'avatar.png',
    eventType: 'CONCERT',
    city: 'Hanoi',
    location: 'My Dinh Stadium',
    startTime: new Date('2026-06-10T19:00:00Z'),
    endTime: new Date('2026-06-10T22:00:00Z'),
    status: 'DRAFT',
    maxSeatsPerOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    campaign: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When creating a campaign', () => {
    it('should create a campaign successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (prisma.campaign.create as jest.Mock).mockResolvedValueOnce(mockCampaign);

      const dto: CreateCampaignDto = {
        creatorId: 'user-uuid-123',
        title: 'Rock Concert 2026',
        description: 'Awesome rock concert',
        bannerUrl: 'banner.png',
        avatarUrl: 'avatar.png',
        eventType: 'CONCERT',
        city: 'Hanoi',
        location: 'My Dinh Stadium',
        startTime: '2026-06-10T19:00:00Z',
        endTime: '2026-06-10T22:00:00Z',
        status: 'DRAFT',
        maxSeatsPerOrder: 4,
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockCampaign);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: dto.creatorId },
      });
      expect(prisma.campaign.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if creator does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: CreateCampaignDto = {
        creatorId: 'invalid-user-uuid',
        title: 'Rock Concert 2026',
        description: 'Awesome rock concert',
        eventType: 'CONCERT',
        city: 'Hanoi',
        location: 'My Dinh Stadium',
        startTime: '2026-06-10T19:00:00Z',
        endTime: '2026-06-10T22:00:00Z',
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: dto.creatorId },
      });
      expect(prisma.campaign.create).not.toHaveBeenCalled();
    });
  });

  describe('When finding all campaigns', () => {
    it('should return paginated campaigns list', async () => {
      (prisma.campaign.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.campaign.findMany as jest.Mock).mockResolvedValueOnce([mockCampaign]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        city: 'Hanoi',
        search: 'Rock',
      });

      expect(result).toEqual({
        data: [mockCampaign],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(prisma.campaign.count).toHaveBeenCalledWith({
        where: {
          city: { contains: 'Hanoi', mode: 'insensitive' },
          title: { contains: 'Rock', mode: 'insensitive' },
        },
      });
      expect(prisma.campaign.findMany).toHaveBeenCalled();
    });
  });

  describe('When finding one campaign', () => {
    it('should return a campaign details if exists', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);

      const result = await service.findOne('campaign-uuid-123');
      expect(result).toEqual(mockCampaign);
      expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'campaign-uuid-123' },
      });
    });

    it('should throw NotFoundException if campaign not found', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('When updating a campaign', () => {
    it('should update campaign successfully', async () => {
      const updatedCampaign = { ...mockCampaign, title: 'Updated Title' };
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);
      (prisma.campaign.update as jest.Mock).mockResolvedValueOnce(updatedCampaign);

      const dto: UpdateCampaignDto = { title: 'Updated Title' };
      const result = await service.update('campaign-uuid-123', dto);

      expect(result).toEqual(updatedCampaign);
      expect(prisma.campaign.update).toHaveBeenCalled();
    });

    it('should check if new creator exists if creatorId is updated', async () => {
      const updatedCampaign = { ...mockCampaign, creatorId: 'new-user-uuid' };
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);
      (prisma.campaign.update as jest.Mock).mockResolvedValueOnce(updatedCampaign);

      const dto: UpdateCampaignDto = { creatorId: 'new-user-uuid' };
      const result = await service.update('campaign-uuid-123', dto);

      expect(result).toEqual(updatedCampaign);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'new-user-uuid' },
      });
    });

    it('should throw NotFoundException if new creator does not exist', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: UpdateCampaignDto = { creatorId: 'invalid-user-uuid' };
      await expect(service.update('campaign-uuid-123', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('When removing a campaign', () => {
    it('should delete a campaign if exists', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);
      (prisma.campaign.delete as jest.Mock).mockResolvedValueOnce(mockCampaign);

      const result = await service.remove('campaign-uuid-123');
      expect(result).toEqual({
        message: 'Xóa chiến dịch thành công',
        id: 'campaign-uuid-123',
      });
      expect(prisma.campaign.delete).toHaveBeenCalledWith({
        where: { id: 'campaign-uuid-123' },
      });
    });
  });
});
