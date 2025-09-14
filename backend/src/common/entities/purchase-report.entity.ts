import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Distributor } from './distributor.entity';
import { User } from './user.entity';

@Entity('purchase_reports')
@Unique(['distributor', 'year', 'quarter'])
export class PurchaseReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Distributor, (d) => d.purchaseReports)
    distributor: Distributor;

    @Column()
    year: number;

    @Column()
    quarter: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    last_year_sales: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    purchases: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    budget: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    actual_sales: number;

    @Column({ default: 0 })
    total_pos: number;

    @Column({ default: 0 })
    new_openings: number;

    @Column({ default: 0 })
    new_openings_target: number;

    @ManyToOne(() => User, { nullable: true })
    createdBy: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
