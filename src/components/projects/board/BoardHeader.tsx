import CreateTaskForm from '@/components/projects/CreateTaskForm';
import BoardHeaderSkeleton from '@/components/skeletons/BoardHeaderSkeleton';
import AvatarGroup from '@/components/ui/avatar-group';
import { BadgeDot } from '@/components/ui/badge';
import { Button, IconButton } from '@/components/ui/button';
import { CommandDialog, CommandInput } from '@/components/ui/command';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiBase } from '@/lib/api';
import type { BoardColumn, Project } from '@/lib/types/projectTypes';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, SearchIcon, UserRoundPlusIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function BoardHeader() {
  const { projectId } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useQueryState('task');
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const { data: project, isPending: isLoadingProject } = useQuery({
    enabled: !!projectId,
    select: res => res.data,
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const data = await apiBase.get<Project>(`/projects/${projectId}`);
      return data;
    },
  });

  // Fetch board data for search
  const { data: board } = useQuery({
    enabled: !!projectId && searchOpen,
    select: res => res.data,
    queryKey: ['projects', projectId, 'board'],
    queryFn: async () => {
      const data = await apiBase.get<BoardColumn[]>(
        `/projects/${projectId}/board`
      );
      return data;
    },
  });

  // Flatten all tasks from all columns
  const allTasks = useMemo(() => {
    if (!board) return [];
    return board.flatMap(column =>
      column.tasks.map(task => ({
        ...task,
        columnName: column.name,
        columnId: column.id,
        priority: (task as any).priority,
        description: (task as any).description,
      }))
    );
  }, [board]);

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return allTasks;
    const query = searchQuery.toLowerCase();
    return allTasks.filter(
      task =>
        task.key.toLowerCase().includes(query) ||
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    );
  }, [allTasks, searchQuery]);

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    return filteredTasks.reduce(
      (acc, task) => {
        if (!acc[task.columnName]) {
          acc[task.columnName] = [];
        }
        acc[task.columnName].push(task);
        return acc;
      },
      {} as Record<string, typeof filteredTasks>
    );
  }, [filteredTasks]);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSearchOpen(false);
  };

  if (isLoadingProject) return <BoardHeaderSkeleton />;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg">{project?.name}</h2>
        <div className="flex gap-4">
          <Button
            variant="outline"
            color="neutral"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
            Search
            <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

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

          <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-4xl max-h-[90vh] overflow-y-auto gap-1 rounded-xl"
              backdrop="overlay"
            >
              <CreateTaskForm
                projectId={projectId!}
                onSuccess={() => setCreateTaskOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task Search Command Dialog */}
      <CommandDialog
        open={searchOpen}
        onOpenChange={handleOpenChange}
        title="Search Tasks"
        description="Search for tasks across all columns"
      >
        <CommandInput
          placeholder="Search tasks by key, title, or description..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <ScrollArea className="h-[450px] px-1">
          <div className="p-2">
            {filteredTasks.length === 0 ? (
              <div className="py-6 text-center text-sm text-fg-tertiary">
                No tasks found.
              </div>
            ) : (
              Object.entries(tasksByColumn).map(([columnName, tasks]) => (
                <div key={columnName} className="mb-4 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-medium text-fg-secondary">
                    {columnName}
                  </div>
                  <div className="space-y-1">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskSelect(task.id)}
                        className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-2 text-sm outline-none hover:bg-fill2-alpha transition-colors"
                      >
                        <BadgeDot
                          className={cn(
                            'shrink-0',
                            task.columnName === 'Backlog' && 'bg-error-text',
                            task.columnName === 'In Progress' && 'bg-info-text',
                            task.columnName === 'Review' && 'bg-warning',
                            task.columnName === 'Testing' && 'bg-fill4',
                            task.columnName === 'Done' && 'bg-success-text'
                          )}
                        />
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-fg-tertiary shrink-0">
                              {task.key}
                            </span>
                            <span className="font-medium truncate">
                              {task.title}
                            </span>
                          </div>
                          {task.description && (
                            <span className="text-xs text-fg-tertiary line-clamp-1">
                              {task.description}
                            </span>
                          )}
                        </div>
                        {(task as any).priority && (
                          <span className="text-xs text-fg-tertiary ml-auto shrink-0">
                            {(task as any).priority}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CommandDialog>
    </>
  );
}
