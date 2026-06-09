import { Test, TestingModule } from '@nestjs/testing';
import { TicketSaleSessionService } from './ticket-sale-session.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketSaleSessionDto } from './dto/create-ticket-sale-session.dto';
import { UpdateTicketSaleSessionDto } from './dto/update-ticket-sale-session.dto';
import { NotFoundException } from '@nestjs/common';

describe('TicketSaleSessionService', () => {
  let service: TicketSaleSessionService;
  let prisma: PrismaService;

  const mockCampaign = {
    id: 'campaign-uuid-123',
    title: 'Test Campaign',
  };

  const mockSession = {
    id: 'session-uuid-123',
    campaignId: 'campaign-uuid-123',
    name: 'Early Bird Ticket Sale',
    startTime: new Date('2026-06-10T08:00:00Z'),
    endTime: new Date('2026-06-10T17:00:00Z'),
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    campaign: {
      findUnique: jest.fn(),
    },
    ticketSaleSession: {
      findUnique: jest.fn(),
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
        TicketSaleSessionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketSaleSessionService>(TicketSaleSessionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When creating a ticket sale session', () => {
    it('should create successfully', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);
      (prisma.ticketSaleSession.create as jest.Mock).mockResolvedValueOnce(mockSession);

      const dto: CreateTicketSaleSessionDto = {
        campaignId: 'campaign-uuid-123',
        name: 'Early Bird Ticket Sale',
        startTime: '2026-06-10T08:00:00Z',
        endTime: '2026-06-10T17:00:00Z',
        status: 'DRAFT',
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockSession);
      expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: dto.campaignId },
      });
      expect(prisma.ticketSaleSession.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if campaign not found', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: CreateTicketSaleSessionDto = {
        campaignId: 'invalid-campaign-uuid',
        name: 'Early Bird Ticket Sale',
        startTime: '2026-06-10T08:00:00Z',
        endTime: '2026-06-10T17:00:00Z',
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('When finding all ticket sale sessions', () => {
    it('should return paginated list', async () => {
      (prisma.ticketSaleSession.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.ticketSaleSession.findMany as jest.Mock).mockResolvedValueOnce([mockSession]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        campaignId: 'campaign-uuid-123',
        search: 'Early',
      });

      expect(result).toEqual({
        data: [mockSession],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(prisma.ticketSaleSession.count).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaign-uuid-123',
          name: { contains: 'Early', mode: 'insensitive' },
        },
      });
    });
  });

  describe('When finding one ticket sale session', () => {
    it('should return details if exists', async () => {
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);

      const result = await service.findOne('session-uuid-123');
      expect(result).toEqual(mockSession);
      expect(prisma.ticketSaleSession.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-uuid-123' },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('When updating a ticket sale session', () => {
    it('should update successfully', async () => {
      const updatedSession = { ...mockSession, name: 'Updated Name' };
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.ticketSaleSession.update as jest.Mock).mockResolvedValueOnce(updatedSession);

      const dto: UpdateTicketSaleSessionDto = { name: 'Updated Name' };
      const result = await service.update('session-uuid-123', dto);

      expect(result).toEqual(updatedSession);
    });

    it('should check if campaign exists if campaignId is updated', async () => {
      const updatedSession = { ...mockSession, campaignId: 'new-campaign-uuid' };
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);
      (prisma.ticketSaleSession.update as jest.Mock).mockResolvedValueOnce(updatedSession);

      const dto: UpdateTicketSaleSessionDto = { campaignId: 'new-campaign-uuid' };
      const result = await service.update('session-uuid-123', dto);

      expect(result).toEqual(updatedSession);
      expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 'new-campaign-uuid' },
      });
    });

    it('should throw NotFoundException if new campaign not found', async () => {
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: UpdateTicketSaleSessionDto = { campaignId: 'invalid-campaign-uuid' };
      await expect(service.update('session-uuid-123', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('When removing a ticket sale session', () => {
    it('should delete if exists', async () => {
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.ticketSaleSession.delete as jest.Mock).mockResolvedValueOnce(mockSession);

      const result = await service.remove('session-uuid-123');
      expect(result).toEqual({
        message: 'Xóa phiên bán vé thành công',
        id: 'session-uuid-123',
      });
    });
  });
});
