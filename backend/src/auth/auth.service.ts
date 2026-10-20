import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    const normalizedInput = email.trim().toLowerCase();
    const candidateEmails = [normalizedInput];
    if (!normalizedInput.includes('@')) {
      candidateEmails.push(`${normalizedInput}@hotel.com`);
      if (normalizedInput === 'superadmin' || normalizedInput === 'super_admin') {
        candidateEmails.push('super_admin@gmail.com');
      }
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: { in: candidateEmails }
      }
    });

    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash).catch(() => false);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, propertyId: user.propertyId };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        propertyId: user.propertyId
      }
    };
  }

  async impersonate(targetUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, propertyId: user.propertyId };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        propertyId: user.propertyId
      }
    };
  }
}
