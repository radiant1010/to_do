import { Controller, Get, Header, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshAuthGuard } from './refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  //Refresh Token 재발급
  @UseGuards(RefreshAuthGuard)
  @Get('refresh-token')
  reGenRefreshToken(@Res({ passthrough: true }) res, @Request() req) {
    //console.log(req.user);
    //req.user ==> Passport 전략에서 나오는 최종 결과물
    //여기선 Refresh Token 시나리오 적은거 그대로 구현하면됨.
    //cookie도 다시 올려주고
    return req.user;
  }
}
