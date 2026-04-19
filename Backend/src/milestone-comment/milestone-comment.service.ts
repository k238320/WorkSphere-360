import { Injectable, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';

@Injectable()
export class MilestoneCommentService {
  constructor(private prisma: PrismaService) {}

  async createComment(data: { milestone_id: string; comment: string }, req) {
    const user_id = req?.user?.id;
    try {
      const comment = await this.prisma.milestone_comment.create({
        data: {
          milestone_id: data.milestone_id,
          user_id: user_id,
          comment: data.comment,
        },
      });

      return handleSuccessResponse(
        'Comment added successfully',
        HttpStatus.CREATED,
        comment,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getCommentsByMilestone(milestone_id: string) {
    try {
      const comments = await this.prisma.milestone_comment.findMany({
        where: { milestone_id },
      });
      return handleSuccessResponse(
        'Comments retrieved successfully',
        HttpStatus.OK,
        comments,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateComment(id: string, comment: string) {
    try {
      const updatedComment = await this.prisma.milestone_comment.update({
        where: { id },
        data: { comment },
      });
      return handleSuccessResponse(
        'Comment updated successfully',
        HttpStatus.OK,
        updatedComment,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deleteComment(id: string) {
    try {
      await this.prisma.milestone_comment.delete({ where: { id } });
      return handleSuccessResponse(
        'Comment deleted successfully',
        HttpStatus.OK,
        true,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getCommentsByProject(projectId: string) {
    try {
      const comments = await this.prisma.milestone_comment.findMany({
        where: {
          milestone: {
            project_id: projectId,
          },
        },
        include: {
          milestone: {
            include: {
              milestone_phase: true,
            },
          },
        },
      });
      return handleSuccessResponse(
        'Comments retrieved successfully',
        HttpStatus.OK,
        comments,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
