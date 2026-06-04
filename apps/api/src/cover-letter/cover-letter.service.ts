import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { parseOrBadRequest } from '../common/zod';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';

const GenerateSchema = z.object({
  resumeVersionId: z.string().min(1),
  jobTargetId: z.string().min(1),
  tone: z.enum(['professional', 'warm', 'confident']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

@Injectable()
export class CoverLetterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async generate(userId: string, input: unknown) {
    const data = parseOrBadRequest(GenerateSchema, input);

    const version = await this.prisma.resumeVersion.findFirst({
      where: { id: data.resumeVersionId, resume: { userId } },
      include: { resume: { select: { id: true, title: true } } },
    });
    if (!version) throw new NotFoundException('Resume version not found');

    const job = await this.prisma.jobTarget.findFirst({
      where: { id: data.jobTargetId, userId },
    });
    if (!job) throw new NotFoundException('Job target not found');

    const system = [
      'You write a tailored cover letter.',
      'Be specific but do not invent facts not present in the resume JSON.',
      'Use strong but natural language; avoid clichés.',
      'Output plain text only.',
    ].join('\n');

    const tone = data.tone ?? 'professional';
    const length = data.length ?? 'medium';

    const prompt = [
      `Tone: ${tone}`,
      `Length: ${length}`,
      '',
      `Target role: ${job.title}`,
      job.company ? `Company: ${job.company}` : '',
      job.industry ? `Industry: ${job.industry}` : '',
      '',
      'Job description:',
      job.jobDescriptionText ?? '(not provided)',
      '',
      'Resume JSON:',
      JSON.stringify(version.structuredJson),
    ]
      .filter(Boolean)
      .join('\n');

    const content = await this.ai.respond({
      system,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = content.trim();
    if (!text) throw new BadRequestException('Cover letter generation failed');

    return this.prisma.coverLetter.create({
      data: {
        userId,
        resumeVersionId: version.id,
        jobTargetId: job.id,
        content: text,
      },
    });
  }
}

