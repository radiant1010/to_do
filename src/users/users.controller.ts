import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Res } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { SigninDto } from './dto/login.dto';

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
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Body() signinDto: SigninDto, @Res() res) {
    const jwtData = await this.userService.login(signinDto);

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

    return res.json({ success: true, message: 'JWT 생성 완료!' });
  }
  //로그아웃
  //ID 찾기(E-mail)
  //##계정 정보 수정
}
