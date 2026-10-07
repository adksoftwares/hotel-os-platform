import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  getMetrics(@Query('propertyId') propertyId: string) {
    if (!propertyId) {
      // Default to the first property if not provided (for development convenience)
      propertyId = 'default-property-id'; 
    }
    return this.dashboardService.getMetrics(propertyId);
  }
}
