import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { MilestoneCommentService } from './milestone-comment.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('milestone-comments')
export class MilestoneCommentController {
  constructor(
    private readonly milestoneCommentService: MilestoneCommentService,
  ) {}

  @Post()
  async create(
    @Body() data: { milestone_id: string; comment: string },
    @Req() req: any,
  ) {
    return this.milestoneCommentService.createComment(data, req);
  }

  @Get(':milestone_id')
  async findAll(@Param('milestone_id') milestone_id: string) {
    return this.milestoneCommentService.getCommentsByMilestone(milestone_id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body('comment') comment: string) {
    return this.milestoneCommentService.updateComment(id, comment);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.milestoneCommentService.deleteComment(id);
  }

  @Get('getCommentsByProject/:projectId')
  async getCommentsByProject(@Param('projectId') projectId: string) {
    return this.milestoneCommentService.getCommentsByProject(projectId);
  }
}
