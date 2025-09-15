import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SalesChannelsReport } from './sales-channels-report.entity';

@Entity('client_reports')
export class ClientReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => SalesChannelsReport, report => report.clientReports, { onDelete: 'CASCADE' })
    salesReport: SalesChannelsReport;

    @Column({ length: 255 })
    client_name: string;

    @Column({ length: 50 })
    channel: string;

    @Column({ length: 255, nullable: true })
    location: string;

    @Column({ length: 255, nullable: true })
    contact_info: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}