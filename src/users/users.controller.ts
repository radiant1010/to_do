import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Res, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('users')
export class UsersController {
  authService: any;
  constructor(private readonly userService: UserService) {}
  //회원가입
  @Post('signup')
  async createAccount(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createAccount(createUserDto);
  }
  //로그인
  //###Q1. request.body에서 유저 정보 가져오기 vs DTO에서 정보 가져오기중 어떤것이 보안적인 측면에서 좋은방법인가?
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Req() req, @Res({ passthrough: false }) res) {
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
    return res.json(jwtData);
  }
  //로그아웃
  //ID 찾기(E-mail)
  //##계정 정보 수정
}
