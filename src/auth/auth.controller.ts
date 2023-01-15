import { Controller, Get, Header, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as moment from 'moment';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Request() req, @Res() res) {
    //type을 공식 문서대로 type를 response: Response라고 지정해주면 왜 res.cookie를 사용하지 못할까?
    const jwtData = await this.authService.login(req.user);

    //access_token
    res.cookie('Authorization', jwtData.access_token, {
      httpOnly: true,
      //30분 뒤 expire
      maxAge: 1000 * 60 * 30,
    });
    //refresh_token
    res.cookie('Refresh', jwtData.refresh_token, {
      httpOnly: true,
      //2주뒤 expire
      maxAge: 1000 * 60 * 60 * 24 * 14,
    });

    return res.json({ code: 102, message: 'JWT 생성 완료!' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
