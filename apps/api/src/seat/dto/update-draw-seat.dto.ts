import { IsOptional, IsUUID, IsInt, IsString } from 'class-validator';
import { CreateDrawSeatDto } from './create-draw-seat.dto';

export class UpdateDrawSeatDto implements Partial<CreateDrawSeatDto> {
  @IsUUID('4', { message: 'seatId phải là định dạng UUID' })
  @IsOptional()
  seatId?: string;

  @IsInt({ message: 'xCoord phải là một số nguyên' })
  @IsOptional()
  xCoord?: number;

  @IsInt({ message: 'yCoord phải là một số nguyên' })
  @IsOptional()
  yCoord?: number;

  @IsString({ message: 'color phải là một chuỗi ký tự' })
  @IsOptional()
  color?: string;

  @IsString({ message: 'label phải là một chuỗi ký tự' })
  @IsOptional()
  label?: string;
}
