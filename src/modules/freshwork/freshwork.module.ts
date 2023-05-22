import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FreshworkService } from './freshwork.service';
import { FreshworkController } from './freshwork.controller';

@Module({
  imports: [HttpModule],
  controllers: [FreshworkController],
  providers: [FreshworkService],
  exports: [FreshworkService],
})
export class FreshworkModule {}
