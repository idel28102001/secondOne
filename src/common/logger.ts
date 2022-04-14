
import { Logger, LoggerService } from '@nestjs/common';
import { createLog } from 'src/utils/folders';

export class MyLogger implements LoggerService {
  private readonly logger = new Logger(MyLogger.name);

  log(message: any, ...optionalParams: any[]) {
    createLog('log', message, optionalParams)
  }

  error(message: any, ...optionalParams: any[]) {
    createLog('error', message, optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    createLog('warn', message, optionalParams);
  }

  debug?(message: any, ...optionalParams: any[]) {
    createLog('debug', message, optionalParams);
  }

  verbose?(message: any, ...optionalParams: any[]) {
    createLog('verbose', message, optionalParams);
  }




}
