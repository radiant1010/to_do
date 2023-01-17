import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ArgumentMetadata, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
//Repostory 선언(utility type)
/* 
  Partial<T> : <T>의 모든 프로퍼티를 선택적으로 만드는 타입을 구성합니다. 이 유틸리티는 주어진 타입의 모든 하위 타입 집합을 나타내는 타입을 반환합니다.
  Record<K, T> : 타입 T의 프로퍼티의 집합 K로 타입을 구성합니다. 이 유틸리티는 타입의 프로퍼티들을 다른 타입에 매핑시키는 데 사용될 수 있습니다.
  상세 설명 : https://typescript-kr.github.io/pages/utility-types.html
  https://darrengwon.tistory.com/999
  keyof Repository<T>로 해당 Repository가 가지고 있는 메서드 추출
  해당 타입을 Key 값으로, jest.Mock 값을 Value로 Return
  정의된 메서드를 사용하지 않고 일부만 사용하기에 Partial로 감싸 optional 처리
 */
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
//변수와 함수로 선언하는거 차이?
const mockUserRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
});

describe('UsersService', () => {
  let userService: UserService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be userService', () => {
    expect(userService).toBeDefined();
  });

  it('should be userRepository', () => {
    expect(userRepository).toBeDefined();
  });
  //USER 회원가입 처리
  describe('createAccount()', () => {
    const createUserDto = {
      email: 'test@test.com',
      name: '홍길동',
      password: 'Asdf1234!@',
    };

    //PIPE 설정
    const target: ValidationPipe = new ValidationPipe({ transform: true, whitelist: true });
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: CreateUserDto,
      data: '',
    };

    //###Q1. jest.spyOn는 언제 써야하는가?
    //###Q2. Repository를 그냥 쓰는경우는 언제인가?
    it('e-mail이 중복인 경우', async () => {
      //이건 왜 넣지?
      userRepository.findOne.mockResolvedValue({ email: 'test@test.com' });
      //그리고 Service를 왜 호출하지?
      const result = await userService.createAccount(createUserDto);
      expect(result).toMatchObject({ success: false, message: '이미 가입 처리된 e-mail입니다.' });
    });

    //회원가입 완료 Test
    it('회원 가입 성공', async () => {
      //e-mail 조회(성공 가정)
      userRepository.findOne.mockResolvedValue(undefined);
      //계정 정보 저장(성공)
      userRepository.create.mockReturnValue(createUserDto);
      userRepository.save.mockResolvedValue(createUserDto);
      //create 호출
      const createResult = await userService.createAccount(createUserDto);

      expect(userRepository.create).toBeCalledWith(createUserDto);
      expect(userRepository.create).toHaveBeenCalledTimes(1);

      expect(userRepository.save).toBeCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      //결과
      expect(createResult).toEqual({ success: true, message: '회원가입 완료!' });
    });

    //회원가입 실패 Test
    it('회원가입에 실패한 경우(Pipe)', async () => {
      //nest pipe를 가져와야함(안그러면 에러를 출력 못함)
      await target.transform(createUserDto, metadata).catch((e) => {
        //message를 커스텀하게 주지 않았기에 Bad Request를 반환
        expect(e.getResponse().error).toEqual('Bad Request');
        //정규식(모든게 안맞는 경우)
        expect(e.getResponse().message).toEqual([
          'name must be shorter than or equal to 5 characters',
          'email must be an email',
          'password must match /^(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])[A-Za-z\\d$@$!%*#?&]{8,}$/ regular expression',
          'password should not be empty',
        ]);
      });
    });
  });

  //E-mail 조회
  /*   describe('findOne', () => {
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
    }); */
});
