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

  @Prop({ default: false })
  isFixed: boolean; // NUEVO: marca columnas que no se pueden eliminar

  createdAt?: Date;
  updatedAt?: Date;

  tasks?: Types.ObjectId[];
}

export const ColumnSchema = SchemaFactory.createForClass(Column);

ColumnSchema.virtual('tasksList', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'columnId',
});
