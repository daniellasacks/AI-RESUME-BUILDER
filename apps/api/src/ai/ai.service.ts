import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly client: OpenAI | null;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async respond(params: {
    system: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  }): Promise<string> {
    if (!this.client) {
      // Local/dev fallback so the app still “works” without keys.
      const last = params.messages.at(-1)?.content ?? '';
      const wantsJson = /only output valid json|output valid json|json/i.test(params.system);
      if (wantsJson) {
        return JSON.stringify(
          {
            basics: { fullName: 'Demo User', headline: 'Full Stack Developer' },
            skills: [{ category: 'Core', items: ['JavaScript', 'TypeScript', 'React', 'Node.js'] }],
            experience: [],
            projects: [],
            education: [],
            certifications: [],
          },
          null,
          2,
        );
      }

      return [
        "I’m running in demo mode (no `OPENAI_API_KEY`).",
        `You said: ${last}`,
        'Next questions:',
        '- What role are you targeting?',
        '- What are 2–3 achievements you’re most proud of?',
      ].join('\n');
    }

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: params.system },
        ...params.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }
}

