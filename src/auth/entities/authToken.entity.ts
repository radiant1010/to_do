import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class AuthToken {
  @PrimaryGeneratedColumn()
  token_id: number;

  @Column({ nullable: true, unique: true })
  token: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ type: "datetime", nullable: false })
  expire_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
