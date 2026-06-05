import { Test, TestingModule } from '@nestjs/testing';
import { SeatController } from './seat.controller';
import { SeatService } from './seat.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';

describe('SeatController', () => {
  let controller: SeatController;
  let service: SeatService;

  const mockSeat = {
    id: 'seat-uuid-123',
    campaignId: 'campaign-uuid-123',
    areaName: 'VIP',
    rowName: 'A',
    colName: '1',
    status: 'AVAILABLE',
  };

  const mockSeatService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeatController],
      providers: [
        {
          provide: SeatService,
          useValue: mockSeatService,
        },
      ],
    }).compile();

    controller = module.get<SeatController>(SeatController);
    service = module.get<SeatService>(SeatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call seatService.create and return the created seat', async () => {
      const dto: CreateSeatDto = {
        campaignId: 'campaign-uuid-123',
        areaName: 'VIP',
        rowName: 'A',
        colName: '1',
      };
      (service.create as jest.Mock).mockResolvedValueOnce(mockSeat);

      const result = await controller.create(dto);
      expect(result).toEqual(mockSeat);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call seatService.findAll with queries and return result', async () => {
      const queryResult = {
        data: [mockSeat],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (service.findAll as jest.Mock).mockResolvedValueOnce(queryResult);

      const result = await controller.findAll(1, 10, 'campaign-uuid-123', 'AVAILABLE', 'VIP');
      expect(result).toEqual(queryResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        campaignId: 'campaign-uuid-123',
        status: 'AVAILABLE',
        areaName: 'VIP',
      });
    });
  });

  describe('findOne', () => {
    it('should call seatService.findOne and return the seat details', async () => {
      (service.findOne as jest.Mock).mockResolvedValueOnce(mockSeat);

      const result = await controller.findOne('seat-uuid-123');
      expect(result).toEqual(mockSeat);
      expect(service.findOne).toHaveBeenCalledWith('seat-uuid-123');
    });
  });

  describe('update', () => {
    it('should call seatService.update and return updated seat details', async () => {
      const dto: UpdateSeatDto = { status: 'BOOKED' };
      const updatedSeat = { ...mockSeat, status: 'BOOKED' };
      (service.update as jest.Mock).mockResolvedValueOnce(updatedSeat);

      const result = await controller.update('seat-uuid-123', dto);
      expect(result).toEqual(updatedSeat);
      expect(service.update).toHaveBeenCalledWith('seat-uuid-123', dto);
    });
  });

  describe('remove', () => {
    it('should call seatService.remove and return success status', async () => {
      const deleteResult = { message: 'Xóa ghế thành công', id: 'seat-uuid-123' };
      (service.remove as jest.Mock).mockResolvedValueOnce(deleteResult);

      const result = await controller.remove('seat-uuid-123');
      expect(result).toEqual(deleteResult);
      expect(service.remove).toHaveBeenCalledWith('seat-uuid-123');
    });
  });
});
