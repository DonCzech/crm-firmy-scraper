import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.profile.findUnique({ where: { userId } });
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
