import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilterDocument } from 'src/schema/filter.schema';

@Injectable()
export class FilterService {
  constructor(
    @InjectModel('filter')
    private readonly filterModel: Model<FilterDocument>,
  ) {}

  async findAll(): Promise<FilterDocument[]> {
    return this.filterModel.find().exec();
  }
}
