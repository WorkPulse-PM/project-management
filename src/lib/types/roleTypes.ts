import type { Permission } from './permissionTypes';

export type Role = {
  id: string;
  name: string;
  description?: string; // TODO
  usersCount?: number;

  permissions?: Permission[];

  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};
