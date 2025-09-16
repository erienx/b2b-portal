// src/media/media.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaFile } from '../common/entities/media-file.entity';
import { MediaCategory } from '../common/entities/media-category.entity';
import { ILike, Repository } from 'typeorm';
import { CreateMediaDto } from './dto/create-media.dto';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../common/entities/user.entity';
import archiver from 'archiver';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
    constructor(
        @InjectRepository(MediaFile)
        private readonly fileRepo: Repository<MediaFile>,
        @InjectRepository(MediaCategory)
        private readonly categoryRepo: Repository<MediaCategory>,
    ) { }

    async create(file: Express.Multer.File, dto: CreateMediaDto, user: User) {
        const media = new MediaFile();
        media.filename = file.filename;
        media.original_filename = file.originalname;
        media.storage_path = file.path;
        media.file_size = file.size;
        media.mime_type = file.mimetype;
        media.sku = dto.sku ?? null;
        media.tags = dto.tags || [];
        media.description = dto.description ?? null;
        media.uploadedBy = user;

        if (dto.categoryId) {
            const cat = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
            if (!cat) throw new NotFoundException('Category not found');
            media.category = cat;
        }

        return this.fileRepo.save(media);
    }

    async findAll(query: any) {
        const page = Number(query.page || 1);
        const limit = Number(query.limit || 25);
        const qb = this.fileRepo.createQueryBuilder('f')
            .leftJoinAndSelect('f.category', 'c')
            .leftJoinAndSelect('f.uploadedBy', 'u');

        if (query.sku) qb.andWhere('f.sku ILIKE :sku', { sku: `%${query.sku}%` });
        if (query.tag) qb.andWhere(':tag = ANY(f.tags)', { tag: query.tag });
        if (query.categoryId) qb.andWhere('c.id = :cid', { cid: query.categoryId });
        if (query.filename) qb.andWhere('f.original_filename ILIKE :fn', { fn: `%${query.filename}%` });

        if (query.sort) {
            const [col, dir] = query.sort.split(':');
            qb.orderBy(`f.${col}`, (dir?.toUpperCase() === 'DESC') ? 'DESC' : 'ASC');
        } else {
            qb.orderBy('f.created_at', 'DESC');
        }

        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit };
    }

    async findCategories() {
        return this.categoryRepo.find({ where: { is_active: true } });
    }

    async createCategory(data: { name: string; path: string; description?: string }) {
        const exists = await this.categoryRepo.findOne({ where: [{ name: data.name }, { path: data.path }] });
        if (exists) throw new Error('Category with same name or path exists');
        const cat = this.categoryRepo.create({ ...data });
        return this.categoryRepo.save(cat);
    }

    async searchBySku(sku: string) {
        if (!sku) return [];
        return this.fileRepo.find({
            where: { sku: ILike(`%${sku}%`) },
            relations: ['category'],
        });
    }

    async getFileStream(id: string) {
        const file = await this.fileRepo.findOne({ where: { id } });
        if (!file) return null;
        const exists = fs.existsSync(file.storage_path);
        if (!exists) throw new NotFoundException('Physical file missing');
        const stream = fs.createReadStream(file.storage_path);
        return { stream, original_filename: file.original_filename };
    }

    async createZipForIds(ids: string[]) {
        const archive = archiver('zip', { zlib: { level: 9 } });
        for (const id of ids) {
            const file = await this.fileRepo.findOne({ where: { id } });
            if (!file) continue;
            if (fs.existsSync(file.storage_path)) {
                archive.append(fs.createReadStream(file.storage_path), { name: file.original_filename });
            }
        }
        const passthrough = new (require('stream').PassThrough)();
        archive.pipe(passthrough);
        archive.finalize();
        return passthrough as Readable;
    }
}
