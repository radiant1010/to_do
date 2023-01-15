import { HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    //중복 email 체크
    const isEmail = await this.findOne({ email: createUserDto.email });
    if (isEmail) {
      const saltOrRounds = 10;
      const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);

      const saveUser = await this.userRepository.save({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hash,
      });

      return { success: true, message: '회원가입 완료!' };
    }
  }

  //중복 계정 조회
  async findOne({ email }: { email: string }): Promise<User> {
    //email여부 조회(유저 정보)
    const getEmail = await this.userRepository.findOne({
      where: { email: email },
    });
    console.log('유저 조회결과 :', getEmail);
    if (getEmail) {
      throw new HttpException('중복된 E-Mail입니다.', HttpStatus.BAD_REQUEST);
    }
    return getEmail;
  }
}
