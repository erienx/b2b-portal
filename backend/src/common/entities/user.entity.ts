import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { UserDistributorAssignment } from './user-distributor-assignment.entity';
import { UserActivityLog } from './user-activity-log.entity';
import { MediaFile } from './media-file.entity';
import { Distributor } from './distributor.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ length: 255 })
    password_hash: string;

    @Column({ length: 100 })
    first_name: string;

    @Column({ length: 100 })
    last_name: string;

    @Column({ type: 'enum', enum: UserRole })
    role: UserRole;

    @Column({ default: true })
    is_active: boolean;

    @Column({ default: false })
    is_locked: boolean;

    @Column({ default: 0 })
    failed_login_attempts: number;

    @Column({ type: 'timestamp', nullable: true })
    password_changed_at: Date;

    @Column({ default: true })
    must_change_password: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => UserDistributorAssignment, (uda) => uda.user)
    assignments: UserDistributorAssignment[];

    @OneToMany(() => UserActivityLog, (log) => log.user)
    activityLogs: UserActivityLog[];

    @OneToMany(() => MediaFile, (file) => file.uploadedBy)
    uploadedFiles: MediaFile[];

    @OneToMany(() => Distributor, (d) => d.exportManager)
    managedDistributors: Distributor[];
}
