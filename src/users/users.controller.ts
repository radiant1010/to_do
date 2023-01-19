import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Res, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RefreshAuthGuard } from 'src/auth/refresh-auth.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}
  //회원가입
  @Post('signup')
  async createAccount(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createAccount(createUserDto);
  }
  //로그인
  //###Q1. request.body에서 유저 정보 가져오기 vs DTO에서 정보 가져오기중 어떤것이 보안적인 측면에서 좋은방법인가?
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Req() req, @Res({ passthrough: true }) res) {
    //localStrategy를 통과해야지 user 데이터 넘어옴(아닐시에 validate에서 throw Exception에서 막힘)
    const { user } = req.user;
    const jwtData = await this.userService.login(user);
    //###Q2. Token 발급시에 maxAge는 GMT+00:00시 기준, 브라우저에서는 cookie볼때 GMT+09:00로 인식할까?
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
    return { success: true, message: '로그인 완료' };
  }
  //로그아웃
  @UseGuards(RefreshAuthGuard)
  @Post('logout')
  async logOut(@Req() req, @Res({ passthrough: true }) res) {
    //로그아웃시 DB 정보 삭제하는 로직 추가
    const removeToken = await this.authService.removeRefreshToken(req.user.id);
    if (removeToken.success) {
      res.cookie('Authorization', '', { httpOnly: true });
      res.cookie('Refresh', '', { httpOnly: true });
    }
    return { success: true, message: '로그아웃 완료' };
  }
  //ID 찾기(E-mail)
  //##계정 정보 수정
}
