import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDTO {
  @IsNotEmpty()
  @IsEmail()
  @Transform((o) => o.value.toLowerCase())
  email: string;

  @IsNotEmpty()
  password: string;
}
