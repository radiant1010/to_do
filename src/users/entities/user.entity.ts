import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;
  //유저 이름
  @Column({ nullable: false })
  name: string;
  //유저 이메일
  @Column({ type: "varchar", unique: true, nullable: false })
  email: string;
  //bcrypt 옵션 추가
  @Column({ nullable: false })
  password: string;
  @Column({ nullable: false, default: "common" })
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
}
