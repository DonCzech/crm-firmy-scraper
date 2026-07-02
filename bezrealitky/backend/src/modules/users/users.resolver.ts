import { Resolver, Query, Mutation, Args, ObjectType, Field, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ObjectType()
export class UserType {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field() emailVerified: boolean;
  @Field() role: string;
  @Field() createdAt: Date;
}

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => UserType)
  async me(@CurrentUser() user: any): Promise<UserType> {
    return this.usersService.findById(user.id);
  }

  @Mutation(() => Boolean)
  async updatePassword(
    @CurrentUser() user: any,
    @Args('oldPassword') oldPassword: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.usersService.updatePassword(user.id, oldPassword, newPassword);
  }

  @Mutation(() => Boolean)
  async deleteAccount(@CurrentUser() user: any): Promise<boolean> {
    return this.usersService.deleteAccount(user.id);
  }
}
