import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // Fail startup for missing or trivially short secrets; never use a fallback key.
    const secret = configService.getOrThrow<string>('JWT_SECRET');
    if (secret.trim().length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 non-whitespace characters');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload?.sub || !payload?.role) {
      return null;
    }
    return { id: payload.sub, email: payload.email, role: payload.role, propertyId: payload.propertyId };
  }
}
