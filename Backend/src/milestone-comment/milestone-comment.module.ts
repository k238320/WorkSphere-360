import { Module } from '@nestjs/common';
import { MilestoneCommentService } from './milestone-comment.service';
import { MilestoneCommentController } from './milestone-comment.controller';

@Module({
  controllers: [MilestoneCommentController],
  providers: [MilestoneCommentService],
})
export class MilestoneCommentModule {}
