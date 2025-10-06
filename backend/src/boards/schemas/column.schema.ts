import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ColumnDocument = Column & Document<Types.ObjectId>;

@Schema({ timestamps: true })
export class Column {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  position: number;

  tasks?: Types.ObjectId[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);

ColumnSchema.virtual('tasksList', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'columnId',
});
