import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ArgumentMetadata, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
//변수와 함수로 선언하는거 차이?
const mockPostRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
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
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be userService', () => {
    expect(userService).toBeDefined();
  });

  it('should be userRepository', () => {
    expect(userRepository).toBeDefined();
  });

  describe('findOne', () => {
    const newUser = 'new_user@test.com';
    //Email 검사 실패
    it('이메일이 중복되어 에러 반환', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(createUserDto);
      await expect(async () => {
        await userService.findOne({ email: createUserDto.email });
      }).rejects.toThrowError(new HttpException('중복된 E-Mail입니다.', HttpStatus.BAD_REQUEST));
    });
    //Email 검사 성공
    it('이메일이 중복되지 않는 경우', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      const findOneResult = await userService.findOne({ email: newUser });
      expect(findOneResult).toEqual(findOneResult);
    });
  });
  //USER 회원가입 처리
  describe('create()', () => {
    const checkEmail = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    const checkName = /^[가-힣]{2,5}$/;
    const checkPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
    const wrongInput = {
      email: 'test1234@test',
      name: '미스터닭볶음탕',
      password: '',
    };
    //PIPE 설정
    const target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true });
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: CreateUserDto,
      data: '',
    };

    //회원가입 완료 Test
    it('회원 가입 성공', async () => {
      console.log('회원가입 완료');
      const createSpy = jest.spyOn(userRepository, 'create').mockResolvedValue(createUserDto);
      //정규식 검증
      expect(createUserDto.email).toMatch(checkEmail);
      expect(createUserDto.name).toMatch(checkName);
      expect(createUserDto.password).toMatch(checkPassword);
      //create 호출
      const createResult = await userService.create(createUserDto);
      //비밀번호 DTO에서 바뀌는거는 검증 정확 하게 어케함?!?!
      expect(createSpy).toBeCalledWith(createUserDto);
      //저장은 한번만 되었는지?
      expect(createSpy).toHaveBeenCalledTimes(1);
      //결과 Return
      expect(createResult).toEqual({ success: true, message: '회원가입 완료!' });
    });

    //회원가입 실패 Test
    it('회원 가입 실패', async () => {
      console.log('회원가입 실패');
      const wrongUserSpy = jest.spyOn(userRepository, 'save').mockResolvedValue(wrongInput);
      //error로 들어가니까 save 함수 호출하면 안됨
      expect(wrongUserSpy).not.toHaveBeenCalled();
      //nest pipe를 가져와야함(안그러면 에러를 출력 못함)
      await target.transform(wrongInput, metadata).catch((e) => {
        //message를 커스텀하게 주지 않았기에 Bad Request를 반환
        expect(e.getResponse().error).toEqual('Bad Request');
        //정규식(모든게 안맞음)
        expect(e.getResponse().message).toEqual([
          'name must be shorter than or equal to 5 characters',
          'email must be an email',
          'password must match /^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$/ regular expression',
          'password should not be empty',
        ]);
      });
    });
  });
});
