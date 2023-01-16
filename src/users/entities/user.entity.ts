import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;
  //유저 이름
  @Column({ nullable: false })
  name: string;
  //유저 이메일
  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: 'common' })
  role: string;
  //삭제여부
  @Column({ nullable: true, default: false })
  del_yn: boolean;
  //생성일
  @CreateDateColumn()
  created_at: Date;
  //수정일
  @UpdateDateColumn()
  updated_at: Date;
  //비밀번호 암호화(데이터 insert 동작 반대는 AfterInsert)
  @BeforeInsert()
  async setPassword(): Promise<void> {
    try {
      if (this.password) {
        const hashedPassword = await this.hashPassword(this.password);
        this.password = hashedPassword;
      }
    } catch (error) {
      throw new InternalServerErrorException('Password hash Error');
    }
  }

  private hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
