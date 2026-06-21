import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../interfaces/user-repository.interface';
import { AuthDomainService } from '../domain/auth.domain-service';
import { User, Role } from '@linguoup/database';

export interface RegisterUserCommand {
  email: string;
  name: string;
  password?: string;
  tenant_id: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authDomainService: AuthDomainService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const { email, name, password, tenant_id } = command;

    if (!email || !name || !password || !tenant_id) {
      throw new BadRequestException('All fields are required');
    }

    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await this.authDomainService.hashPassword(password);

    return this.userRepository.create({
      email,
      name,
      passwordHash,
      tenant_id,
      role: Role.USER,
    });
  }
}
