import type { Role } from './roleTypes';

export type MemberDetails = {
  id: string;
  name: string;
  image: string;
  email: string;
};

export type Member = {
  user: MemberDetails;
  createdAt: string;
  id: string;
  inviteByUser: Omit<MemberDetails, 'email'>;
  role: Role;
};
