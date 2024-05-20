import { User } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    /**
     * 
     * @param where The key value pairs to search for
     * @returns A user entity
     * @description This method finds a user that matches the given key value pairs provided as parameters
     */
    async findOne(where: FindOptionsWhere<User>): Promise<User | null> {
        return await this.userRepository.findOne({ where })
    }

    /**
     * 
     * @param email The email address of the user
     * @returns A user entity
     * @description This method creates a new user with the given email address
     */
    async create(email: string): Promise<User> {
        const user = this.userRepository.create({ email });
        return this.userRepository.save(user)
    }
}
