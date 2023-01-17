import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuthToken } from './auth/entities/authToken.entity';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './users/users.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'to_do_user',
      password: 'Asdf1234!@',
      database: 'to_do',
      entities: [User, AuthToken],
      synchronize: true,
      timezone: '+09:00',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
