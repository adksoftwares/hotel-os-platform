import { Controller, Post, Get, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { AuthUser } from './decorators/auth-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @Post('impersonate')
  impersonate(@Body('targetUserId') targetUserId: string) {
    return this.authService.impersonate(targetUserId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('staff')
  getStaff(@AuthUser() user: any) {
    return this.authService.getStaff(user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('staff')
  createStaff(@AuthUser() user: any, @Body() dto: any) {
    return this.authService.createStaff(user, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('staff/:id')
  updateStaff(@AuthUser() user: any, @Param('id') id: string, @Body() dto: any) {
    return this.authService.updateStaff(user, id, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('staff/:id')
  deleteStaff(@AuthUser() user: any, @Param('id') id: string) {
    return this.authService.deleteStaff(user, id);
  }
}
