import { Controller, Post, Body } from '@nestjs/common';
import axios from 'axios';
import Redis from 'ioredis';

const redis = new Redis({ host: 'redis', port: 6379 });

@Controller()
export class AppController {

  @Post('event')
  async handleEvent(@Body() event: any) {
    try {
      await axios.post('http://external-system:3003/webhook', event);
      return { status: 'delivered' };
    } catch (error) {
      await redis.lpush('retry_queue', JSON.stringify(event));
      return { status: 'queued_for_retry' };
    }
  }
}