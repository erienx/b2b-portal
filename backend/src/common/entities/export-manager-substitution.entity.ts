import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, } from 'typeorm';
import { User } from './user.entity';

@Entity('export_manager_substitutions')
export class ExportManagerSubstitution {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { nullable: false })
    @Index()
    exportManager: User;

    @ManyToOne(() => User, { nullable: false })
    substitute: User;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({ default: true })
    is_active: boolean;

    @ManyToOne(() => User, { nullable: true })
    createdBy: User;

    @CreateDateColumn()
    created_at: Date;
}
