import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OTP } from "./otp.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number
    @Column({ unique: true })
    email: string;
    @OneToMany(() => OTP, (otp) => otp.user, { lazy: true })
    otps: OTP[]
}
