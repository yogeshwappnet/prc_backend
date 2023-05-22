import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      return null;
    } else {
      const validPassword = await bcrypt.compare(pass, user.password);

      if (!validPassword) {
        throw new UnauthorizedException();
      }
      return user;
    }
  }
}
