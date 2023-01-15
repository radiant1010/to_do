import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

//변수와 함수로 선언하는거 차이 기술
const mockPostRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let userService: UsersService;
  let userRepository: MockRepository<User>;

  const saltRounds = 10;
  let hashedPassword: string;
  let createUserDto: CreateUserDto;

  /*   beforeAll(() => {
      hashedPassword = bcrypt.hashSync('Asdf1234!@!', saltRounds);
      createUserDto = {
        email: 'test@test.com',
        name: '홍길동',
        password: hashedPassword,
      };
    }); */

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
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be userService', () => {
    expect(userService).toBeDefined();
  });

  it('should be userRepository', () => {
    expect(userRepository).toBeDefined();
  });

  //USER 회원가입 처리
  describe('create()', () => {
    //회원가입 더미 데이터
    createUserDto = {
      email: 'test@test.com',
      name: '홍길동',
      password: 'Asdf1234!@',
    };
    //Email 검사 실패
    it.todo('이메일이 중복되는 경우');
    //Email 검사 성공
    it('이메일이 중복되지 않는 경우', async () => {
      // postRepository.save() error 발생
      //userRepository.save.mockRejectedValue('save error');
      const findOneResult = await userService.isEmail(createUserDto.email);
      //catch문 내용 출력이 가능한지?
      //expect(result).toEqual({ code: 201, success: false, message: error.message });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(findOneResult).toEqual({ code: 102, success: true, message: '중복되는 E-Mail이 없습니다.' });
    });
    //회원가입 완료 Test
    it('회원 가입 완료', async () => {
      console.log(createUserDto);
      const createUserResult = await userService.create(createUserDto);
      //1번 호출 되었는지?
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      //password 암호화 한 것 어떻게 가져오지?
      expect(createUserResult).toEqual({ code: 101, success: true, message: '회원가입 완료!' });
    });
  });
});
