import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

function tokenize(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3),
    ),
  );
}

@Injectable()
export class AtsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async evaluate(params: { userId: string; resumeVersionId: string; jobTargetId: string }) {
    const version = await this.prisma.resumeVersion.findFirst({
      where: { id: params.resumeVersionId, resume: { userId: params.userId } },
    });
    if (!version) throw new NotFoundException('Resume version not found');

    const job = await this.prisma.jobTarget.findFirst({
      where: { id: params.jobTargetId, userId: params.userId },
    });
    if (!job) throw new NotFoundException('Job target not found');

    const resumeText =
      version.plainText ??
      JSON.stringify(version.structuredJson)
        .replace(/["{}\[\]]/g, ' ')
        .replace(/\s+/g, ' ');
    const jdText = job.jobDescriptionText ?? '';

    const resumeTokens = tokenize(resumeText);
    const jdTokens = tokenize(jdText);
    const overlap = jdTokens.filter((t) => resumeTokens.includes(t));
    const coverage = jdTokens.length ? overlap.length / jdTokens.length : 0.2;

    // Basic heuristic score (0-100)
    const baseScore = Math.max(10, Math.min(95, Math.round(30 + coverage * 70)));

    const system = [
      'You are an ATS optimization assistant.',
      'Given a resume JSON and a job description, produce practical optimization suggestions.',
      'Output ONLY JSON: { summary: string, missingKeywords: string[], suggestions: string[] }',
      'Do not invent experience; suggest wording/formatting improvements and missing keywords only if relevant.',
    ].join('\n');

    const ai = await this.ai.respond({
      system,
      messages: [
        {
          role: 'user',
          content: [
            `Heuristic token overlap score: ${baseScore}/100`,
            '',
            'Job description:',
            jdText || '(not provided)',
            '',
            'Resume JSON:',
            JSON.stringify(version.structuredJson),
          ].join('\n'),
        },
      ],
    });

    let suggestionsJson: any = { summary: 'No suggestions available', missingKeywords: [], suggestions: [] };
    try {
      suggestionsJson = JSON.parse(ai);
    } catch {
      // keep fallback
    }

    const verdict = baseScore >= 80 ? 'strong' : baseScore >= 55 ? 'ok' : 'weak';

    return this.prisma.atsEvaluation.create({
      data: {
        userId: params.userId,
        resumeVersionId: version.id,
        jobTargetId: job.id,
        score: baseScore,
        verdict: verdict as any,
        suggestionsJson,
      },
    });
  }
}

