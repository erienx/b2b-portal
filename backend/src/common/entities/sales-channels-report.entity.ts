import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique, Index, OneToMany } from 'typeorm';
import { Distributor } from './distributor.entity';
import { User } from './user.entity';
import { SalesChannelsClient } from './sales-channels-client.entity';
import { SalesChannelsSkuReport } from './sales-channels-sku-report.entity';

@Entity('sales_channels_reports')
@Unique(['distributor', 'year', 'quarter'])
export class SalesChannelsReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Distributor, (d) => d.salesReports)
    distributor: Distributor;

    @Column()
    year: number;

    @Column()
    quarter: number;

    @Column({ length: 3 })
    currency: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    professional_sales: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    pharmacy_sales: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    ecommerce_b2c_sales: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    ecommerce_b2b_sales: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    third_party_sales: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    other_sales: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    total_sales: number;

    @Column({ default: 0 })
    new_clients: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    stock_level: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    total_sales_eur: number;

    @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
    currency_rate: number;

    @ManyToOne(() => User, { nullable: true })
    createdBy: User;

    @OneToMany(() => SalesChannelsClient, (c) => c.report, { cascade: true })
    clients: SalesChannelsClient[];

    @OneToMany(() => SalesChannelsSkuReport, (sku) => sku.report, { cascade: true })
    skuReports: SalesChannelsSkuReport[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
