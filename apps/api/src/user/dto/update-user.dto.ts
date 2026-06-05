import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto implements Partial<CreateUserDto> {
  email?: string;
  password?: string;
  role?: string;
  status?: string;
  companyName?: string;
  phone?: string;
  kycStatus?: string;
}
