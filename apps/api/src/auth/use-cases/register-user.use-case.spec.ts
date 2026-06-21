import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase, RegisterUserCommand } from './register-user.use-case';
import { UserRepository } from '../interfaces/user-repository.interface';
import { AuthDomainService } from '../domain/auth.domain-service';
import { BadRequestException } from '@nestjs/common';
import { Role } from '@linguoup/database';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: UserRepository;
  let authDomainService: AuthDomainService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockAuthDomainService = {
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: AuthDomainService, useValue: mockAuthDomainService },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    authDomainService = module.get<AuthDomainService>(AuthDomainService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should register a new user successfully', async () => {
    const command: RegisterUserCommand = {
      email: 'test@example.com',
      name: 'John Doe',
      password: 'password123',
      tenant_id: 'tenant-1',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockAuthDomainService.hashPassword.mockResolvedValue('hashed-password');
    const createdUser = {
      id: 'user-id',
      email: command.email,
      name: command.name,
      passwordHash: 'hashed-password',
      tenant_id: command.tenant_id,
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUserRepository.create.mockResolvedValue(createdUser);

    const result = await useCase.execute(command);
    expect(result).toBe(createdUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(authDomainService.hashPassword).toHaveBeenCalledWith(command.password);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: command.email,
      name: command.name,
      passwordHash: 'hashed-password',
      tenant_id: command.tenant_id,
      role: Role.USER,
    });
  });

  it('should throw BadRequestException if any field is missing', async () => {
    const commands: Partial<RegisterUserCommand>[] = [
      { email: 'test@example.com', name: 'John Doe', password: 'password123' }, // missing tenant_id
      { email: 'test@example.com', name: 'John Doe', tenant_id: 'tenant-1' }, // missing password
      { email: 'test@example.com', password: 'password123', tenant_id: 'tenant-1' }, // missing name
      { name: 'John Doe', password: 'password123', tenant_id: 'tenant-1' }, // missing email
    ];

    for (const cmd of commands) {
      await expect(useCase.execute(cmd as RegisterUserCommand)).rejects.toThrow(
        new BadRequestException('All fields are required'),
      );
    }
  });

  it('should throw BadRequestException if password is too short', async () => {
    const command: RegisterUserCommand = {
      email: 'test@example.com',
      name: 'John Doe',
      password: 'short',
      tenant_id: 'tenant-1',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      new BadRequestException('Password must be at least 8 characters long'),
    );
  });

  it('should throw BadRequestException if email is already registered', async () => {
    const command: RegisterUserCommand = {
      email: 'existing@example.com',
      name: 'John Doe',
      password: 'password123',
      tenant_id: 'tenant-1',
    };

    mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });

    await expect(useCase.execute(command)).rejects.toThrow(
      new BadRequestException('Email is already registered'),
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
