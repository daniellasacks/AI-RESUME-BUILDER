import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Get()
  list(@Req() req: any) {
    return this.uploads.list(req.user.id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    // Note: multipart form fields arrive as strings
    const meta = { kind: body?.kind };
    return this.uploads.createFromFile({ userId: req.user.id, file, meta });
  }
}

