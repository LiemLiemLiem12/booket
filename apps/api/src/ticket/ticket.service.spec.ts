import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('TicketService', () => {
  let service: TicketService;
  let prisma: PrismaService;

  const mockSession = {
    id: 'session-uuid-123',
    name: 'Early Bird',
  };

  const mockSeat = {
    id: 'seat-uuid-123',
    areaName: 'VIP',
    rowName: 'A',
    colName: '1',
  };

  const mockOrder = {
    id: 'order-uuid-123',
    totalPrice: 100,
  };

  const mockTicket = {
    id: 'ticket-uuid-123',
    sessionId: 'session-uuid-123',
    seatId: 'seat-uuid-123',
    price: 150.00,
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    session: mockSession,
    seat: mockSeat,
    orders: [],
  };

  const mockPrismaService = {
    ticketSaleSession: {
      findUnique: jest.fn(),
    },
    seat: {
      findUnique: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
    },
    ticket: {
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
        TicketService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When creating a ticket', () => {
    it('should create successfully without orders', async () => {
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.ticket.create as jest.Mock).mockResolvedValueOnce(mockTicket);

      const dto: CreateTicketDto = {
        sessionId: 'session-uuid-123',
        seatId: 'seat-uuid-123',
        price: 150.00,
        status: 'AVAILABLE',
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockTicket);
      expect(prisma.ticketSaleSession.findUnique).toHaveBeenCalledWith({
        where: { id: dto.sessionId },
      });
      expect(prisma.seat.findUnique).toHaveBeenCalledWith({
        where: { id: dto.seatId },
      });
      expect(prisma.ticket.create).toHaveBeenCalled();
    });

    it('should create successfully with orders', async () => {
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(mockOrder);
      
      const ticketWithOrders = { ...mockTicket, orders: [mockOrder] };
      (prisma.ticket.create as jest.Mock).mockResolvedValueOnce(ticketWithOrders);

      const dto: CreateTicketDto = {
        sessionId: 'session-uuid-123',
        seatId: 'seat-uuid-123',
        price: 150.00,
        status: 'AVAILABLE',
        orderIds: ['order-uuid-123'],
      };

      const result = await service.create(dto);
      expect(result).toEqual(ticketWithOrders);
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-uuid-123' },
      });
    });

    it('should throw NotFoundException if session not found', async () => {
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: CreateTicketDto = {
        sessionId: 'invalid-session-uuid',
        seatId: 'seat-uuid-123',
        price: 150.00,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if ticket already exists', async () => {
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.seat.findUnique as jest.Mock).mockResolvedValueOnce(mockSeat);
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(mockTicket);

      const dto: CreateTicketDto = {
        sessionId: 'session-uuid-123',
        seatId: 'seat-uuid-123',
        price: 150.00,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('When finding all tickets', () => {
    it('should return paginated list', async () => {
      (prisma.ticket.count as jest.Mock).mockResolvedValueOnce(1);
      (prisma.ticket.findMany as jest.Mock).mockResolvedValueOnce([mockTicket]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        status: 'AVAILABLE',
        orderId: 'order-uuid-123',
      });

      expect(result).toEqual({
        data: [mockTicket],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      expect(prisma.ticket.count).toHaveBeenCalledWith({
        where: {
          status: 'AVAILABLE',
          orders: { some: { id: 'order-uuid-123' } },
        },
      });
    });
  });

  describe('When finding one ticket', () => {
    it('should return details if exists', async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(mockTicket);

      const result = await service.findOne('ticket-uuid-123');
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('When updating a ticket', () => {
    it('should update successfully', async () => {
      const updatedTicket = { ...mockTicket, price: 200.00 };
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(mockTicket);
      (prisma.ticket.update as jest.Mock).mockResolvedValueOnce(updatedTicket);

      const dto: UpdateTicketDto = { price: 200.00 };
      const result = await service.update('ticket-uuid-123', dto);

      expect(result).toEqual(updatedTicket);
    });

    it('should throw NotFoundException if updated session does not exist', async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(mockTicket);
      (prisma.ticketSaleSession.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const dto: UpdateTicketDto = { sessionId: 'invalid-session' };
      await expect(service.update('ticket-uuid-123', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('When removing a ticket', () => {
    it('should delete if exists', async () => {
      (prisma.ticket.findUnique as jest.Mock).mockResolvedValueOnce(mockTicket);
      (prisma.ticket.delete as jest.Mock).mockResolvedValueOnce(mockTicket);

      const result = await service.remove('ticket-uuid-123');
      expect(result).toEqual({
        message: 'Xóa vé thành công',
        id: 'ticket-uuid-123',
      });
    });
  });
});
