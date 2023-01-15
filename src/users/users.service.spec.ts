import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
//변수와 함수로 선언하는거 차이?
const mockPostRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
});

const createUserDto = {
  email: 'test@test.com',
  name: '홍길동',
  password: 'Asdf1234!@',
};

describe('UsersService', () => {
  let userService: UsersService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockPostRepository(),
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userRepository = module.get('UserRepository') as MockRepository<User>;
  });

  it('should be userService', () => {
    expect(userService).toBeDefined();
  });

  it('should be userRepository', () => {
    expect(userRepository).toBeDefined();
  });

  describe('findOne', () => {
    //Email 검사 실패
    it('이메일이 중복되는 경우', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(createUserDto);
      await expect(async () => {
        await userService.findOne({ email: createUserDto.email });
      }).rejects.toThrowError(new HttpException('중복된 E-Mail입니다.', HttpStatus.BAD_REQUEST));
    });
    //Email 검사 성공
    it('이메일이 중복되지 않는 경우', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      const newUser = 'new_user@test.com';
      const findOneResult = await userService.findOne({ email: newUser });
      expect(findOneResult).toEqual(findOneResult);
    });
  });
  //USER 회원가입 처리
  describe('create()', () => {
    //인풋 체크
    it.todo('입력값 검증');
    //회원가입 완료 Test
    it.todo('회원 가입 완료');
    //회원가입 실패 Test
    it.todo('회원 가입 실패');
  });
});
