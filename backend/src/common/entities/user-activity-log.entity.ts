import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { UserAction } from '../enums/user-action.enum';

@Entity('user_activity_logs')
export class UserActivityLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (u) => u.activityLogs, { nullable: true })
    @Index()
    user: User;

    @Column({ type: 'enum', enum: UserAction })
    @Index()
    action: UserAction;

    @Column({ length: 50, nullable: true })
    resource_type: string;

    @Column({ type: 'uuid', nullable: true })
    resource_id: string;

    @Column({ nullable: true })
    ip_address: string;

    @Column({ type: 'text', nullable: true })
    user_agent: string;

    @Column({ type: 'jsonb', nullable: true })
    details: Record<string, any>;

    @CreateDateColumn()
    @Index()
    created_at: Date;
}
