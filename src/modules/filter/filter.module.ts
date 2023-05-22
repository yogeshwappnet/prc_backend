import { Module } from '@nestjs/common';
import { FilterController } from './filter.controller';
import { FilterService } from './filter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FilterSchema } from 'src/schema/filter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'filter',
        schema: FilterSchema,
      },
    ]),
  ],
  controllers: [FilterController],
  providers: [FilterService],
})
export class FilterModule {}
