import { Test, TestingModule } from '@nestjs/testing';
import { DrawSeatService } from './draw-seat.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDrawSeatDto } from './dto/create-draw-seat.dto';
import { UpdateDrawSeatDto } from './dto/update-draw-seat.dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

describe('DrawSeatService', () => {
  let service: DrawSeatService;
  let prisma: PrismaService;

  const mockSeat = {
    id: 'seat-uuid-123',
    campaignId: 'campaign-uuid-123',
    areaName: 'VIP',
    rowName: 'A',
    colName: '1',
    status: 'AVAILABLE',
  };

  const mockDrawSeat = {
    id: 'draw-seat-uuid-123',
    seatId: 'seat-uuid-123',
    xCoord: 10,
    yCoord: 20,
    color: '#FF0000',
    label: 'VIP-A1',
    createdAt: new Date(),
    updatedAt: new Date(),
    seat: mockSeat,
  };

  const mockPrismaService = {
    seat: {
      findUnique: jest.fn(),
    },
    drawSeat: {
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
        DrawSeatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DrawSeatService>(DrawSeatService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When creating a draw seat', () => {
    it('should create draw seat successfully', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.drawSeat.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.drawSeat.create as jest.Mock).mockResolvedValueOnce(mockDrawSeat);

      const dto: CreateDrawSeatDto = {
        seatId: 'seat-uuid-123',
        xCoord: 10,
        yCoord: 20,
        color: '#FF0000',
        label: 'VIP-A1',
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockDrawSeat);

      expect(prisma.seat.findUnique).toHaveBeenCalledWith({
        where: { id: dto.seatId },
      });
      expect(prisma.drawSeat.findUnique).toHaveBeenCalledWith({
        where: { seatId: dto.seatId },
      });
      expect(prisma.drawSeat.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if parent seat does not exist', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: CreateDrawSeatDto = {
        seatId: 'invalid-seat-id',
        xCoord: 10,
        yCoord: 20,
      };

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(
          'Không tìm thấy ghế có ID: invalid-seat-id',
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw ConflictException if seat already has draw coordinate config', async () => {
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.drawSeat.findUnique as jest.Mock).mockResolvedValueOnce(mockDrawSeat);

      const dto: CreateDrawSeatDto = {
        seatId: 'seat-uuid-123',
        xCoord: 10,
        yCoord: 20,
      };

      await expect(service.create(dto)).rejects.toThrow(
        new HttpException(
          'Ghế có ID: seat-uuid-123 đã được thiết lập toạ độ vẽ. Không thể tạo thêm.',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('When finding all draw seats', () => {
    it('should return paginated list of draw seats', async () => {
      (prisma.drawSeat.findMany as jest.Mock).mockResolvedValueOnce([mockDrawSeat]);
      (prisma.drawSeat.count as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        seatId: 'seat-uuid-123',
      });

      expect(result).toEqual({
        data: [mockDrawSeat],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(prisma.drawSeat.findMany).toHaveBeenCalledWith({
        where: { seatId: 'seat-uuid-123' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { seat: true },
      });
    });
  });

  describe('When finding a draw seat by id', () => {
    it('should return draw seat if found', async () => {
      (prisma.drawSeat.findUnique as jest.Mock).mockResolvedValueOnce(mockDrawSeat);

      const result = await service.findOne('draw-seat-uuid-123');
      expect(result).toEqual(mockDrawSeat);
      expect(prisma.drawSeat.findUnique).toHaveBeenCalledWith({
        where: { id: 'draw-seat-uuid-123' },
        include: { seat: true },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.drawSeat.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('draw-seat-uuid-123')).rejects.toThrow(
        new HttpException(
          'Không tìm thấy toạ độ vẽ ghế có ID: draw-seat-uuid-123',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('When updating a draw seat', () => {
    it('should update draw seat successfully', async () => {
      (prisma.drawSeat.findUnique as jest.Mock).mockResolvedValueOnce(mockDrawSeat);
      (prisma.drawSeat.update as jest.Mock).mockResolvedValueOnce({
        ...mockDrawSeat,
        xCoord: 50,
      });

      const dto: UpdateDrawSeatDto = {
        xCoord: 50,
      };

      const result = await service.update('draw-seat-uuid-123', dto);
      expect(result.xCoord).toEqual(50);
      expect(prisma.drawSeat.update).toHaveBeenCalled();
    });

    it('should check unique seatId constraint when seatId is updated', async () => {
      (prisma.drawSeat.findUnique as jest.Mock).mockResolvedValueOnce(mockDrawSeat);
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.drawSeat.findFirst as jest.Mock).mockResolvedValueOnce(mockDrawSeat); // conflict exists

      const dto: UpdateDrawSeatDto = {
        seatId: 'another-seat-id',
      };

      await expect(service.update('draw-seat-uuid-123', dto)).rejects.toThrow(
        new HttpException(
          'Ghế có ID: another-seat-id đã có toạ độ vẽ được gán cho bản ghi khác',
          HttpStatus.CONFLICT,
        ),
      );
    });
  });

  describe('When removing a draw seat', () => {
    it('should remove successfully', async () => {
      (prisma.drawSeat.findUnique as jest.Mock).mockResolvedValueOnce(mockDrawSeat);
      (prisma.drawSeat.delete as jest.Mock).mockResolvedValueOnce(mockDrawSeat);

      const result = await service.remove('draw-seat-uuid-123');
      expect(result).toEqual({
        message: 'Xóa toạ độ vẽ ghế thành công',
        id: 'draw-seat-uuid-123',
      });
      expect(prisma.drawSeat.delete).toHaveBeenCalledWith({
        where: { id: 'draw-seat-uuid-123' },
      });
    });
  });
});
