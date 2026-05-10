import { IsString, IsNotEmpty } from 'class-validator';

export class OpenSessionDto {
  @IsString()
  @IsNotEmpty()
  qrToken: string;
}
