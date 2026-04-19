import { Injectable } from '@nestjs/common';
import { CreateProjectStatusDto } from './dto/create-project-status.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { replacePlaceholders, sendEmail } from 'src/utils/helper';

@Injectable()
export class ProjectStatusService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectStatusDto) {
    try {
      const result = await this.prisma.project_status.create({
        data: {
          porject_statuses_id: dto.porject_statuses_id,
          project_status_category_id: dto.project_status_category_id,
          comment: dto.comment,
          project_id: dto.project_id,
          user_id: dto.user_id,
          days_delayed: dto.days_delayed,
        },
      });

      // const project = await this.prisma.project.findFirst({
      //   where: { id: dto.project_id },
      // });

      // const replacements = {
      //   replaceHeader: 'System generated mail',
      //   replaceUserName: 'Dear PMO',
      //   message: `I hope this message finds you well. We would like to bring to your attention that the Project Manager has updated the project status for <a href = ${`https://portal.demoz.agency/project/create?uuid=${project.id}`}>${
      //     project.name
      //   }</a> in the portal. Your review and feedback on the project status are essential to ensure its alignment with the project's objectives and timelines.
      //   <br><br>
      //   Please take the time to carefully assess the updated project status and provide any necessary feedback or approval. Your insights and input will greatly contribute to the successful management and progression of the project.
      //   <br><br>
      //   Thank you for your valuable contribution to this process.

      //   `,
      // };

      // const template = replacePlaceholders(replacements);
      // try {
      //   const email = await sendEmail(
      //     'superadmin@yopmail.com',
      //     `Project Status Update for ${project.name}`,
      //     template,
      //   );
      // } catch (error) {
      //   return error?.message;
      // }

      return handleSuccessResponse(
        'Project Status Created Successfully',
        200,
        result,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(projectId: string) {
    try {
      const result = await this.prisma.project_status.findMany({
        where: { project_id: projectId },
        select: {
          id: true,
          created_at: true,
          project_statuses: { select: { id: true, name: true } },
          project_status_category: { select: { id: true, name: true } },
          // porject_statuses_id: true,
          // project_status_category_id: true,
          comment: true,
          user_id: true,
          days_delayed: true,
        },
      });

      return handleSuccessResponse('', 200, result);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  update(id: number, dto: UpdateProjectStatusDto) {
    return `This action updates a #${id} projectStatus`;
  }

  async remove(id: string) {
    try {
      const result = await this.prisma.project_status.delete({
        where: { id: id },
      });

      return handleSuccessResponse('', 200, 'Deleted Successfully');
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
