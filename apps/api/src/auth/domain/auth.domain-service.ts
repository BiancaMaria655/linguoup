import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  tenant_id: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tenant_id: string;
  jti: string;
}

@Injectable()
export class AuthDomainService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  async generateAccessToken(payload: Omit<TokenPayload, 'jti'>): Promise<{ token: string; expiresIn: number }> {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiresInString = this.configService.get<string>('JWT_EXPIRES_IN', '15m');

    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresInString as any,
    });

    const expiresIn = this.parseExpiresInToSeconds(expiresInString);

    return { token, expiresIn };
  }

  async generateRefreshToken(userId: string, tenantId: string): Promise<{ token: string; jti: string }> {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    const expiresInString = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN', '30d');
    const jti = crypto.randomUUID();

    const payload: RefreshTokenPayload = {
      sub: userId,
      tenant_id: tenantId,
      jti,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresInString as any,
    });

    return { token, jti };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const secret = this.configService.get<string>('JWT_SECRET');
    return this.jwtService.verifyAsync<TokenPayload>(token, { secret });
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    return this.jwtService.verifyAsync<RefreshTokenPayload>(token, { secret });
  }

  private parseExpiresInToSeconds(expiresIn: string): number {
    const value = parseInt(expiresIn, 10);
    if (isNaN(value)) {
      return 900;
    }
    const unit = expiresIn.slice(-1);

    switch (unit.toLowerCase()) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return value; // If no unit but is a number, treat as seconds
    }
  }
}
