import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SalesChannelsReport } from "./sales-channels-report.entity";

@Entity('sales_channels_clients')
export class SalesChannelsClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SalesChannelsReport, (r) => r.clients, { onDelete: 'CASCADE' })
  report: SalesChannelsReport;

  @Column()
  channel: string; // Professional / Pharmacy / Ecommerce B2C / Ecommerce B2B / Third party / Other

  @Column()
  client_name: string;
}
