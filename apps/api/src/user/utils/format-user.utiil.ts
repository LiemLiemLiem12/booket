import { User } from 'src/generated/prisma';

export const formatUser = (user: User) => {
  const { passwordHash, ...formattedUser } = user;
  return formattedUser;
};
