import type { Notification } from '@/lib/types/notificationTypes';
import { formatDate } from 'date-fns';

export default function NotificationMessage({
  notification,
}: {
  notification: Notification;
}) {
  const { type, payload, actor, task, project } = notification;

  switch (type) {
    case 'TASK_ASSIGNED':
      return (
        <>
          {actor?.name} assigned you to <b>{task?.title}</b>
        </>
      );
    case 'TASK_UNASSIGNED':
      return (
        <>
          {actor?.name} unassigned you from <b>{task?.title}</b>
        </>
      );
    //   case 'TASK_COMMENT_ADDED':
    //     return `${actor?.name} commented on "${task?.title}": ${payload.commentPreview}`;
    //   case 'PROJECT_INVITATION_RECEIVED':
    //     return `${actor?.name} invited you to join "${payload.projectName}"`;
    case 'TASK_STATUS_CHANGED':
      return (
        <>
          {actor?.name} changed the status of <b>{task?.title}</b>.
        </>
      );
    case 'TASK_DUE_DATE_CHANGED':
      const oldDate = payload?.old
        ? formatDate(payload.old as string, 'MMM d, yyyy')
        : null;
      const newDate = payload?.new
        ? formatDate(payload.new as string, 'MMM d, yyyy')
        : null;

      if (oldDate && !newDate) {
        return (
          <>
            {actor?.name} removed the due date of <b>{task?.title}</b>.
          </>
        );
      }
      return (
        <>
          {actor?.name} changed the due date of <b>{task?.title}</b>
          {oldDate ? ` from ${oldDate}` : ''} to {newDate || 'no due date'}.
        </>
      );
    case 'TASK_UPDATED':
      return (
        <>
          {actor?.name} updated the {payload.field} for <b>{task?.title}</b>.
        </>
      );
    case 'PROJECT_INVITATION_RECEIVED':
      return (
        <>
          {actor?.name} invited you to join <b>{project?.name}</b>.
        </>
      );

    //   case 'MEMBER_ADDED':
    //     return `${payload.memberName} joined "${payload.projectName}"`;
    //   case 'TASK_CREATED':
    //     return `${payload.createdBy} created "${task?.title}" in ${payload.projectName}`;
    //   case 'SYSTEM':
    //     return payload.message as string;
    default:
      return 'You have a new notification';
  }
}
