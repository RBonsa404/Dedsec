import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
      {
        ttl: 3600000, // 1 hour
        limit: 100, // 100 requests per hour
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class CustomThrottlerModule {}