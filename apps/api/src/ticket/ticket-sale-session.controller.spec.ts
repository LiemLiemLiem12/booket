import { Test, TestingModule } from '@nestjs/testing';
import { TicketSaleSessionController } from './ticket-sale-session.controller';
import { TicketSaleSessionService } from './ticket-sale-session.service';
import { CreateTicketSaleSessionDto } from './dto/create-ticket-sale-session.dto';
import { UpdateTicketSaleSessionDto } from './dto/update-ticket-sale-session.dto';

describe('TicketSaleSessionController', () => {
  let controller: TicketSaleSessionController;
  let service: TicketSaleSessionService;

  const mockSession = {
    id: 'session-uuid-123',
    campaignId: 'campaign-uuid-123',
    name: 'Early Bird Ticket Sale',
    startTime: '2026-06-10T08:00:00Z',
    endTime: '2026-06-10T17:00:00Z',
    status: 'DRAFT',
  };

  const mockSessionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketSaleSessionController],
      providers: [
        {
          provide: TicketSaleSessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    controller = module.get<TicketSaleSessionController>(TicketSaleSessionController);
    service = module.get<TicketSaleSessionService>(TicketSaleSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call sessionService.create and return the created session', async () => {
      const dto: CreateTicketSaleSessionDto = {
        campaignId: 'campaign-uuid-123',
        name: 'Early Bird Ticket Sale',
        startTime: '2026-06-10T08:00:00Z',
        endTime: '2026-06-10T17:00:00Z',
        status: 'DRAFT',
      };
      (service.create as jest.Mock).mockResolvedValueOnce(mockSession);

      const result = await controller.create(dto);
      expect(result).toEqual(mockSession);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call sessionService.findAll with queries and return result', async () => {
      const queryResult = {
        data: [mockSession],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (service.findAll as jest.Mock).mockResolvedValueOnce(queryResult);

      const result = await controller.findAll(1, 10, 'campaign-uuid-123', 'DRAFT', 'Early');
      expect(result).toEqual(queryResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        campaignId: 'campaign-uuid-123',
        status: 'DRAFT',
        search: 'Early',
      });
    });
  });

  describe('findOne', () => {
    it('should call sessionService.findOne and return details', async () => {
      (service.findOne as jest.Mock).mockResolvedValueOnce(mockSession);

      const result = await controller.findOne('session-uuid-123');
      expect(result).toEqual(mockSession);
      expect(service.findOne).toHaveBeenCalledWith('session-uuid-123');
    });
  });

  describe('update', () => {
    it('should call sessionService.update and return updated details', async () => {
      const dto: UpdateTicketSaleSessionDto = { name: 'Updated Name' };
      const updatedSession = { ...mockSession, name: 'Updated Name' };
      (service.update as jest.Mock).mockResolvedValueOnce(updatedSession);

      const result = await controller.update('session-uuid-123', dto);
      expect(result).toEqual(updatedSession);
      expect(service.update).toHaveBeenCalledWith('session-uuid-123', dto);
    });
  });

  describe('remove', () => {
    it('should call sessionService.remove and return success message', async () => {
      const deleteResult = {
        message: 'Xóa phiên bán vé thành công',
        id: 'session-uuid-123',
      };
      (service.remove as jest.Mock).mockResolvedValueOnce(deleteResult);

      const result = await controller.remove('session-uuid-123');
      expect(result).toEqual(deleteResult);
      expect(service.remove).toHaveBeenCalledWith('session-uuid-123');
    });
  });
});
