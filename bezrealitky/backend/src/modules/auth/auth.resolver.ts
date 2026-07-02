import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';

@ObjectType()
class AuthPayload {
  @Field() accessToken: string;
  @Field() refreshToken: string;
}

@InputType()
class RegisterInput {
  @Field() @IsEmail() email: string;
  @Field() @MinLength(8) password: string;
}

@InputType()
class LoginInput {
  @Field() @IsEmail() email: string;
  @Field() password: string;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input.email, input.password);
  }

  @Public()
  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input.email, input.password);
  }

  @Public()
  @Mutation(() => AuthPayload)
  async refresh(@Args('token') token: string): Promise<AuthPayload> {
    return this.authService.refresh(token);
  }

  @Mutation(() => Boolean)
  async logout(@Args('token') token: string): Promise<boolean> {
    return this.authService.logout(token);
  }

  @Public()
  @Mutation(() => Boolean)
  async verifyEmail(@Args('token') token: string): Promise<boolean> {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Mutation(() => Boolean)
  async forgotPassword(@Args('email') email: string): Promise<boolean> {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Mutation(() => Boolean)
  async resetPassword(
    @Args('token') token: string,
    @Args('password') password: string,
  ): Promise<boolean> {
    return this.authService.resetPassword(token, password);
  }
}
