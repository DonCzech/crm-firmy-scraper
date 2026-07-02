import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('E-mail je již registrován');

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: { email, passwordHash, emailVerifyToken },
    });

    await this.prisma.profile.create({ data: { userId: user.id } });
    await this.prisma.subscription.create({ data: { userId: user.id } });

    await this.mail.sendVerificationEmail(email, emailVerifyToken);

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Nesprávný e-mail nebo heslo');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Nesprávný e-mail nebo heslo');

    return this.generateTokens(user);
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Neplatný refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    await this.prisma.refreshToken.delete({ where: { token } });
    return this.generateTokens(user);
  }

  async logout(token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
    return true;
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) throw new BadRequestException('Neplatný token');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null },
    });
    return true;
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return true; // security: don't reveal
    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token, resetPasswordExpiry: expiry },
    });
    await this.mail.sendPasswordReset(email, token);
    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpiry: { gt: new Date() } },
    });
    if (!user) throw new BadRequestException('Neplatný nebo expirovaný token');
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetPasswordToken: null, resetPasswordExpiry: null },
    });
    return true;
  }

  private async generateTokens(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload);

    const refreshToken = randomBytes(64).toString('hex');
    const expiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    await this.prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    return { accessToken, refreshToken, user };
  }
}
