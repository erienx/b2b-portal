import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, } from 'typeorm';
import { User } from './user.entity';
import { UserDistributorAssignment } from './user-distributor-assignment.entity';
import { SalesChannelsReport } from './sales-channels-report.entity';
import { PurchaseReport } from './purchase-report.entity';

@Entity('distributors')
export class Distributor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    company_name: string;

    @Column({ length: 2 })
    country: string;

    @Column({ length: 3 })
    currency: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => User, (u) => u.managedDistributors, { nullable: true })
    exportManager: User;

    @OneToMany(() => UserDistributorAssignment, (uda) => uda.distributor)
    assignments: UserDistributorAssignment[];

    @OneToMany(() => SalesChannelsReport, (r) => r.distributor)
    salesReports: SalesChannelsReport[];

    @OneToMany(() => PurchaseReport, (r) => r.distributor)
    purchaseReports: PurchaseReport[];
}
