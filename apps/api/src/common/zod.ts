import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export function parseOrBadRequest<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException({
      error: 'VALIDATION_ERROR',
      issues: parsed.error.issues,
    });
  }
  return parsed.data;
}

