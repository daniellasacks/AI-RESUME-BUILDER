import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type';
import { PrismaService } from '../prisma/prisma.service';
import { z } from 'zod';

const UploadMetaSchema = z.object({
  kind: z.enum(['resume', 'job_description', 'other']).optional(),
});

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.uploadDir = config.get<string>('UPLOAD_DIR', path.join(process.cwd(), 'uploads'));
  }

  private async ensureDir() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  private normalizeText(input: string) {
    return input
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async createFromFile(params: {
    userId: string;
    file: Express.Multer.File;
    meta: unknown;
  }) {
    const meta = UploadMetaSchema.safeParse(params.meta);
    if (!meta.success) throw new BadRequestException(meta.error.flatten());

    if (!params.file?.buffer?.length) throw new BadRequestException('Missing file');

    const kind = meta.data.kind ?? 'other';

    const detected = await fileTypeFromBuffer(params.file.buffer).catch(() => null);
    const mimeType = detected?.mime ?? params.file.mimetype ?? 'application/octet-stream';

    const allowed = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    if (!allowed.has(mimeType)) {
      throw new BadRequestException(
        `Unsupported file type: ${mimeType}. Please upload PDF or DOCX.`,
      );
    }

    await this.ensureDir();

    const ext = mimeType === 'application/pdf' ? 'pdf' : 'docx';
    const storageKey = `${params.userId}/${randomUUID()}.${ext}`;
    const storagePath = path.join(this.uploadDir, storageKey);
    await fs.mkdir(path.dirname(storagePath), { recursive: true });
    await fs.writeFile(storagePath, params.file.buffer);

    const extractedText = await this.extractText(mimeType, params.file.buffer);

    const doc = await this.prisma.uploadedDocument.create({
      data: {
        userId: params.userId,
        kind,
        filename: params.file.originalname,
        mimeType,
        sizeBytes: params.file.size,
        storageKey,
        extractedText,
      },
      select: {
        id: true,
        kind: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        storageKey: true,
        extractedText: true,
        createdAt: true,
      },
    });

    return doc;
  }

  async extractText(mimeType: string, buffer: Buffer) {
    if (mimeType === 'application/pdf') {
      const res = await (pdfParse as any)(buffer);
      return this.normalizeText(res.text || '');
    }

    // DOCX
    const res = await mammoth.extractRawText({ buffer });
    return this.normalizeText(res.value || '');
  }

  async list(userId: string) {
    return this.prisma.uploadedDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        kind: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    });
  }
}

