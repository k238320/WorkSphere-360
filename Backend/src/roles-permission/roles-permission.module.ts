import { Module } from '@nestjs/common';
import { RolesPermissionService } from './roles-permission.service';
import { RolesPermissionController } from './roles-permission.controller';

@Module({
  controllers: [RolesPermissionController],
  providers: [RolesPermissionService]
})
export class RolesPermissionModule {}
