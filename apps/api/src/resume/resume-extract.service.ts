import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ResumeSchema } from './resume.schemas';

@Injectable()
export class ResumeExtractService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async extractFromUploadedDocument(params: { userId: string; documentId: string }) {
    const doc = await this.prisma.uploadedDocument.findFirst({
      where: { id: params.documentId, userId: params.userId },
      select: { id: true, extractedText: true, filename: true },
    });
    if (!doc) throw new NotFoundException('Document not found');
    if (!doc.extractedText) throw new NotFoundException('Document has no extracted text');

    // If no OpenAI key, return a very basic “best effort” extraction.
    const system = [
      'You extract resume information into a structured JSON object.',
      'Only output valid JSON that matches the schema shape described below.',
      'If something is unknown, omit it or set to an empty array; do not hallucinate specifics.',
      '',
      'Schema (high level):',
      '- basics: { fullName, headline?, email?, phone?, location?, links?, summary? }',
      '- skills?: [{ category, items[] }]',
      '- experience?: [{ company, title, location?, startDate?, endDate?, highlights?, technologies? }]',
      '- projects?: [{ name, description?, highlights?, technologies?, link? }]',
      '- education?: [{ school, degree?, field?, startDate?, endDate?, notes? }]',
      '- certifications?: [{ name, issuer?, date? }]',
    ].join('\n');

    const content = await this.ai.respond({
      system,
      messages: [
        {
          role: 'user',
          content: `Extract resume JSON from this text (filename: ${doc.filename}):\n\n${doc.extractedText}`,
        },
      ],
    });

    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      // If the model returns non-JSON (or demo mode), fallback to minimal
      json = {
        basics: { fullName: 'Unknown' },
      };
    }

    const parsed = ResumeSchema.safeParse(json);
    const resumeJson = parsed.success ? parsed.data : { basics: { fullName: 'Unknown' } };

    await this.prisma.uploadedDocument.update({
      where: { id: doc.id },
      data: { extractedJson: resumeJson as any },
    });

    return { documentId: doc.id, resumeJson };
  }
}

