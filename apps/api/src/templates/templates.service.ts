import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_TEMPLATES = [
  {
    key: 'modern-1',
    name: 'Modern',
    description: 'Clean, single-column, ATS-friendly layout.',
    templateJson: {
      type: 'single-column',
      sections: ['summary', 'experience', 'projects', 'skills', 'education'],
    },
  },
  {
    key: 'compact-1',
    name: 'Compact',
    description: 'Tight spacing for 1-page resumes.',
    templateJson: {
      type: 'single-column-compact',
      sections: ['summary', 'skills', 'experience', 'projects', 'education'],
    },
  },
];

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const templates = await this.prisma.resumeTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, key: true, name: true, description: true, templateJson: true, updatedAt: true },
    });
    return templates;
  }

  async ensureDefaults() {
    for (const t of DEFAULT_TEMPLATES) {
      await this.prisma.resumeTemplate.upsert({
        where: { key: t.key },
        update: { name: t.name, description: t.description, templateJson: t.templateJson as any },
        create: { key: t.key, name: t.name, description: t.description, templateJson: t.templateJson as any },
      });
    }
  }
}

