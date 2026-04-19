import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ForbiddenException } from '@nestjs/common'; // Replace 'your-error-library' with the actual library you're using for exceptions

export function handlePrismaError(error: Error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ForbiddenException('already registered!');
    }
  }
  throw error;
}
