import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class OTP {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    password: string;
    @Column({ default: false })
    used: boolean;
    @CreateDateColumn()
    created: Date;
    /* The `fromDate` column: this is initialy set to the the current data, but can be changed when an OTP is resent. 
    // Saving the expiry of an OTP is not ideal as it can be changed the enviroment variables.
    */
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fromDate: Date;
    @Column({ default: 0 })
    resendCount: number;
    @ManyToOne(() => User, (user) => user.otps)
    user: User
}