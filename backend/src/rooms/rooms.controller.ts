import { Controller, Get, Param, Patch, Body, Post, Req, ForbiddenException } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import { RoomHousekeepingStatus, RoomOperationalStatus } from '@prisma/client';

function assertPropertyAccess(req: any, propertyId: string) {
  if (req.user?.role !== 'SUPER_ADMIN' && req.user?.propertyId !== propertyId) {
    throw new ForbiddenException('You do not have access to this property');
  }
}

@Controller('properties/:propertyId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  getRooms(@Req() req: any, @Param('propertyId') propertyId: string) {
    assertPropertyAccess(req, propertyId);
    return this.roomsService.getRooms(propertyId);
  }

  @Patch(':roomId/housekeeping')
  updateHousekeepingStatus(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Body('status') status: RoomHousekeepingStatus,
  ) {
    assertPropertyAccess(req, propertyId);
    return this.roomsService.updateHousekeepingStatus(propertyId, roomId, status);
  }

  @Patch(':roomId/operational')
  updateOperationalStatus(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Body('status') status: RoomOperationalStatus,
  ) {
    assertPropertyAccess(req, propertyId);
    return this.roomsService.updateOperationalStatus(propertyId, roomId, status);
  }

  @Get(':roomId/timeline')
  getRoomTimeline(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
  ) {
    assertPropertyAccess(req, propertyId);
    return this.roomsService.getRoomTimeline(propertyId, roomId);
  }

  @Post(':roomId/maintenance')
  createMaintenanceIssue(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Body() data: any,
  ) {
    assertPropertyAccess(req, propertyId);
    return this.roomsService.createMaintenanceIssue(propertyId, roomId, data);
  }

  @Patch(':roomId/maintenance/:issueId/status')
  updateMaintenanceStatus(
    @Req() req: any,
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Param('issueId') issueId: string,
    @Body('status') status: string,
  ) {
    assertPropertyAccess(req, propertyId);
    return this.roomsService.updateMaintenanceStatus(propertyId, roomId, issueId, status);
  }
}
