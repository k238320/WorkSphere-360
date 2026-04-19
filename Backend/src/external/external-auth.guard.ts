import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ExternalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const token = req.headers['x-external-token'];

    if (!token || token !== process.env.EXTERNAL_API_TOKEN) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    return true;
  }
}
