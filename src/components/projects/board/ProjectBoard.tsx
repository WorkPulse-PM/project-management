import { Column } from '@/components/projects/board/Column';
import BoardColumnsSkeleton from '@/components/skeletons/BoardColumnsSkeleton';
import { apiBase } from '@/lib/api';
import type { BoardColumn } from '@/lib/types/projectTypes';
import { DragOverlay } from '@dnd-kit/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BoardTaskBase } from './BoardTask';
import DndProvider from './DndProvider';
import { TaskDetailModal, type TaskDetail } from './TaskDetailModal';

export default function ProjectBoard() {
  const { projectId } = useParams();
  const [sortBy] = useQueryState('sort');
  const [filterByAssignee] = useQueryState('assignee');

  const queryClient = useQueryClient();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useQueryState('task');

  const { data: board, isPending: isLoadingBoard } = useQuery({
    enabled: !!projectId,
    select: res => res.data,
    queryKey: ['projects', projectId, 'board'],
    queryFn: async () => {
      const data = await apiBase.get<BoardColumn[]>(
        `/projects/${projectId}/board`
      );
      return data;
    },
  });

  // Fetch details for selected task ONLY
  const { data: selectedTask, isLoading: isLoadingSelectedTask } = useQuery({
    queryKey: ['tasks', projectId, selectedTaskId],
    queryFn: async () => {
      if (!projectId || !selectedTaskId) return null;
      const response = await apiBase.get<TaskDetail>(
        `/projects/${projectId}/tasks/${selectedTaskId}`
      );
      return response.data;
    },
    enabled: !!projectId && !!selectedTaskId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Mutation to update task status
  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      newColumnId,
    }: {
      taskId: string;
      newColumnId: string;
    }) => {
      return await apiBase.patch(`/projects/${projectId}/tasks/${taskId}`, {
        columnId: newColumnId,
      });
    },
    onSuccess: () => {
      // Refetch board data after successful update
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'board'],
      });
    },
    onError: error => {
      console.error('Failed to update task:', error);
      // Rollback optimistic update on error
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'board'],
      });
    },
  });

  const afterDragEnd = ({
    taskId,
    newColumnId,
  }: {
    taskId: string;
    newColumnId: string;
  }) => {
    // Find the task's current column
    const currentColumn = board?.find(col =>
      col.tasks.some(task => task.id === taskId)
    );

    // If dropped in the same column, do nothing
    if (currentColumn?.id === newColumnId) return;

    // Optimistic update
    queryClient.setQueryData(['projects', projectId, 'board'], (old: any) => {
      if (!old?.data) return old;

      const newBoard = old.data.map(col => ({ ...col, tasks: [...col.tasks] }));
      let movedTask = null;

      // Remove task from old column
      newBoard.forEach(col => {
        const taskIndex = col.tasks.findIndex(task => task.id === taskId);
        if (taskIndex > -1) {
          movedTask = col.tasks[taskIndex];
          col.tasks = col.tasks.filter((_, idx) => idx !== taskIndex);
        }
      });

      // Add task to new column
      if (movedTask) {
        const targetColumn = newBoard.find(col => col.id === newColumnId);
        if (targetColumn) {
          targetColumn.tasks.push(movedTask);
        }
      }

      return { ...old, data: newBoard };
    });

    // Perform actual update
    updateTaskMutation.mutate({ taskId, newColumnId });
  };

  // Find active task for drag overlay
  const draggingTask = board
    ?.flatMap(col => col.tasks)
    .find(task => task.id === draggingTaskId);

  const activeColumn = board?.find(col =>
    col.tasks.some(task => task.id === draggingTaskId)
  );

  if (isLoadingBoard) return <BoardColumnsSkeleton />;

  return (
    <>
      <DndProvider
        setDraggingTaskId={setDraggingTaskId}
        afterDragEnd={afterDragEnd}
      >
        <div
          className="flex gap-3 w-full min-h-screen overflow-x-auto p-0.5"
          style={{ alignItems: 'flex-start' }}
        >
          {board?.map(column => (
            <Column
              key={column.id}
              column={column}
              onTaskClick={taskId => setSelectedTaskId(taskId)}
              sortBy={sortBy || 'default'}
              filterByAssignee={filterByAssignee || 'all'}
            />
          ))}
        </div>

        <DragOverlay>
          {draggingTask && activeColumn ? (
            <BoardTaskBase
              task={draggingTask}
              isDragging={false}
              columnName={activeColumn.name}
            />
          ) : null}
        </DragOverlay>
      </DndProvider>
      {!!selectedTaskId && (
        <TaskDetailModal
          task={selectedTask || undefined}
          isLoading={isLoadingSelectedTask}
          open={!!selectedTaskId}
          onOpenChange={open => {
            if (!open) {
              setSelectedTaskId(null);
            }
          }}
          onTaskSelect={taskId => setSelectedTaskId(taskId)}
        />
      )}
    </>
  );
}
