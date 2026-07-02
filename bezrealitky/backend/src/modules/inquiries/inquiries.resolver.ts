import { Resolver, Mutation, Query, Args, ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ObjectType()
class InquiryListingRef {
  @Field(() => ID) id: string;
  @Field() title: string;
  @Field() slug: string;
}

@ObjectType()
export class InquiryType {
  @Field(() => ID) id: string;
  @Field() listingId: string;
  @Field() ownerId: string;
  @Field() senderName: string;
  @Field() senderEmail: string;
  @Field(() => String, { nullable: true }) senderPhone: string | null;
  @Field() message: string;
  @Field() read: boolean;
  @Field() createdAt: Date;
  @Field(() => InquiryListingRef, { nullable: true }) listing: InquiryListingRef | null;
}

@InputType()
class CreateInquiryInput {
  @Field() listingId: string;
  @Field() senderName: string;
  @Field() senderEmail: string;
  @Field(() => String, { nullable: true }) senderPhone?: string;
  @Field() message: string;
}

@Resolver()
export class InquiriesResolver {
  constructor(private inquiriesService: InquiriesService) {}

  @Public()
  @Mutation(() => InquiryType)
  async createInquiry(@Args('input') input: CreateInquiryInput) {
    return this.inquiriesService.create(input);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [InquiryType])
  async myInquiries(@CurrentUser() user: any) {
    return this.inquiriesService.myInquiries(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async markInquiryRead(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.inquiriesService.markRead(id, user.id);
    return true;
  }
}
