import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../interfaces/user-repository.interface';
import { AuthDomainService } from '../domain/auth.domain-service';

export interface LoginUserCommand {
  email: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authDomainService: AuthDomainService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginResponse> {
    const { email, password } = command;

    if (!email || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.authDomainService.comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { token: accessToken, expiresIn } = await this.authDomainService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    });

    const { token: refreshToken } = await this.authDomainService.generateRefreshToken(user.id, user.tenant_id);

    return {
      accessToken,
      expiresIn,
      refreshToken,
    };
  }
}
