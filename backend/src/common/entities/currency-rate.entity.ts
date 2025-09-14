import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique, Index } from 'typeorm';

@Entity('currency_rates')
@Unique(['currency_code', 'rate_date'])
export class CurrencyRate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 3 })
    @Index()
    currency_code: string;

    @Column({ type: 'date' })
    rate_date: Date;

    @Column({ type: 'decimal', precision: 10, scale: 4 })
    rate_to_eur: number;

    @Column({ length: 50, default: 'NBP' })
    source: string;

    @CreateDateColumn()
    created_at: Date;
}
