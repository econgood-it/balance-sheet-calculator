import {PrimaryGeneratedColumn, Column, Entity, Index, BeforeInsert} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {

    private static readonly HASH_SALT: number;

    @PrimaryGeneratedColumn()
    public readonly id: number | undefined;
    @Column()
    @Index({ unique: true })
    public readonly email: string;
    @Column()
    public password: string;

    public constructor(
        id: number | undefined,
        email: string,
        password: string,
    ) {
        this.id = id;
        this.email = email;
        this.password = password;
    }

    @BeforeInsert()
    hashPassword() {
        const salt = bcrypt.genSaltSync(User.HASH_SALT);
        this.password = bcrypt.hashSync(this.password, salt);
    }

    public comparePassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password);
    }

}
