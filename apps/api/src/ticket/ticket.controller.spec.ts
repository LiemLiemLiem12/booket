import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

describe('TicketController', () => {
  let controller: TicketController;
  let service: TicketService;

  const mockTicket = {
    id: 'ticket-uuid-123',
    sessionId: 'session-uuid-123',
    seatId: 'seat-uuid-123',
    price: 150.00,
    status: 'AVAILABLE',
  };

  const mockTicketService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: mockTicketService,
        },
      ],
    }).compile();

    controller = module.get<TicketController>(TicketController);
    service = module.get<TicketService>(TicketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call ticketService.create and return the created ticket', async () => {
      const dto: CreateTicketDto = {
        sessionId: 'session-uuid-123',
        seatId: 'seat-uuid-123',
        price: 150.00,
        status: 'AVAILABLE',
      };
      (service.create as jest.Mock).mockResolvedValueOnce(mockTicket);

      const result = await controller.create(dto);
      expect(result).toEqual(mockTicket);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call ticketService.findAll with queries and return result', async () => {
      const queryResult = {
        data: [mockTicket],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (service.findAll as jest.Mock).mockResolvedValueOnce(queryResult);

      const result = await controller.findAll(1, 10, 'session-uuid-123', 'seat-uuid-123', 'AVAILABLE', 'order-uuid-123');
      expect(result).toEqual(queryResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sessionId: 'session-uuid-123',
        seatId: 'seat-uuid-123',
        status: 'AVAILABLE',
        orderId: 'order-uuid-123',
      });
    });
  });

  describe('findOne', () => {
    it('should call ticketService.findOne and return details', async () => {
      (service.findOne as jest.Mock).mockResolvedValueOnce(mockTicket);

      const result = await controller.findOne('ticket-uuid-123');
      expect(result).toEqual(mockTicket);
      expect(service.findOne).toHaveBeenCalledWith('ticket-uuid-123');
    });
  });

  describe('update', () => {
    it('should call ticketService.update and return updated details', async () => {
      const dto: UpdateTicketDto = { price: 200.00 };
      const updatedTicket = { ...mockTicket, price: 200.00 };
      (service.update as jest.Mock).mockResolvedValueOnce(updatedTicket);

      const result = await controller.update('ticket-uuid-123', dto);
      expect(result).toEqual(updatedTicket);
      expect(service.update).toHaveBeenCalledWith('ticket-uuid-123', dto);
    });
  });

  describe('remove', () => {
    it('should call ticketService.remove and return success message', async () => {
      const deleteResult = {
        message: 'Xóa vé thành công',
        id: 'ticket-uuid-123',
      };
      (service.remove as jest.Mock).mockResolvedValueOnce(deleteResult);

      const result = await controller.remove('ticket-uuid-123');
      expect(result).toEqual(deleteResult);
      expect(service.remove).toHaveBeenCalledWith('ticket-uuid-123');
    });
  });
});
