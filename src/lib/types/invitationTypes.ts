export type Invitation = {
  id: string;
  token: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: string | null;
  requiresRegistration: boolean;
  project: {
    name: string;
  };
  invitedByUser: {
    id: string;
    name: string;
  };
};
