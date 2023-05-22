import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FilterDocument = Filter & Document;

@Schema()
export class Filter {
  @Prop()
  attribute: string;

  @Prop()
  emptyValue: string;

  @Prop()
  type: string;

  @Prop()
  name: string;

  @Prop()
  operator: [string];

  @Prop()
  value: [object];

  @Prop()
  tableName: string;
}

export const FilterSchema = SchemaFactory.createForClass(Filter);
