import { Controller, Get } from '@nestjs/common';
import { ProjectAutomationService } from './project-automation.service';

@Controller('project-automation')
export class ProjectAutomationController {
  constructor(
    private readonly projectAutomationService: ProjectAutomationService,
  ) {}

  @Get('check-status')
  async triggerStatusCheck(): Promise<{ message: string }> {
    await this.projectAutomationService.checkProjectStatusUpdates();
    return { message: 'Status check executed successfully' };
  }

  @Get('clone')
  async cloneUserPermissions() {
    await this.projectAutomationService.clonePermissionsIfNotExist();
    return { message: 'Permissions cloned if not already existing.' };
  }

  @Get('taskPermissions')
  async taskPermissions() {
    await this.projectAutomationService.taskPermissions();
    return { message: 'Permissions cloned if not already existing.' };
  }

  @Get('clonePermissionsFromDepartment')
  async clonePermissionsFromDepartment() {
    await this.projectAutomationService.clonePermissionsFromDepartment();
    return { message: 'Permissions cloned if not already existing.' };
  }
}
