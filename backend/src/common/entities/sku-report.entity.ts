import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SalesChannelsReport } from './sales-channels-report.entity';

@Entity('sku_reports')
export class SkuReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => SalesChannelsReport, report => report.skuReports, { onDelete: 'CASCADE' })
    salesReport: SalesChannelsReport;

    @Column({ length: 50 })
    sku: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    quantity: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    value: number;

    @Column({ length: 50, nullable: true })
    channel: string;

    @Column()
    month: number; // 1-12

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}