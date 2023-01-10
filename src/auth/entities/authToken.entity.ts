import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";

@Entity()
export class AuthToken {
  @PrimaryColumn()
  token_id: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ type: "datetime", nullable: false })
  expire_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
