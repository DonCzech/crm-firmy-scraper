import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ObjectType()
export class ProfileType {
  @Field(() => ID) id: string;
  @Field(() => String, { nullable: true }) firstName: string | null;
  @Field(() => String, { nullable: true }) lastName: string | null;
  @Field(() => String, { nullable: true }) phone: string | null;
  @Field(() => String, { nullable: true }) avatarUrl: string | null;
  @Field(() => String, { nullable: true }) bio: string | null;
  @Field() isPremium: boolean;
}

@InputType()
class UpdateProfileInput {
  @Field(() => String, { nullable: true }) firstName?: string;
  @Field(() => String, { nullable: true }) lastName?: string;
  @Field(() => String, { nullable: true }) phone?: string;
  @Field(() => String, { nullable: true }) bio?: string;
  @Field(() => String, { nullable: true }) avatarUrl?: string;
}

@Resolver(() => ProfileType)
@UseGuards(JwtAuthGuard)
export class ProfilesResolver {
  constructor(private profilesService: ProfilesService) {}

  @Query(() => ProfileType, { nullable: true })
  async myProfile(@CurrentUser() user: any) {
    return this.profilesService.getProfile(user.id);
  }

  @Mutation(() => ProfileType)
  async updateProfile(
    @CurrentUser() user: any,
    @Args('input') input: UpdateProfileInput,
  ) {
    return this.profilesService.updateProfile(user.id, input);
  }
}
