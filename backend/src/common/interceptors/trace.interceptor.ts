import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    
    const requestId = randomUUID();
    request.headers['x-request-id'] = requestId;
    
    // Some frameworks might have different response objects, but standard Express has setHeader
    if (response && typeof response.setHeader === 'function') {
      response.setHeader('x-request-id', requestId);
    }
    
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;
    
    console.log(`[${requestId}] ${method} ${url} - Start`);

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`[${requestId}] ${method} ${url} - End (${duration}ms)`);
      }),
    );
  }
}
