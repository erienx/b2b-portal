import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Distributor } from './distributor.entity';

@Entity('user_distributor_assignments')
@Unique(['user', 'distributor'])
export class UserDistributorAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (u) => u.assignments, { onDelete: 'CASCADE' })
    user: User;

    @ManyToOne(() => Distributor, (d) => d.assignments, { onDelete: 'CASCADE' })
    distributor: Distributor;

    @CreateDateColumn()
    created_at: Date;
}
