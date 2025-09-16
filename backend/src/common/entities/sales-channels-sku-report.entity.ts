import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique, Index, OneToMany } from 'typeorm';
import { SalesChannelsReport } from './sales-channels-report.entity';

@Entity('sales_channels_sku_reports')
@Unique(['report', 'sku', 'month'])
export class SalesChannelsSkuReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => SalesChannelsReport, (r) => r.skuReports, { onDelete: 'CASCADE' })
    report: SalesChannelsReport;

    @Column({ length: 50 })
    sku: string;

    @Column()
    month: number; // 1–12

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    sales_value: number;

    @Column({ type: 'int' })
    sales_quantity: number;
}
