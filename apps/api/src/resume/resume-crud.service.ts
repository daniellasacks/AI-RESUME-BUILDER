import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';
import { parseOrBadRequest } from '../common/zod';
import { ResumeSchema } from './resume.schemas';
import { AiService } from '../ai/ai.service';

const CreateResumeSchema = z.object({
  title: z.string().min(1),
});

const CreateVersionSchema = z.object({
  resumeId: z.string().min(1),
  structuredJson: ResumeSchema,
  plainText: z.string().optional(),
  jobTargetId: z.string().optional(),
  templateId: z.string().optional(),
  derivedFromVersionId: z.string().optional(),
});

const TailorSchema = z.object({
  baseVersionId: z.string().min(1),
  jobTargetId: z.string().min(1),
});

const WizardPersonalSchema = z.object({
  fullName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
});

const GenerateWizardSchema = z.object({
  wizard: z.object({
    personal: WizardPersonalSchema,
    experience: z.array(
      z.object({
        company: z.string(),
        title: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        highlights: z.string().optional(),
      }),
    ),
    skills: z.string().optional(),
    education: z.string().optional(),
    target: z.object({
      title: z.string().optional(),
      company: z.string().optional(),
      description: z.string().optional(),
    }),
  }),
});

const ImproveSchema = z.object({
  versionId: z.string().min(1),
  action: z.string().min(1),
});

@Injectable()
export class ResumeCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async listResumes(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { versions: true } },
      },
    });
  }

  async createResume(userId: string, input: unknown) {
    const data = parseOrBadRequest(CreateResumeSchema, input);
    return this.prisma.resume.create({
      data: { userId, title: data.title },
      select: { id: true, title: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async getResume(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: { versions: { orderBy: { version: 'desc' }, take: 25 } },
    });
    if (!resume) throw new NotFoundException('Resume not found');
    return resume;
  }

  async createVersion(userId: string, input: unknown) {
    const data = parseOrBadRequest(CreateVersionSchema, input);

    const resume = await this.prisma.resume.findFirst({
      where: { id: data.resumeId, userId },
      select: { id: true },
    });
    if (!resume) throw new NotFoundException('Resume not found');

    return this.prisma.$transaction(async (tx) => {
      const last = await tx.resumeVersion.findFirst({
        where: { resumeId: data.resumeId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const nextVersion = (last?.version ?? 0) + 1;

      const created = await tx.resumeVersion.create({
        data: {
          resumeId: data.resumeId,
          version: nextVersion,
          structuredJson: data.structuredJson as any,
          plainText: data.plainText,
          jobTargetId: data.jobTargetId,
          templateId: data.templateId,
          derivedFromVersionId: data.derivedFromVersionId,
        },
      });

      await tx.resume.update({ where: { id: data.resumeId }, data: { updatedAt: new Date() } });
      return created;
    });
  }

  async tailorVersion(userId: string, input: unknown) {
    const data = parseOrBadRequest(TailorSchema, input);

    const base = await this.prisma.resumeVersion.findFirst({
      where: { id: data.baseVersionId, resume: { userId } },
      include: { resume: { select: { id: true, title: true } } },
    });
    if (!base) throw new NotFoundException('Base version not found');

    const jobTarget = await this.prisma.jobTarget.findFirst({
      where: { id: data.jobTargetId, userId },
    });
    if (!jobTarget) throw new NotFoundException('Job target not found');

    const system = [
      'You tailor a resume JSON for a job description.',
      'Return ONLY valid JSON with the same schema/shape as the input resume JSON.',
      'Keep facts the same; do not invent companies, degrees, metrics. Improve wording and relevance only.',
      'Prefer strong action verbs, ATS-friendly keywords from the job description.',
    ].join('\n');

    const prompt = [
      `Target role: ${jobTarget.title}`,
      jobTarget.company ? `Company: ${jobTarget.company}` : '',
      jobTarget.industry ? `Industry: ${jobTarget.industry}` : '',
      '',
      'Job description:',
      jobTarget.jobDescriptionText ?? '(not provided)',
      '',
      'Current resume JSON:',
      JSON.stringify(base.structuredJson),
    ]
      .filter(Boolean)
      .join('\n');

    const content = await this.ai.respond({
      system,
      messages: [{ role: 'user', content: prompt }],
    });

    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      throw new BadRequestException('AI did not return valid JSON for tailoring');
    }

    const parsed = ResumeSchema.safeParse(json);
    if (!parsed.success) throw new BadRequestException({ error: 'AI_OUTPUT_INVALID', issues: parsed.error.issues });

    return this.createVersion(userId, {
      resumeId: base.resume.id,
      structuredJson: parsed.data,
      derivedFromVersionId: base.id,
      jobTargetId: jobTarget.id,
      templateId: base.templateId ?? undefined,
    });
  }

  async generateFromWizard(userId: string, input: unknown) {
    const data = parseOrBadRequest(GenerateWizardSchema, input);
    const w = data.wizard;

    const system = [
      'You convert interview form data into a professional ATS-friendly resume JSON.',
      'Return ONLY valid JSON matching this shape: { basics: { fullName, headline?, email?, phone?, location?, summary? }, skills?: [{category, items[]}], experience?: [...], education?: [...], projects?: [], certifications?: [] }',
      'Use strong action verbs and quantify impact where the user provided numbers.',
      'Do not invent employers, degrees, or metrics.',
    ].join('\n');

    const content = await this.ai.respond({
      system,
      messages: [{ role: 'user', content: JSON.stringify(w) }],
    });

    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      throw new BadRequestException('AI did not return valid JSON');
    }

    const parsed = ResumeSchema.safeParse(json);
    if (!parsed.success) throw new BadRequestException({ error: 'AI_OUTPUT_INVALID', issues: parsed.error.issues });

    const title = w.target.title
      ? `${w.personal.fullName} — ${w.target.title}`
      : `${w.personal.fullName} CV`;

    const resume = await this.createResume(userId, { title });

    if (w.target.title || w.target.description) {
      await this.prisma.jobTarget.create({
        data: {
          userId,
          title: w.target.title || 'Target role',
          company: w.target.company,
          jobDescriptionText: w.target.description,
        },
      });
    }

    const version = await this.createVersion(userId, {
      resumeId: resume.id,
      structuredJson: parsed.data,
    });

    return { resumeId: resume.id, versionId: version.id, structuredJson: parsed.data };
  }

  async improveVersion(userId: string, input: unknown) {
    const data = parseOrBadRequest(ImproveSchema, input);

    const base = await this.prisma.resumeVersion.findFirst({
      where: { id: data.versionId, resume: { userId } },
      include: { resume: { select: { id: true, title: true } } },
    });
    if (!base) throw new NotFoundException('Version not found');

    const actionPrompts: Record<string, string> = {
      improve: 'Improve wording: stronger verbs, clearer impact, ATS-friendly language. Keep facts identical.',
      shorter: 'Make the summary and bullets more concise. Remove filler. Keep facts identical.',
      tailor: 'Tailor summary and bullets toward the user job target keywords. Do not invent experience.',
      'regenerate-summary': 'Rewrite only the summary in a professional tone. Keep other sections unchanged.',
    };

    const prompt = actionPrompts[data.action] ?? actionPrompts.improve;

    const system = [
      prompt,
      'Return ONLY valid JSON with the same resume schema/shape as the input.',
      'Do not invent facts.',
    ].join('\n');

    const content = await this.ai.respond({
      system,
      messages: [{ role: 'user', content: JSON.stringify(base.structuredJson) }],
    });

    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      throw new BadRequestException('AI did not return valid JSON');
    }

    const parsed = ResumeSchema.safeParse(json);
    if (!parsed.success) throw new BadRequestException({ error: 'AI_OUTPUT_INVALID', issues: parsed.error.issues });

    return this.createVersion(userId, {
      resumeId: base.resume.id,
      structuredJson: parsed.data,
      derivedFromVersionId: base.id,
      jobTargetId: base.jobTargetId ?? undefined,
      templateId: base.templateId ?? undefined,
    });
  }
}

