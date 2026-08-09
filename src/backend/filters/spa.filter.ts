import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException } from '@nestjs/common';
import { Response, Request } from 'express';
import path from 'path';

@Catch(NotFoundException)
export class SpaExceptionFilter implements ExceptionFilter {
  constructor(private readonly vite: any) {}

  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const url = request.url;

    // If it's an API request, let NestJS send the normal 404
    if (url.startsWith('/api/')) {
      const status = exception.getStatus();
      response.status(status).json(exception.getResponse());
      return;
    }

    // Otherwise, it's a SPA or static file route
    if (process.env.NODE_ENV !== 'production' && this.vite) {
      // Delegate to Vite dev server middleware
      this.vite.middlewares(request, response, (err?: any) => {
        if (err) {
          response.status(500).send(err.message);
        }
      });
    } else {
      // In production, serve the compiled index.html
      const distPath = path.join(process.cwd(), 'dist');
      response.sendFile(path.join(distPath, 'index.html'));
    }
  }
}
