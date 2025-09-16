import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Distributor } from 'src/common/entities/distributor.entity';
import { User } from 'src/common/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { Repository } from 'typeorm';

@Injectable()
export class DistributorsService {
  constructor(
    @InjectRepository(Distributor)
    private readonly distributorRepo: Repository<Distributor>,
  ) {}

  async getDistributorsForUser(user: User) {
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
      return { distributors: await this.distributorRepo.find({ where: { is_active: true } }) };
    }

    if (user.role === UserRole.EXPORT_MANAGER) {
      return {
        distributors: await this.distributorRepo.find({
          where: { exportManager: { id: user.id }, is_active: true },
        }),
      };
    }

    return {
      distributors: await this.distributorRepo
        .createQueryBuilder('d')
        .innerJoin('d.assignments', 'a')
        .innerJoin('a.user', 'u', 'u.id = :userId', { userId: user.id })
        .where('d.is_active = true')
        .getMany(),
    };
  }
}
