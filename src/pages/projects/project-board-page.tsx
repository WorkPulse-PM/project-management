import AvatarGroup from '@/components/ui/avatar-group';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Button, IconButton } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { apiBase } from '@/lib/api';
import type { BoardColumn, Project } from '@/lib/types/projectTypes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EllipsisVertical, PlusIcon, UserRoundPlusIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import CreateTaskForm from '@/components/projects/CreateTaskForm';

export default function ProjectBoardPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  const { data: project, isPending: isLoadingProject } = useQuery({
    enabled: !!projectId,
    select: res => res.data,
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const data = await apiBase.get<Project>(`/projects/${projectId}`);
      return data;
    },
  });

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

  const handleDragStart = event => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = event => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    const newColumnId = over.id;

    // Find the task's current column
    const currentColumn = board?.find(col =>
      col.tasks.some(task => task.id === taskId)
    );

    // If dropped in the same column, do nothing
    if (currentColumn?.id === newColumnId) return;

    // Optimistic update
    queryClient.setQueryData(['projects', projectId, 'board'], (old: any) => {
      if (!old?.data) return old;

      const newBoard = old.data.map(col => ({ ...col }));
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

  const handleDragCancel = () => {
    setActiveId(null);
  };

  console.log(board);

  if (isLoadingProject || isLoadingBoard) return <Spinner />;

  const boardColors = {
    Backlog: 'bg-error-accent',
    'In Progress': 'bg-info-accent',
    Review: 'bg-primary-accent',
    Testing: 'bg-fill1',
    Done: 'bg-success-accent',
  };

  const menuColors = {
    Backlog: 'error',
    'In Progress': 'info',
    Review: 'primary',
    Testing: 'neutral',
    Done: 'success',
  };

  const ticketColors = {
    Backlog: 'bg-error-focus',
    'In Progress': 'bg-info-focus',
    Review: 'bg-primary-focus',
    Testing: 'bg-soft',
    Done: 'bg-success-focus',
  };

  function getBoardColor(name: string) {
    return boardColors[name] || 'bg-fill1';
  }

  function getMenuColors(
    name: string
  ): 'error' | 'info' | 'warning' | 'neutral' | 'success' | 'primary' {
    return (
      (menuColors[name as keyof typeof menuColors] as
        | 'error'
        | 'info'
        | 'warning'
        | 'neutral'
        | 'success'
        | 'primary') || 'neutral'
    );
  }

  function getTicketColor(name: string) {
    return ticketColors[name] || 'bg-fill2';
  }

  // Find active task for drag overlay
  const activeTask = board
    ?.flatMap(col => col.tasks)
    .find(task => task.id === activeId);

  const activeColumn = board?.find(col =>
    col.tasks.some(task => task.id === activeId)
  );

  const ringColors = {
    error: 'ring-error',
    info: 'ring-info',
    primary: 'ring-primary',
    neutral: 'ring-neutral',
    success: 'ring-success',
    warning: 'ring-warning',
  };

  const getRingColor = (name: string) => {
    const colorKey = getMenuColors(name);
    return ringColors[colorKey] || 'ring-neutral';
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-fg">{project?.name}</h2>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              {project?.members && (
                <AvatarGroup size="40" avatars={project.members} />
              )}
              <IconButton
                size={'32'}
                className="rounded-full"
                variant={'outline'}
                color="neutral"
              >
                <UserRoundPlusIcon size={25} />
              </IconButton>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button color="info" variant="glossy">
                  <PlusIcon />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent backdrop="overlay">
                <CreateTaskForm projectId={projectId!} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-3" style={{ alignItems: 'flex-start' }}>
          {board?.map(column => (
            <DroppableColumn
              key={column.id}
              column={column}
              getBoardColor={getBoardColor}
              getMenuColors={getMenuColors}
              getTicketColor={getTicketColor}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay for better UX */}
      <DragOverlay>
        {activeTask && activeColumn ? (
          <div
            className={`${getTicketColor(activeColumn.name)} rounded-xl p-3 w-68 flex flex-col gap-1 shadow-lg opacity-90 cursor-grabbing ring-2 ${getRingColor(activeColumn.name)}`}
          >
            <h3 className="text-sm">{activeTask.title}</h3>
            <p className="text-sm text-fg-secondary font-medium">
              {format(parseISO(activeTask.dueDate), 'PPP')}
            </p>
            <Badge color={getMenuColors(activeColumn.name)} variant="soft">
              {activeTask.status.name}
            </Badge>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Droppable Column Component
function DroppableColumn({
  column,
  getBoardColor,
  getMenuColors,
  getTicketColor,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const ringColors = {
    error: 'ring-error',
    info: 'ring-info',
    primary: 'ring-primary',
    neutral: 'ring-neutral',
    success: 'ring-success',
    warning: 'ring-warning',
  };

  const getRingColor = (name: string) => {
    const colorKey = getMenuColors(name);
    return ringColors[colorKey] || 'ring-neutral';
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-w-68 self-start rounded-xl flex flex-col gap-3 p-2 ${getBoardColor(column.name)} ${
        isOver ? `ring-2 ${getRingColor(column.name)}` : ''
      } transition-all`}
    >
      <section className="flex items-center justify-between">
        <h2 className="text-base font-medium truncate text-black-inverse px-3">
          {column.name}
        </h2>
        <IconButton
          size="28"
          color={getMenuColors(column.name)}
          variant="ghost"
        >
          <EllipsisVertical />
        </IconButton>
      </section>

      <div className="flex flex-col gap-3">
        {column.tasks.map(task => (
          <DraggableTask
            key={task.id}
            task={task}
            columnName={column.name}
            getTicketColor={getTicketColor}
            getMenuColors={getMenuColors}
          />
        ))}
      </div>
    </div>
  );
}

// Draggable Task Component
function DraggableTask({ task, columnName, getTicketColor, getMenuColors }) {
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
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${getTicketColor(columnName)} rounded-xl p-3 w-full flex flex-col gap-1 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } transition-opacity`}
    >
      <h3 className="text-sm">{task.title}</h3>
      <p className="text-sm text-fg-secondary font-medium">
        {format(parseISO(task.dueDate), 'PPP')}
      </p>
      <Badge color={getMenuColors(columnName)} variant="soft">
        {task.status.name}
      </Badge>
    </div>
  );
}
