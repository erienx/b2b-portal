import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { MediaCategory } from './media-category.entity';
import { User } from './user.entity';

@Entity('media_files')
export class MediaFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    filename: string;

    @Column({ length: 255 })
    original_filename: string;

    @Column({ length: 500 })
    storage_path: string;

    @Column({ type: 'bigint' })
    file_size: number;

    @Column({ length: 100 })
    mime_type: string;

    @ManyToOne(() => MediaCategory, (c) => c.files, { nullable: true })
    @Index()
    category: MediaCategory;

    @Column({ length: 50, nullable: true })
    @Index()
    sku: string;

    @Column('text', { array: true, nullable: true })
    tags: string[];

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: true })
    is_active: boolean;

    @ManyToOne(() => User, (u) => u.uploadedFiles, { nullable: true })
    uploadedBy: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
