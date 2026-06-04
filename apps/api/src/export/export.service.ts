import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { ResumeSchema } from '../resume/resume.schemas';

function safeString(v: unknown) {
  return typeof v === 'string' ? v : '';
}

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportPdf(params: { userId: string; resumeVersionId: string }) {
    const version = await this.prisma.resumeVersion.findFirst({
      where: { id: params.resumeVersionId, resume: { userId: params.userId } },
      include: { resume: { select: { title: true } } },
    });
    if (!version) throw new NotFoundException('Resume version not found');

    const parsed = ResumeSchema.safeParse(version.structuredJson);
    const r = parsed.success ? parsed.data : ({ basics: { fullName: 'Unknown' } } as any);

    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));

    doc.fontSize(18).text(r.basics.fullName, { align: 'left' });
    doc.moveDown(0.25);
    if (r.basics.headline) doc.fontSize(11).fillColor('#444').text(r.basics.headline);
    doc.fillColor('#000');

    const contact = [r.basics.email, r.basics.phone, r.basics.location].filter(Boolean).join(' • ');
    if (contact) {
      doc.moveDown(0.25);
      doc.fontSize(10).fillColor('#444').text(contact);
      doc.fillColor('#000');
    }

    if (r.basics.summary) {
      doc.moveDown();
      doc.fontSize(12).text('Summary', { underline: true });
      doc.moveDown(0.25);
      doc.fontSize(10).text(r.basics.summary);
    }

    if (r.experience?.length) {
      doc.moveDown();
      doc.fontSize(12).text('Experience', { underline: true });
      for (const e of r.experience) {
        doc.moveDown(0.5);
        doc.fontSize(11).text(`${e.title} — ${e.company}`);
        const dates = [e.startDate, e.endDate].filter(Boolean).join(' - ');
        if (dates) doc.fontSize(9).fillColor('#444').text(dates).fillColor('#000');
        for (const h of e.highlights ?? []) {
          doc.fontSize(10).text(`• ${h}`, { indent: 12 });
        }
      }
    }

    if (r.projects?.length) {
      doc.moveDown();
      doc.fontSize(12).text('Projects', { underline: true });
      for (const p of r.projects) {
        doc.moveDown(0.5);
        doc.fontSize(11).text(p.name);
        if (p.description) doc.fontSize(10).text(p.description);
        for (const h of p.highlights ?? []) doc.fontSize(10).text(`• ${h}`, { indent: 12 });
      }
    }

    if (r.skills?.length) {
      doc.moveDown();
      doc.fontSize(12).text('Skills', { underline: true });
      for (const s of r.skills) {
        doc.moveDown(0.25);
        doc.fontSize(10).text(`${s.category}: ${s.items.join(', ')}`);
      }
    }

    if (r.education?.length) {
      doc.moveDown();
      doc.fontSize(12).text('Education', { underline: true });
      for (const ed of r.education) {
        doc.moveDown(0.25);
        doc.fontSize(10).text([ed.school, ed.degree, ed.field].filter(Boolean).join(' — '));
      }
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return { filename: `${safeString(version.resume.title || 'resume')}.pdf`, buffer };
  }

  async exportDocx(params: { userId: string; resumeVersionId: string }) {
    const version = await this.prisma.resumeVersion.findFirst({
      where: { id: params.resumeVersionId, resume: { userId: params.userId } },
      include: { resume: { select: { title: true } } },
    });
    if (!version) throw new NotFoundException('Resume version not found');

    const parsed = ResumeSchema.safeParse(version.structuredJson);
    const r = parsed.success ? parsed.data : ({ basics: { fullName: 'Unknown' } } as any);

    const children: Paragraph[] = [];
    children.push(
      new Paragraph({
        children: [new TextRun({ text: r.basics.fullName, bold: true, size: 34 })],
      }),
    );
    if (r.basics.headline) children.push(new Paragraph({ text: r.basics.headline }));
    const contact = [r.basics.email, r.basics.phone, r.basics.location].filter(Boolean).join(' • ');
    if (contact) children.push(new Paragraph({ text: contact }));

    if (r.basics.summary) {
      children.push(new Paragraph({}));
      children.push(new Paragraph({ children: [new TextRun({ text: 'Summary', bold: true })] }));
      children.push(new Paragraph({ text: r.basics.summary }));
    }

    if (r.experience?.length) {
      children.push(new Paragraph({}));
      children.push(new Paragraph({ children: [new TextRun({ text: 'Experience', bold: true })] }));
      for (const e of r.experience) {
        children.push(new Paragraph({ text: `${e.title} — ${e.company}` }));
        const dates = [e.startDate, e.endDate].filter(Boolean).join(' - ');
        if (dates) children.push(new Paragraph({ text: dates }));
        for (const h of e.highlights ?? []) children.push(new Paragraph({ text: `• ${h}` }));
      }
    }

    if (r.projects?.length) {
      children.push(new Paragraph({}));
      children.push(new Paragraph({ children: [new TextRun({ text: 'Projects', bold: true })] }));
      for (const p of r.projects) {
        children.push(new Paragraph({ text: p.name }));
        if (p.description) children.push(new Paragraph({ text: p.description }));
        for (const h of p.highlights ?? []) children.push(new Paragraph({ text: `• ${h}` }));
      }
    }

    if (r.skills?.length) {
      children.push(new Paragraph({}));
      children.push(new Paragraph({ children: [new TextRun({ text: 'Skills', bold: true })] }));
      for (const s of r.skills) children.push(new Paragraph({ text: `${s.category}: ${s.items.join(', ')}` }));
    }

    if (r.education?.length) {
      children.push(new Paragraph({}));
      children.push(new Paragraph({ children: [new TextRun({ text: 'Education', bold: true })] }));
      for (const ed of r.education) {
        children.push(new Paragraph({ text: [ed.school, ed.degree, ed.field].filter(Boolean).join(' — ') }));
      }
    }

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);
    return { filename: `${safeString(version.resume.title || 'resume')}.docx`, buffer };
  }
}

