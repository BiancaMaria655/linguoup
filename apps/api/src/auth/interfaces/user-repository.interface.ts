import { User, Prisma } from '@linguoup/database';

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract create(data: Prisma.UserCreateInput): Promise<User>;
}
