import { Badge } from '@/components/ui/badge';
import { getMenuColors, getTicketColor } from '@/lib/colorUtils';
import type { BoardTask } from '@/lib/types/projectTypes';
import { useDraggable } from '@dnd-kit/core';
import { Bookmark } from 'lucide-react';

export function BoardTask({
  task,
  columnName,
}: {
  task: BoardTask;
  columnName: string;
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
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    />
  );
}

type BoardTaskBaseProps = {
  task: BoardTask;
  columnName: string;
  isDragging: boolean;
} & Record<string, any>;

export function BoardTaskBase(props: BoardTaskBaseProps) {
  const { task, columnName, isDragging, ...rest } = props;
  return (
    <div
      className={`${getTicketColor(columnName)} rounded-xl p-3 w-full flex flex-col gap-1 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } transition-opacity`}
      {...rest}
    >
      <h3 className="text-sm mb-2">{task.title}</h3>
      <Badge color={getMenuColors(columnName)} variant="soft" size={'20'}>
        <Bookmark />
        {task.key}
      </Badge>
    </div>
  );
}
