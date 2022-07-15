import { Injectable } from '@nestjs/common';
import { IDUtil } from './shared/utils/id.util';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

