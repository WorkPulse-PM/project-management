import { getBoardColor, getRingColor } from '@/lib/colorUtils';
import type { BoardColumn } from '@/lib/types/projectTypes';
import { useDroppable } from '@dnd-kit/core';
import { useMemo } from 'react';
import { BoardTask } from './BoardTask';
import ColumnHeader from './ColumnHeader';
import type { TaskDetail } from './TaskDetailModal';

export function Column({
  column,
  taskAssigneesMap,
  onTaskClick,
  sortBy = 'default',
  filterByAssignee = 'all',
}: {
  column: BoardColumn;
  taskAssigneesMap: Map<string, TaskDetail['assignees']>;
  onTaskClick?: (taskId: string) => void;
  sortBy?: string;
  filterByAssignee?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  // Sort tasks based on sortBy option
  const sortedTasks = useMemo(() => {
    const tasks = [...column.tasks];

    if (sortBy === 'due-date-asc') {
      // Sort by due date ascending (earliest first)
      return tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1; // Tasks without due date go to the end
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'due-date-desc') {
      // Sort by due date descending (latest first)
      return tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1; // Tasks without due date go to the end
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      });
    }

    // Default: no sorting (original order)
    return tasks;
  }, [column.tasks, sortBy]);

  // Filter tasks based on assignee
  const filteredTasks = useMemo(() => {
    if (filterByAssignee === 'all') {
      return sortedTasks;
    }

    if (filterByAssignee === 'unassigned') {
      return sortedTasks.filter(task => {
        const assignees = taskAssigneesMap.get(task.id);
        return !assignees || assignees.length === 0;
      });
    }

    // Filter by specific assignee
    return sortedTasks.filter(task => {
      const assignees = taskAssigneesMap.get(task.id);
      return assignees?.some(assignee => assignee.id === filterByAssignee);
    });
  }, [sortedTasks, filterByAssignee, taskAssigneesMap]);

  return (
    <div
      ref={setNodeRef}
      className={`min-w-68 self-start rounded-xl flex flex-col gap-3 p-2 ${getBoardColor(column.name)} ${
        isOver ? `ring-2 ${getRingColor(column.name)}` : ''
      } transition-all`}
    >
      <ColumnHeader column={column} />
      <div className="flex flex-col gap-3">
        {filteredTasks.map(task => (
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
