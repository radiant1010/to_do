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
  ) {}

  async create(createUserDto: CreateUserDto) {
    console.log('입력 받은 정보 :', createUserDto);
    try {
      //await this.userRepository.save(this.userRepository.create(createUserDto));
      const user: User = this.userRepository.create(createUserDto);
      const result: User = await this.userRepository.save(user);
      console.log(result);
      return { success: true, message: '회원가입 완료!' };
    } catch (error) {
      console.error(error);
      return { success: false, message: '회원 가입에 실패 하였습니다. 입력한 정보를 확인해 주세요.' };
    }
  }

  //중복 계정 조회
  async findOne({ email }: { email: string }): Promise<User> {
    //email여부 조회(유저 정보)
    const getEmail = await this.userRepository.findOne({ where: { email: email } });
    if (getEmail) throw new HttpException('중복된 E-Mail입니다.', HttpStatus.BAD_REQUEST);
    return getEmail;
  }
}
