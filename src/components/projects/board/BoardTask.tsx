import AvatarGroup from '@/components/ui/avatar-group';
import { Badge } from '@/components/ui/badge';
import { getMenuColors, getTicketColor } from '@/lib/colorUtils';
import type { BoardTask } from '@/lib/types/projectTypes';
import { useDraggable } from '@dnd-kit/core';
import { Bookmark } from 'lucide-react';
import type { TaskDetail } from './TaskDetailModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function BoardTask({
  task,
  columnName,
  assignees,
  onClick,
}: {
  task: BoardTask;
  columnName: string;
  assignees?: TaskDetail['assignees'];
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <BoardTaskBase
      isDragging={isDragging}
      task={task}
      columnName={columnName}
      assignees={assignees}
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
    />
  );
}

type BoardTaskBaseProps = {
  task: BoardTask;
  columnName: string;
  assignees?: TaskDetail['assignees'];
  isDragging: boolean;
  onClick?: () => void;
} & Record<string, any>;

export function BoardTaskBase(props: BoardTaskBaseProps) {
  const { task, columnName, assignees, isDragging, onClick, ...rest } = props;
  console.log(assignees);
  // Handle click - dnd-kit should allow clicks when not dragging
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if we're currently dragging
    if (isDragging) return;

    // Stop propagation to avoid conflicts
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      className={`${getTicketColor(columnName)} rounded-xl p-3 w-full flex flex-col gap-2 cursor-pointer ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'opacity-100'
      } transition-opacity`}
      onClick={handleClick}
      {...rest}
    >
      <h3 className="text-sm">{task.title}</h3>

      <div className="flex items-center justify-between gap-2">
        <Badge color={getMenuColors(columnName)} variant="soft" size={'20'}>
          <Bookmark />
          {task.key}
        </Badge>

        <div className="flex  -space-x-2.5">
          {assignees &&
            assignees.length > 0 &&
            assignees.map(assignee => (
              <Avatar
                size="24"
                className="border-bg  hover:z-10"
                key={assignee.name}
              >
                {assignee.image && <AvatarImage src={assignee.image} />}
              </Avatar>
            ))}
        </div>
      </div>
    </div>
  );
}
