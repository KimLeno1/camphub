import { Controller } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
}
