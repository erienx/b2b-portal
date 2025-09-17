import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Distributor } from 'src/common/entities/distributor.entity';
import { ExportManagerSubstitution } from 'src/common/entities/export-manager-substitution.entity';
import { UserActivityLog } from 'src/common/entities/user-activity-log.entity';
import { UserDistributorAssignment } from 'src/common/entities/user-distributor-assignment.entity';
import { User } from 'src/common/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Repository } from 'typeorm';
import { CreateDistributorDto } from './dto/create-distributor.dto';
import { UserAction } from 'src/common/enums/user-action.enum';
@Injectable()
export class DistributorsService {
    constructor(
        @InjectRepository(Distributor)
        private distributorRepository: Repository<Distributor>,
        @InjectRepository(ExportManagerSubstitution)
        private substitutionRepository: Repository<ExportManagerSubstitution>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserDistributorAssignment)
        private assignmentRepository: Repository<UserDistributorAssignment>,
        @InjectRepository(UserActivityLog)
        private activityLogRepository: Repository<UserActivityLog>,
    ) { }

    async getDistributorsForUser(user: User) {
        if (user.role === UserRole.DISTRIBUTOR) {
            return this.distributorRepository.find({
                where: {
                    assignments: {
                        user: { id: user.id }
                    }
                },
                relations: ['assignments', 'assignments.user', 'exportManager'],
            });
        }

        if (user.role === UserRole.EXPORT_MANAGER) {
            const directlyManaged = await this.distributorRepository.find({
                where: { exportManager: { id: user.id } },
                relations: ['exportManager'],
            });

            const today = new Date();
            const activeSubstitutions = await this.substitutionRepository.find({
                where: {
                    substitute: { id: user.id },
                    is_active: true,
                    start_date: today,
                    end_date: today,
                },
                relations: ['exportManager'],
            });

            let substitutedDistributors: Distributor[] = [];
            for (const substitution of activeSubstitutions) {
                const distrs = await this.distributorRepository.find({
                    where: { exportManager: { id: substitution.exportManager.id } },
                    relations: ['exportManager'],
                });
                substitutedDistributors.push(...distrs);
            }

            const allDistributors = [...directlyManaged, ...substitutedDistributors];
            const uniqueDistributors = allDistributors.filter((dist, index, self) =>
                index === self.findIndex(d => d.id === dist.id)
            );

            return uniqueDistributors;
        }

        if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
            return this.distributorRepository.find({
                relations: ['exportManager'],
            });
        }

        return [];
    }

    async create(createDistributorDto: CreateDistributorDto, creatorId: string): Promise<Distributor> {
        const { company_name, country, currency, exportManagerId, assignedUsers } = createDistributorDto;

        const existingDistributor = await this.distributorRepository.findOne({
            where: { company_name: company_name.trim() },
        });

        if (existingDistributor) {
            throw new ConflictException('Distributor with this company name already exists');
        }

        let exportManager: User | undefined;
        if (exportManagerId) {
            exportManager = (await this.userRepository.findOne({
                where: { id: exportManagerId, role: UserRole.EXPORT_MANAGER },
            })) ?? undefined;

            if (!exportManager) {
                throw new NotFoundException('Export manager not found');
            }
        }
        const distributor = this.distributorRepository.create({
            company_name: company_name.trim(),
            country: country.toUpperCase(),
            currency: currency.toUpperCase(),
            exportManager,
        });

        const savedDistributor = await this.distributorRepository.save(distributor);

        if (assignedUsers && assignedUsers.length > 0) {
            for (const userId of assignedUsers) {
                const user = await this.userRepository.findOne({
                    where: { id: userId },
                });

                if (user) {
                    const assignment = this.assignmentRepository.create({
                        distributor: savedDistributor,
                        user,
                    });
                    await this.assignmentRepository.save(assignment);
                }
            }
        }

        await this.logUserActivity(
            creatorId,
            UserAction.LOGIN,
            `Created distributor: ${savedDistributor.company_name}`,
        );

        return (await this.distributorRepository.findOne({
            where: { id: savedDistributor.id },
            relations: ['exportManager', 'assignments', 'assignments.user'],
        }))!;
    }

    async getExportManagers(): Promise<User[]> {
        return this.userRepository.find({
            where: {
                role: UserRole.EXPORT_MANAGER,
                is_active: true
            },
            select: ['id', 'first_name', 'last_name', 'email'],
        });
    }

    private async logUserActivity(
        userId: string,
        action: UserAction,
        details: Record<string, any> | string,
    ): Promise<void> {
        const log = this.activityLogRepository.create({
            user: { id: userId } as User,
            action,
            details: typeof details === 'string' ? { message: details } : details,
        });

        await this.activityLogRepository.save(log);
    }
}