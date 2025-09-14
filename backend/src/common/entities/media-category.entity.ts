import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, } from 'typeorm';
import { MediaFile } from './media-file.entity';

@Entity('media_categories')
export class MediaCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ length: 255, unique: true })
    path: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => MediaFile, (file) => file.category)
    files: MediaFile[];
}
