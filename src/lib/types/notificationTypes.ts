import type { TaskDetail } from '@/components/projects/board/TaskDetailModal';
import type { User } from 'better-auth';
import type { Project } from './projectTypes';

export const NotificationType = {
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_UNASSIGNED: 'TASK_UNASSIGNED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_DUE_DATE_CHANGED: 'TASK_DUE_DATE_CHANGED',
  TASK_COMMENT_ADDED: 'TASK_COMMENT_ADDED',
  TASK_MOVED: 'TASK_MOVED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  MEMBER_ADDED: 'MEMBER_ADDED',
  PROJECT_INVITATION_RECEIVED: 'PROJECT_INVITATION_RECEIVED',
  PROJECT_INVITATION_ACCEPTED: 'PROJECT_INVITATION_ACCEPTED',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationStatus = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
} as const;

export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationEntity = {
  PROJECT: 'PROJECT',
  COLUMN: 'COLUMN',
  TASK: 'TASK',
  USER: 'USER',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationEntity =
  (typeof NotificationEntity)[keyof typeof NotificationEntity];

export interface Notification {
  id: string;
  type: NotificationType;
  entity: NotificationEntity;
  task: Pick<TaskDetail, 'id' | 'title' | 'key'> | null;
  project: Pick<Project, 'id' | 'name' | 'image'> | null;
  payload: Record<string, unknown>;
  actor?: Pick<User, 'id' | 'name' | 'image'> | null;
  createdAt: Date;
  status: NotificationStatus;
}

export type NotificationsResponse = {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
