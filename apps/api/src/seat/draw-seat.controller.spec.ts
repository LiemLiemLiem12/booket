import { Test, TestingModule } from '@nestjs/testing';
import { DrawSeatController } from './draw-seat.controller';
import { DrawSeatService } from './draw-seat.service';
import { CreateDrawSeatDto } from './dto/create-draw-seat.dto';
import { UpdateDrawSeatDto } from './dto/update-draw-seat.dto';

describe('DrawSeatController', () => {
  let controller: DrawSeatController;
  let service: DrawSeatService;

  const mockDrawSeat = {
    id: 'draw-seat-uuid-123',
    seatId: 'seat-uuid-123',
    xCoord: 10,
    yCoord: 20,
    color: '#FF0000',
    label: 'VIP-A1',
  };

  const mockDrawSeatService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrawSeatController],
      providers: [
        {
          provide: DrawSeatService,
          useValue: mockDrawSeatService,
        },
      ],
    }).compile();

    controller = module.get<DrawSeatController>(DrawSeatController);
    service = module.get<DrawSeatService>(DrawSeatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call drawSeatService.create and return created result', async () => {
      const dto: CreateDrawSeatDto = {
        seatId: 'seat-uuid-123',
        xCoord: 10,
        yCoord: 20,
      };
      (service.create as jest.Mock).mockResolvedValueOnce(mockDrawSeat);

      const result = await controller.create(dto);
      expect(result).toEqual(mockDrawSeat);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call drawSeatService.findAll with query parameters', async () => {
      const queryResult = {
        data: [mockDrawSeat],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (service.findAll as jest.Mock).mockResolvedValueOnce(queryResult);

      const result = await controller.findAll(1, 10, 'seat-uuid-123');
      expect(result).toEqual(queryResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        seatId: 'seat-uuid-123',
      });
    });
  });

  describe('findOne', () => {
    it('should call drawSeatService.findOne and return detail', async () => {
      (service.findOne as jest.Mock).mockResolvedValueOnce(mockDrawSeat);

      const result = await controller.findOne('draw-seat-uuid-123');
      expect(result).toEqual(mockDrawSeat);
      expect(service.findOne).toHaveBeenCalledWith('draw-seat-uuid-123');
    });
  });

  describe('update', () => {
    it('should call drawSeatService.update and return updated result', async () => {
      const dto: UpdateDrawSeatDto = { color: '#0000FF' };
      const updatedDrawSeat = { ...mockDrawSeat, color: '#0000FF' };
      (service.update as jest.Mock).mockResolvedValueOnce(updatedDrawSeat);

      const result = await controller.update('draw-seat-uuid-123', dto);
      expect(result).toEqual(updatedDrawSeat);
      expect(service.update).toHaveBeenCalledWith('draw-seat-uuid-123', dto);
    });
  });

  describe('remove', () => {
    it('should call drawSeatService.remove and return success status', async () => {
      const deleteResult = { message: 'Xóa toạ độ vẽ ghế thành công', id: 'draw-seat-uuid-123' };
      (service.remove as jest.Mock).mockResolvedValueOnce(deleteResult);

      const result = await controller.remove('draw-seat-uuid-123');
      expect(result).toEqual(deleteResult);
      expect(service.remove).toHaveBeenCalledWith('draw-seat-uuid-123');
    });
  });
});
