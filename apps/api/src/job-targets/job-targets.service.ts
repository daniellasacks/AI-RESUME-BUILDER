import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';
import { parseOrBadRequest } from '../common/zod';

const CreateSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  jobDescriptionText: z.string().min(1).optional(),
});

const UpdateSchema = CreateSchema.partial().extend({
  title: z.string().min(1).optional(),
});

@Injectable()
export class JobTargetsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.jobTarget.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        company: true,
        industry: true,
        location: true,
        jobDescriptionText: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  create(userId: string, input: unknown) {
    const data = parseOrBadRequest(CreateSchema, input);
    return this.prisma.jobTarget.create({
      data: {
        userId,
        title: data.title,
        company: data.company,
        industry: data.industry,
        location: data.location,
        jobDescriptionText: data.jobDescriptionText,
      },
    });
  }

  async get(userId: string, id: string) {
    const jt = await this.prisma.jobTarget.findFirst({
      where: { id, userId },
    });
    if (!jt) throw new NotFoundException('Job target not found');
    return jt;
  }

  async update(userId: string, id: string, input: unknown) {
    await this.get(userId, id);
    const data = parseOrBadRequest(UpdateSchema, input);
    return this.prisma.jobTarget.update({
      where: { id },
      data: {
        title: data.title,
        company: data.company,
        industry: data.industry,
        location: data.location,
        jobDescriptionText: data.jobDescriptionText,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.jobTarget.delete({ where: { id } });
    return { ok: true };
  }
}

