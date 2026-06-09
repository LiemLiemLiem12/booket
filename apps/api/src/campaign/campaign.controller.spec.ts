import { Test, TestingModule } from '@nestjs/testing';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

describe('CampaignController', () => {
  let controller: CampaignController;
  let service: CampaignService;

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
    startTime: '2026-06-10T19:00:00Z',
    endTime: '2026-06-10T22:00:00Z',
    status: 'DRAFT',
    maxSeatsPerOrder: 4,
  };

  const mockCampaignService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignController],
      providers: [
        {
          provide: CampaignService,
          useValue: mockCampaignService,
        },
      ],
    }).compile();

    controller = module.get<CampaignController>(CampaignController);
    service = module.get<CampaignService>(CampaignService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call campaignService.create and return the created campaign', async () => {
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
      (service.create as jest.Mock).mockResolvedValueOnce(mockCampaign);

      const result = await controller.create(dto);
      expect(result).toEqual(mockCampaign);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call campaignService.findAll with queries and return result', async () => {
      const queryResult = {
        data: [mockCampaign],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (service.findAll as jest.Mock).mockResolvedValueOnce(queryResult);

      const result = await controller.findAll(1, 10, 'user-uuid-123', 'DRAFT', 'Hanoi', 'CONCERT', 'Rock');
      expect(result).toEqual(queryResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        creatorId: 'user-uuid-123',
        status: 'DRAFT',
        city: 'Hanoi',
        eventType: 'CONCERT',
        search: 'Rock',
      });
    });
  });

  describe('findOne', () => {
    it('should call campaignService.findOne and return the campaign details', async () => {
      (service.findOne as jest.Mock).mockResolvedValueOnce(mockCampaign);

      const result = await controller.findOne('campaign-uuid-123');
      expect(result).toEqual(mockCampaign);
      expect(service.findOne).toHaveBeenCalledWith('campaign-uuid-123');
    });
  });

  describe('update', () => {
    it('should call campaignService.update and return updated campaign details', async () => {
      const dto: UpdateCampaignDto = { title: 'Updated Title' };
      const updatedCampaign = { ...mockCampaign, title: 'Updated Title' };
      (service.update as jest.Mock).mockResolvedValueOnce(updatedCampaign);

      const result = await controller.update('campaign-uuid-123', dto);
      expect(result).toEqual(updatedCampaign);
      expect(service.update).toHaveBeenCalledWith('campaign-uuid-123', dto);
    });
  });

  describe('remove', () => {
    it('should call campaignService.remove and return success message', async () => {
      const deleteResult = {
        message: 'Xóa chiến dịch thành công',
        id: 'campaign-uuid-123',
      };
      (service.remove as jest.Mock).mockResolvedValueOnce(deleteResult);

      const result = await controller.remove('campaign-uuid-123');
      expect(result).toEqual(deleteResult);
      expect(service.remove).toHaveBeenCalledWith('campaign-uuid-123');
    });
  });
});
