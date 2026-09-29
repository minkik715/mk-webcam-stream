import { Module } from '@nestjs/common';
import { MjpegController } from './mjpeg/mjpeg.controller.js';
import { MjpegService } from './mjpeg/mjpeg.service.js';

@Module({
  imports: [],
  controllers: [MjpegController],
  providers: [MjpegService],
})
export class AppModule {}
