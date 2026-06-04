import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConversationsService } from './conversations.service';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Post('start')
  start(@Req() req: any, @Body() body: unknown) {
    return this.conversations.start(req.user.id, body);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.conversations.getSession(req.user.id, id);
  }

  @Post(':id/messages')
  send(@Req() req: any, @Param('id') id: string, @Body() body: unknown) {
    return this.conversations.send(req.user.id, id, body);
  }
}

