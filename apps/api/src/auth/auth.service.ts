import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import { parseOrBadRequest } from '../common/zod';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: unknown) {
    const data = parseOrBadRequest(RegisterSchema, input);

    const existing = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('Email is already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        fullName: data.fullName,
      },
      select: { id: true, email: true, fullName: true, createdAt: true },
    });

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { user, token };
  }

  async login(input: unknown) {
    const data = parseOrBadRequest(LoginSchema, input);

    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, fullName: user.fullName, createdAt: user.createdAt },
      token,
    };
  }
}

