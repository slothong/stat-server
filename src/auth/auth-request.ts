import { User } from '@/users/user.entity';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: User;
}
