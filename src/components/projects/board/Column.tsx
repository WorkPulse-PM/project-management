import { getBoardColor, getRingColor } from '@/lib/colorUtils';
import type { BoardColumn } from '@/lib/types/projectTypes';
import { useDroppable } from '@dnd-kit/core';
import { BoardTask } from './BoardTask';
import ColumnHeader from './ColumnHeader';

export function Column({ column }: { column: BoardColumn }) {
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
          <BoardTask key={task.id} task={task} columnName={column.name} />
        ))}
      </div>
    </div>
  );
}
