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

  const isStory = task.type === 'STORY';

  return (
    <div
      className={`${getTicketColor(columnName)} rounded-xl p-3 w-full flex flex-col gap-2 cursor-pointer ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'opacity-100'
      } transition-opacity relative overflow-hidden`}
      onClick={handleClick}
      {...rest}
      style={{
        ...rest.style,
        ...(isStory
          ? {
              borderLeft: '4px solid #8b5cf6', // purple-500
            }
          : undefined),
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className={`text-sm ${isStory ? 'font-semibold' : ''}`}>
          {task.title}
        </h3>
        {isStory && (
          <Badge
            variant="soft"
            size="20"
            className="bg-purple-100 text-purple-700 shrink-0"
          >
            STORY
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-1">
        <Badge color={getMenuColors(columnName)} variant="soft" size={'20'}>
          <Bookmark className="w-3 h-3 mr-1" />
          {task.key}
        </Badge>

        <div className="flex -space-x-2.5">
          {assignees &&
            assignees.length > 0 &&
            assignees.map(assignee => (
              <Avatar
                size="24"
                className="border-bg hover:z-10"
                key={assignee.id || assignee.name}
              >
                {assignee.image && <AvatarImage src={assignee.image} />}
                <AvatarFallback>
                  {assignee.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
        </div>
      </div>
    </div>
  );
}
