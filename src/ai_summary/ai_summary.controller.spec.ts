import { Test, TestingModule } from '@nestjs/testing';
import { AiSummaryController } from './ai_summary.controller';

describe('AiSummaryController', () => {
  let controller: AiSummaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiSummaryController],
    }).compile();

    controller = module.get<AiSummaryController>(AiSummaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
