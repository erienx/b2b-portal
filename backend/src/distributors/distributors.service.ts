import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Distributor } from 'src/common/entities/distributor.entity';
import { ExportManagerSubstitution } from 'src/common/entities/export-manager-substitution.entity';
import { User } from 'src/common/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Repository } from 'typeorm';

@Injectable()
export class DistributorsService {
    constructor(
        @InjectRepository(Distributor)
        private distributorRepository: Repository<Distributor>,
        @InjectRepository(ExportManagerSubstitution)
        private substitutionRepository: Repository<ExportManagerSubstitution>,
    ) { }

     async getDistributorsForUser(user: User) {
        if (user.role === UserRole.DISTRIBUTOR) {
            return this.distributorRepository.find({
                where: {
                    assignments: {
                        user: { id: user.id }
                    }
                },
                relations: ['assignments', 'assignments.user'],
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
}