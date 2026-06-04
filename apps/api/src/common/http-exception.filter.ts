import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = isHttp ? exception.getResponse() : null;

    response.status(status).json({
      ok: false,
      status,
      path: request?.url,
      message:
        typeof payload === 'string'
          ? payload
          : (payload as any)?.message ?? 'Unexpected error',
      details: typeof payload === 'object' ? payload : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}

