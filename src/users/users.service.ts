import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthToken } from 'src/auth/entities/authToken.entity';
import { JwtService } from '@nestjs/jwt';
import moment from 'moment';
import { SigninDto } from './dto/login.dto';
import { jwtConstants } from 'src/auth/constants';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthToken)
    private readonly authRepository: Repository<AuthToken>,
    private readonly jwtService: JwtService,
  ) {}
  //회원가입
  async createAccount({ email, name, password }: CreateUserDto) {
    try {
      //check E-mail
      const isEmail = await this.userRepository.findOne({ where: { email: email } });
      if (isEmail) {
        return { success: false, message: '이미 가입 처리된 e-mail입니다.' };
      }
      //Q. @BeforeInsert 사용하면 안먹힘 create -> save 해야함 원인 파악
      const user: User = this.userRepository.create({ email, name, password });
      await this.userRepository.save(user);
      return { success: true, message: '회원가입 완료!' };
    } catch (error) {
      return { success: false, message: '회원 가입에 실패 하였습니다. 입력한 정보를 확인해 주세요.' };
    }
  }
  //로그인
  async login({ email, password }: SigninDto) {
    try {
      //유저 조회
      const user = await this.userRepository.findOne({ where: { email: email } });
      if (!user) {
        return { success: false, message: '가입된 유저정보를 확인 할 수 없습니다!' };
      }
      //Password 검증
      const isPassword = await user.checkPassword(password);
      if (!isPassword) {
        return { success: false, message: '비밀번호를 확인해 주세요!' };
      }
      //JWT로 만들기 위한 User 정보
      const payload = {
        sub: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      //refresh token, Access Token 둘다 생성
      const accessToken = this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
        expiresIn: '30m',
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: jwtConstants.refresh,
        expiresIn: '2w',
      });
      //refresh token DB 저장
      //const saveToken = await this.authRepository.save()
      //DB에 저장 완료되면 cookie에 등록할 값 전달
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      return { success: false, message: '로그인 정보를 찾을 수 없습니다.' };
    }
  }
  //회원 정보 수정

  //계정 조회
  async findOne({ email }: { email: string }): Promise<User> {
    //email여부 조회(유저 정보)
    const getEmail = await this.userRepository.findOne({ where: { email: email } });
    if (getEmail) throw new HttpException('중복된 E-Mail입니다.', HttpStatus.BAD_REQUEST);
    return getEmail;
  }
}
