// apps/api/src/app/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../entities/organization.entity';
import { UsersModule } from '../users/users.module';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization]), UsersModule],
  providers: [SeedService],
})
export class SeedModule {}
