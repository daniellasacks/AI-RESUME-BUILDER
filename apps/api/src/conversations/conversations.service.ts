import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { parseOrBadRequest } from '../common/zod';

const StartSchema = z.object({
  resumeId: z.string().optional(),
  title: z.string().min(1).optional(),
});

const SendSchema = z.object({
  content: z.string().min(1),
});

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async start(userId: string, input: unknown) {
    const parsed = parseOrBadRequest(StartSchema, input);

    const session = await this.prisma.conversationSession.create({
      data: {
        userId,
        resumeId: parsed.resumeId,
        title: parsed.title ?? 'Resume Builder Chat',
        messages: {
          create: [
            {
              role: 'system',
              content:
                'Conversation started. The assistant will guide the user through building an ATS-friendly resume.',
            },
            {
              role: 'assistant',
              content:
                "Hi! I’ll help you build a strong resume. What’s your full name and what role are you targeting?",
            },
          ],
        },
      },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    return session;
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.conversationSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async send(userId: string, sessionId: string, input: unknown) {
    const parsed = parseOrBadRequest(SendSchema, input);

    const session = await this.prisma.conversationSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');

    await this.prisma.conversationMessage.create({
      data: { sessionId: session.id, role: 'user', content: parsed.content },
    });

    const history = session.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    history.push({ role: 'user', content: parsed.content });

    const system = [
      'You are a resume/career assistant.',
      'You must be concise, friendly, and ask one focused follow-up question at a time.',
      'Goal: collect missing details, rewrite bullets with action verbs + impact metrics, and tailor to target role.',
      'If the user hasn’t provided target role or seniority, ask for it early.',
      'Output plain text (no JSON) for now.',
    ].join('\n');

    const assistant = await this.ai.respond({ system, messages: history.slice(-12) });

    await this.prisma.conversationMessage.create({
      data: { sessionId: session.id, role: 'assistant', content: assistant },
    });

    return this.getSession(userId, sessionId);
  }
}

