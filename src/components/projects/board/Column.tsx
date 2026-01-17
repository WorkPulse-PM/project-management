import { getBoardColor, getRingColor } from '@/lib/colorUtils';
import type { BoardColumn } from '@/lib/types/projectTypes';
import { useDroppable } from '@dnd-kit/core';
import { BoardTask } from './BoardTask';
import ColumnHeader from './ColumnHeader';
import type { TaskDetail } from './TaskDetailModal';

export function Column({
  column,
  taskAssigneesMap,
  onTaskClick,
}: {
  column: BoardColumn;
  taskAssigneesMap: Map<string, TaskDetail['assignees']>;
  onTaskClick?: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-68 self-start rounded-xl flex flex-col gap-3 p-2 ${getBoardColor(column.name)} ${
        isOver ? `ring-2 ${getRingColor(column.name)}` : ''
      } transition-all`}
    >
      <ColumnHeader column={column} />
      <div className="flex flex-col gap-3">
        {column.tasks.map(task => (
          <BoardTask
            key={task.id}
            task={task}
            columnName={column.name}
            assignees={taskAssigneesMap.get(task.id)}
            onClick={() => onTaskClick?.(task.id)}
          />
        ))}
      </div>
    </div>
  );
}
