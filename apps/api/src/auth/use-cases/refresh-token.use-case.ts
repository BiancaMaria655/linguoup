import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../interfaces/user-repository.interface';
import { AuthDomainService } from '../domain/auth.domain-service';
import { RedisService } from '../../database/redis.service';

export interface RefreshTokenCommand {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authDomainService: AuthDomainService,
    private readonly redisService: RedisService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    const { refreshToken } = command;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload;
    try {
      payload = await this.authDomainService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { sub: userId, jti } = payload;

    // 1. Check if user is flagged as compromised
    const isUserCompromised = await this.redisService.exists(`compromised:user:${userId}`);
    if (isUserCompromised) {
      throw new UnauthorizedException('Session has been invalidated due to security reasons');
    }

    // 2. Check if this token is blacklisted
    const blacklistValue = await this.redisService.get(`blacklist:${jti}`);
    if (blacklistValue) {
      if (blacklistValue === 'rotated') {
        // Token reuse detected! Invalidate the user
        await this.redisService.set(`compromised:user:${userId}`, 'true', 30 * 24 * 60 * 60); // 30 days
      }
      throw new UnauthorizedException('Session has expired or token has been reused');
    }

    // 3. Find the user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 4. Blacklist the used token as 'rotated' (TTL 30 days)
    await this.redisService.set(`blacklist:${jti}`, 'rotated', 30 * 24 * 60 * 60);

    // 5. Generate new pair
    const { token: accessToken, expiresIn } = await this.authDomainService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    });

    const { token: newRefreshToken } = await this.authDomainService.generateRefreshToken(user.id, user.tenant_id);

    return {
      accessToken,
      expiresIn,
      refreshToken: newRefreshToken,
    };
  }
}
