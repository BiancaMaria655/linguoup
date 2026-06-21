import { Injectable } from '@nestjs/common';
import { AuthDomainService } from '../domain/auth.domain-service';
import { RedisService } from '../../database/redis.service';

export interface LogoutCommand {
  refreshToken: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly authDomainService: AuthDomainService,
    private readonly redisService: RedisService,
  ) {}

  async execute(command: LogoutCommand): Promise<{ message: string }> {
    const { refreshToken } = command;

    if (!refreshToken) {
      return { message: 'Logged out successfully' };
    }

    try {
      const payload = await this.authDomainService.verifyRefreshToken(refreshToken);
      const { jti } = payload;

      // Blacklist the token as 'logout' (TTL 30 days)
      await this.redisService.set(`blacklist:${jti}`, 'logout', 30 * 24 * 60 * 60);
    } catch {
      // If token is invalid, it cannot be used anyway, so proceed with success
    }

    return { message: 'Logged out successfully' };
  }
}
