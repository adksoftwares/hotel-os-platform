import { Controller, Get, Param, Patch, Body, Post } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import { RoomHousekeepingStatus, RoomOperationalStatus } from '@prisma/client';

@Controller('properties/:propertyId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  getRooms(@Param('propertyId') propertyId: string) {
    return this.roomsService.getRooms(propertyId);
  }

  @Patch(':roomId/housekeeping')
  updateHousekeepingStatus(
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Body('status') status: RoomHousekeepingStatus,
  ) {
    return this.roomsService.updateHousekeepingStatus(propertyId, roomId, status);
  }

  @Patch(':roomId/operational')
  updateOperationalStatus(
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Body('status') status: RoomOperationalStatus,
  ) {
    return this.roomsService.updateOperationalStatus(propertyId, roomId, status);
  }

  @Get(':roomId/timeline')
  getRoomTimeline(
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
  ) {
    return this.roomsService.getRoomTimeline(propertyId, roomId);
  }

  @Post(':roomId/maintenance')
  createMaintenanceIssue(
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Body() data: any,
  ) {
    return this.roomsService.createMaintenanceIssue(propertyId, roomId, data);
  }

  @Patch(':roomId/maintenance/:issueId/status')
  updateMaintenanceStatus(
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Param('issueId') issueId: string,
    @Body('status') status: string,
  ) {
    return this.roomsService.updateMaintenanceStatus(propertyId, roomId, issueId, status);
  }
}
