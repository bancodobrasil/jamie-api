// import { Catch, ExceptionFilter, Logger, ArgumentsHost, HttpStatus, HttpException } from "@nestjs/common";
// import { InjectMetric } from '@willsoto/nestjs-prometheus';
// import { Counter } from 'prom-client'
// import { BusinessException, ErrorDomain } from "./business.exception";
// import { Request, Response } from 'express';

// export interface ApiError {
//     id: string;
//     domain: ErrorDomain;
//     message: string;
//     timestamp: Date;
//   }

// @Catch(Error)
// export class CustomExecptionFilter implements ExceptionFilter {
//     private readonly logger = new Logger(CustomExecptionFilter.name);

//     constructor(
//         @InjectMetric('jamie_api_errors') private readonly counter: Counter<string>,
//     ){}

//     catch(exception: Error, host:ArgumentsHost) {
//         let error: BusinessException;
//         let status: HttpStatus;

//         if (exception instanceof BusinessException) {
//             // Straightforward handling of our own exceptions
//             error = exception;
//             status = exception.status;
//           } else if (exception instanceof HttpException) {
//             // We can extract internal message & status from NestJS errors
//             // Useful with class-validator
//             error = new BusinessException(
//                 ErrorDomain.Generic,

//             status = exception.getStatus();
//           } else {
//             // For all other exceptions simply return 500 error
//             body = new BusinessException(
//               'generic',
//               `Internal error occurred: ${exception.message}`,
//               'Internal error occurred',
//               HttpStatus.INTERNAL_SERVER_ERROR,
//             );
//             status = HttpStatus.INTERNAL_SERVER_ERROR;
//           }
      
//           const ctx = host.switchToHttp();
//           const response = ctx.getResponse<Response>();
//           const request = ctx.getRequest<Request>();
      
//           // Logs will contain an error identifier as well as
//           // request path where it has occurred
//           this.logger.error(
//             `Got an exception: ${JSON.stringify({
//               path: request.url,
//               ...body,
//             })}`,
//           );

//         this.counter.labels(
//             error.domain,
//             error.status.toString(),
//         ).inc();

//         response.status(status).json(error.toApiError());

//     }
// }