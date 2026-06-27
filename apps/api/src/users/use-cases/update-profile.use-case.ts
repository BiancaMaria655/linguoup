import { Injectable, NotFoundException } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/user-preferences-repository.interface';

export interface UpdateProfileCommand {
  userId: string;
  tenantId: string;
  name?: string;
}

export interface UpdateProfileResult {
  id: string;
  name: string;
  email: string;
  updatedAt: Date;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async execute(command: UpdateProfileCommand): Promise<UpdateProfileResult> {
    const { userId, name } = command;

    const existing = await this.userProfileRepository.findById(userId);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userProfileRepository.updateProfile(userId, {
      name,
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      updatedAt: updated.updatedAt,
    };
  }
}
