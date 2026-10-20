import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(emailOrUsername: string, pass: string) {
    const normalizedInput = emailOrUsername.trim().toLowerCase();
    const candidateEmails = [normalizedInput];
    if (!normalizedInput.includes('@')) {
      candidateEmails.push(`${normalizedInput}@hotel.com`);
      if (normalizedInput === 'superadmin' || normalizedInput === 'super_admin') {
        candidateEmails.push('super_admin@gmail.com');
      }
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { in: candidateEmails } },
          { username: normalizedInput }
        ]
      }
    });

    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash).catch(() => false);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      role: user.role,
      propertyId: user.propertyId
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone || '',
        propertyId: user.propertyId
      }
    };
  }

  async impersonate(targetUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      role: user.role,
      propertyId: user.propertyId
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        propertyId: user.propertyId
      }
    };
  }

  async getStaff(currentUser: any) {
    const whereClause: any = {};
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.propertyId) {
      whereClause.propertyId = currentUser.propertyId;
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      include: { property: true },
      orderBy: { createdAt: 'desc' }
    });

    return users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone || '',
      email: u.email,
      username: u.username || u.email.split('@')[0],
      role: u.role,
      property: u.property?.name || 'Grand ADK Hotel',
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString().split('T')[0]
    }));
  }

  async createStaff(currentUser: any, dto: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    username: string;
    password: string;
    role?: string;
    property?: string;
    propertyId?: string;
  }) {
    if (!dto.firstName || !dto.lastName || !dto.email || !dto.username || !dto.password) {
      throw new BadRequestException('All fields (first name, last name, email, username, password) are required');
    }

    const cleanUsername = dto.username.trim().toLowerCase();
    const cleanEmail = dto.email.trim().toLowerCase();
    const requestedRole = (dto.role || 'ADMIN').toUpperCase();

    // Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN
    if ((requestedRole === 'ADMIN' || requestedRole === 'SUPER_ADMIN') && currentUser?.role && currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Administrator can provision Hotel Administrator accounts');
    }

    // Check duplicate
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername }
        ]
      }
    });

    if (existing) {
      throw new BadRequestException(`An account with username "${cleanUsername}" or email "${cleanEmail}" already exists`);
    }

    // Resolve propertyId
    let propertyId = dto.propertyId || currentUser?.propertyId;
    if (!propertyId) {
      const prop = await this.prisma.property.findFirst();
      propertyId = prop?.id || null;
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const created = await this.prisma.user.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone?.trim() || null,
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        role: requestedRole,
        propertyId,
        isActive: true
      },
      include: { property: true }
    });

    return {
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName,
      phone: created.phone || '',
      email: created.email,
      username: created.username || cleanUsername,
      role: created.role,
      property: created.property?.name || dto.property || 'Grand ADK Hotel',
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString().split('T')[0]
    };
  }

  async updateStaff(currentUser: any, id: string, dto: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    username?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
    property?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Staff account not found');
    }

    if (existing.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Unauthorized to modify Super Admin account');
    }

    const updateData: any = {};
    if (dto.firstName) updateData.firstName = dto.firstName.trim();
    if (dto.lastName) updateData.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) updateData.phone = dto.phone.trim();
    if (dto.email) updateData.email = dto.email.trim().toLowerCase();
    if (dto.username) updateData.username = dto.username.trim().toLowerCase();
    if (dto.role) updateData.role = dto.role.toUpperCase();
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password && dto.password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(dto.password.trim(), 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { property: true }
    });

    return {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone || '',
      email: updated.email,
      username: updated.username || updated.email.split('@')[0],
      role: updated.role,
      property: updated.property?.name || 'Grand ADK Hotel',
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString().split('T')[0]
    };
  }

  async deleteStaff(currentUser: any, id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Staff account not found');
    }

    if (existing.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Super Admin account cannot be deleted');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'Account deleted successfully' };
  }
}
