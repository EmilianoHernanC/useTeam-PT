import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  createdAt?: Date;
  updatedAt?: Date;

  columns?: Types.ObjectId[];
}

export const BoardSchema = SchemaFactory.createForClass(Board);

BoardSchema.virtual('columnsList', {
  ref: 'Column',
  localField: '_id',
  foreignField: 'boardId',
});
