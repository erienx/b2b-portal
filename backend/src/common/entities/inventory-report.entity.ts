import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SalesChannelsReport } from './sales-channels-report.entity';

@Entity('inventory_reports')
export class InventoryReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => SalesChannelsReport, report => report.inventoryReports, { onDelete: 'CASCADE' })
    salesReport: SalesChannelsReport;

    @Column({ length: 50 })
    sku: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    stock_quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    reserved_quantity: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}