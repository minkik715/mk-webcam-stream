import { Module } from '@nestjs/common';
import { MjpegController } from './mjpeg/mjpeg.controller.js';
import { MjpegService } from './mjpeg/mjpeg.service.js';
import { MediaGateway } from './h.254/MediaGateWay.js';

@Module({
  imports: [],
  controllers: [MjpegController],
  providers: [MjpegService, MediaGateway],
})
export class AppModule {}
