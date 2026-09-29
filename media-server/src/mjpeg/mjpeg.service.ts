import { Injectable } from '@nestjs/common';

@Injectable()
export class MjpegService {
  getHello(): string {
    return 'Hello World!';
  }
}
