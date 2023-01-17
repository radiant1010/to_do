import { AuthToken } from './entities/authToken.entity';
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { UserService } from 'src/users/users.service';

@Module({
  //User service등 사용하기 위해서 import
  imports: [TypeOrmModule.forFeature([AuthToken, User]), PassportModule.register({}), JwtModule.register({})],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
