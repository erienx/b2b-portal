import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        console.log('Caught exception:', exception);

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Something went wrong';

        if (exception instanceof HttpException) {
            console.log('Exception response:', exception.getResponse());
            status = exception.getStatus();
            const res = exception.getResponse() as any;

            if (typeof res === 'object' && res !== null) {
                if (Array.isArray(res.message)) {
                    message = res.message[0];
                } else if (typeof res.message === 'string') {
                    message = res.message;
                } else if (typeof res.error === 'string') {
                    message = res.error;
                }
            }
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
        });
    }
}
