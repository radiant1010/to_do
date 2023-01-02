import { Inject, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
@Injectable()
export class UsersService {
  constructor(
    @Inject("USER_REPOSITORY")
    private userRepository: Repository<User>
  ) {
    this.userRepository = userRepository;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      //중복 email 체크
      console.log("DTO로 넘어온 E-Mail :", createUserDto.email);
      const isEmail = await this.isEmail(createUserDto.email);
      if (isEmail) {
        //email이 중복이면
        const errorMsg = "이미 가입된 E-mail이 존재합니다.";
        const error = new Error(errorMsg);
        error.name = "isEmail";
        throw error;
      } else {
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);

        const saveUser = await this.userRepository.save({
          name: createUserDto.name,
          email: createUserDto.email,
          password: hash,
        });

        return {
          code: 101,
          result: `${saveUser.name}님 회원가입을 축하드립니다.`,
        };
      }
    } catch (error) {
      if (error.name === "isEmail") {
        console.error(error);
        return { code: 201, result: error.message };
      }
    }
  }

  //email Check
  async isEmail(email: string): Promise<User> {
    //email여부 조회(유저 정보)
    const isEmail = await this.userRepository.findOne({
      where: { email: email },
    });

    return isEmail;
  }

  //user 정보 조회(로그인)
  async findOne(email: string): Promise<User> {
    const isUser = await this.userRepository.findOne({
      where: { email: email },
    });
    return isUser;
  }

  /*   async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }


  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  } */
}
