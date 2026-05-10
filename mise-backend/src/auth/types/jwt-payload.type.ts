import type { UserRole } from '../../shared/enums/user-role.enum';

export type JwtPayload = {
  sub: string;
  restaurantId: string;
  role: UserRole;
  email: string;
};
