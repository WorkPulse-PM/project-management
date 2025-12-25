export type Invitation = {
  id: string;
  projectId: string;
  email: string;
  token: string;
  roleId: string;
  status: InvitationStatus;
  userId: string;
  invitedBy: string;
  revokedBy: string;
  expiresAt: string | null;
  requiresRegistration: boolean;
  project: {
    name: string;
  };
  role: {
    name: string;
  };
  invitedByUser: {
    id: string;
    name: string;
    image: string;
  };
  revokedByUser: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
};

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}
