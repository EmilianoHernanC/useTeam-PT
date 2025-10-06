import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
