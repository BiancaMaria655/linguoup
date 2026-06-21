import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDomainService } from '../domain/auth.domain-service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authDomainService: AuthDomainService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const payload = await this.authDomainService.verifyAccessToken(token);

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        tenant_id: payload.tenant_id,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
