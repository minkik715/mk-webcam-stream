import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  private latestFrame: Buffer | null = null;

  private readonly clients = new Set<Response>();

  @Post('frame')
  receiveFrame(@Body() frame: Buffer, @Res() res: Response) {
    this.latestFrame = frame;

    console.log(`Received frame: ${frame.length} bytes`);

    this.broadcastFrame();

    res.sendStatus(200);
  }

  @Get('stream')
  stream(@Res() res: Response){
    res.writeHead(200, {
      'Content-Type':
        'multipart/x-mixed-replace; boundary=frame',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      Pragma: 'no-cache',
    });

    this.clients.add(res);
    console.log(`Client connected: ${this.clients.size}`);

    if(this.latestFrame){
      this.writeFrame(res, this.latestFrame);
    }

    res.on('close', () => {
      this.clients.delete(res);

      console.log(`Client disconnected: ${this.clients.size}`)
    });
  }

  private broadcastFrame() {
      if(!this.latestFrame){
        return;
      }

      for(const client of this.clients){
        this.writeFrame(client, this.latestFrame);
      }
  }

  private writeFrame(
    res: Response,
    frame: Buffer
  ){
    res.write(
      `--frame\r\n` +
      `Content-Type: image/jpeg\r\n` +
      `Content-Length: ${frame.length}\r\n` +
      `\r\n`,
    );

    res.write(frame);
    res.write(`\r\n`)
  }


}
