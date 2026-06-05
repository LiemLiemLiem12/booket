import { Test, TestingModule } from '@nestjs/testing';
import { SeatService } from './seat.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

describe('SeatService', () => {
  let service: SeatService;
  let prisma: PrismaService;

  const mockCampaign = {
    id: 'campaign-uuid-123',
    title: 'Test Campaign',
  };

  const mockSeat = {
    id: 'seat-uuid-123',
    campaignId: 'campaign-uuid-123',
    areaName: 'VIP',
    rowName: 'A',
    colName: '1',
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    drawSeat: null,
  };

  const mockPrismaService = {
    campaign: {
      findUnique: jest.fn(),
    },
    seat: {
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
        SeatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SeatService>(SeatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When creating a seat', () => {
    it('should create a seat successfully', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.seat.create as jest.Mock).mockResolvedValueOnce(mockSeat);

      const dto: CreateSeatDto = {
        campaignId: 'campaign-uuid-123',
        areaName: 'VIP',
        rowName: 'A',
        colName: '1',
        status: 'AVAILABLE',
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockSeat);

      expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: dto.campaignId },
      });
      expect(prisma.seat.findUnique).toHaveBeenCalledWith({
        where: {
          campaignId_rowName_colName: {
            campaignId: dto.campaignId,
            rowName: dto.rowName,
            colName: dto.colName,
          },
        },
      });
      expect(prisma.seat.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if campaign does not exist', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: CreateSeatDto = {
        campaignId: 'invalid-campaign-id',
        areaName: 'VIP',
        rowName: 'A',
        colName: '1',
      };

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(
          'Không tìm thấy chiến dịch có ID: invalid-campaign-id',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw ConflictException if seat position already exists in campaign', async () => {
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValueOnce(mockCampaign);
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);

      const dto: CreateSeatDto = {
        campaignId: 'campaign-uuid-123',
        areaName: 'VIP',
        rowName: 'A',
        colName: '1',
      };

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(
          'Ghế tại vị trí Row A, Col 1 đã tồn tại trong chiến dịch này',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('When finding all seats', () => {
    it('should return paginated list of seats', async () => {
      (prisma.seat.findMany as jest.Mock).mockResolvedValueOnce([mockSeat]);
      (prisma.seat.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        campaignId: 'campaign-uuid-123',
        status: 'AVAILABLE',
        areaName: 'VIP',
      });

      expect(result).toEqual({
        data: [mockSeat],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(prisma.seat.findMany).toHaveBeenCalledWith({
        where: {
          campaignId: 'campaign-uuid-123',
          status: 'AVAILABLE',
          areaName: {
            contains: 'VIP',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { drawSeat: true },
      });
    });
  });

  describe('When finding a seat by id', () => {
    it('should return seat if it exists', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);

      const result = await service.findOne('seat-uuid-123');
      expect(result).toEqual(mockSeat);
      expect(prisma.seat.findUnique).toHaveBeenCalledWith({
        where: { id: 'seat-uuid-123' },
        include: { drawSeat: true },
      });
    });

    it('should throw NotFoundException if seat does not exist', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('seat-uuid-123')).rejects.toThrow(
        new HttpException(
          'Không tìm thấy ghế có ID: seat-uuid-123',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('When updating a seat', () => {
    it('should update seat successfully', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.seat.update as jest.Mock).mockResolvedValueOnce({
        ...mockSeat,
        areaName: 'Regular',
      });

      const dto: UpdateSeatDto = {
        areaName: 'Regular',
      };

      const result = await service.update('seat-uuid-123', dto);
      expect(result.areaName).toEqual('Regular');
      expect(prisma.seat.update).toHaveBeenCalled();
    });

    it('should check unique position constraint when row or col changes', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.seat.findFirst as jest.Mock).mockResolvedValueOnce(mockSeat); // conflict seat exists

      const dto: UpdateSeatDto = {
        rowName: 'B',
      };

      await expect(service.update('seat-uuid-123', dto)).rejects.toThrow(
        new HttpException(
          'Vị trí ghế Row B, Col 1 đã được sử dụng trong chiến dịch này bởi một ghế khác',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('When removing a seat', () => {
    it('should remove seat successfully', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.seat.delete as jest.Mock).mockResolvedValueOnce(mockSeat);

      const result = await service.remove('seat-uuid-123');
      expect(result).toEqual({
        message: 'Xóa ghế thành công',
        id: 'seat-uuid-123',
      });
      expect(prisma.seat.delete).toHaveBeenCalledWith({
        where: { id: 'seat-uuid-123' },
      });
    });
  });
});
