import { Resolver, Query, Mutation, Args, ObjectType, Field, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ObjectType()
class AdminStats {
  @Field(() => Int) users: number;
  @Field(() => Int) listings: number;
  @Field(() => Int) activeListings: number;
  @Field(() => Int) paidSubscriptions: number;
}

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminResolver {
  constructor(private adminService: AdminService) {}

  @Query(() => AdminStats)
  async adminStats() {
    return this.adminService.stats();
  }

  @Mutation(() => Boolean)
  async adminBanUser(@Args('userId') userId: string) {
    return this.adminService.banUser(userId);
  }
}
