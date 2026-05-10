import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { OpenSessionDto } from './dto/open-session.dto';

@Controller('api/v1/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  openSession(@Body() dto: OpenSessionDto) {
    return this.sessionsService.openSession(dto);
  }

  @Get(':token')
  getSession(@Param('token') token: string) {
    return this.sessionsService.getByToken(token);
  }
}
