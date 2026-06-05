import { IsNotEmpty, IsUUID, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateDrawSeatDto {
  @IsUUID('4', { message: 'seatId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'seatId không được để trống' })
  seatId!: string;

  @IsInt({ message: 'xCoord phải là một số nguyên' })
  @IsNotEmpty({ message: 'xCoord không được để trống' })
  xCoord!: number;

  @IsInt({ message: 'yCoord phải là một số nguyên' })
  @IsNotEmpty({ message: 'yCoord không được để trống' })
  yCoord!: number;

  @IsString({ message: 'color phải là một chuỗi ký tự' })
  @IsOptional()
  color?: string;

  @IsString({ message: 'label phải là một chuỗi ký tự' })
  @IsOptional()
  label?: string;
}
