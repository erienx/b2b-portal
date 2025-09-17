import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body, Get, Query, StreamableFile, Param, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../common/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import type { Response } from 'express';

@Controller('media')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER, UserRole.DISTRIBUTOR, UserRole.EMPLOYEE)
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateMediaDto,
        @GetUser() user: User,
    ) {
        if (!file) throw new BadRequestException('File is required');
        return this.mediaService.create(file, dto, user);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER, UserRole.DISTRIBUTOR, UserRole.EMPLOYEE)
    async list(@Query() query: any) {
        return this.mediaService.findAll(query);
    }

    @Get('categories')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER, UserRole.DISTRIBUTOR, UserRole.EMPLOYEE)
    async categories() {
        return this.mediaService.findCategories();
    }

    @Post('categories')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER, UserRole.DISTRIBUTOR, UserRole.EMPLOYEE)
    async createCategory(@Body() body: { name: string; path: string; description?: string }) {
        return this.mediaService.createCategory(body);
    }

    @Get('search/sku')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER, UserRole.DISTRIBUTOR, UserRole.EMPLOYEE)
    async searchBySku(@Query('sku') sku: string) {
        return this.mediaService.searchBySku(sku);
    }

    @Get(':id/download')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER, UserRole.DISTRIBUTOR, UserRole.EMPLOYEE)
    async download(@Param('id') id: string, @Res() res: Response) {
        const file = await this.mediaService.getFileStream(id);
        if (!file) throw new NotFoundException('File not found');
        res.set({ 'Content-Disposition': `attachment; filename="${file.original_filename}"`, });
        file.stream.pipe(res);
    }

    @Get('download-multiple')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EXPORT_MANAGER, UserRole.DISTRIBUTOR, UserRole.EMPLOYEE)
    async downloadMultiple(@Query('ids') ids: string, @Res() res: Response) {
        if (!ids) throw new BadRequestException('ids query param required');
        const idArray = ids.split(',');
        const zipStream = await this.mediaService.createZipForIds(idArray);
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="media_files.zip"',
        });
        zipStream.pipe(res);
    }
}
