import TaskKeyBadge from '@/components/TaskKeyBadge';
import Tiptap from '@/components/Tiptap/Tiptap';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AvatarGroup, { getInitials } from '@/components/ui/avatar-group';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useLookup from '@/hooks/useLookup';
import type { BoardColumn } from '@/lib/types/projectTypes';
import { apiBase } from '@/lib/api';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { format, formatDate } from 'date-fns';
import {
  CalendarIcon,
  Check,
  UserPlus,
  ChevronsUpDown,
  Pencil,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  key: string;
  dueDate: string | null;
  createdAt: string;
  assignees: Array<{
    id: string;
    name: string;
    image: string | null;
  }>;
  status: {
    id: string;
    name: string;
    color: string | null;
  };
  type?: 'TASK' | 'STORY';
  parentId?: string | null;
  children?: Array<{
    id: string;
    title: string;
    key: string;
    status: {
      id: string;
      name: string;
      color: string | null;
    };
    assignees: Array<{
      id: string;
      name: string;
      image: string | null;
    }>;
  }>;
  parent?: {
    id: string;
    title: string;
    key: string;
  };
};

type TaskDetailModalProps = {
  task?: TaskDetail;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskSelect?: (taskId: string) => void;
};

export function TaskDetailModal({
  task,
  isLoading,
  open,
  onOpenChange,
  onTaskSelect,
}: TaskDetailModalProps) {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAssigneesOpen, setIsAssigneesOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [isParentStoryOpen, setIsParentStoryOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');

  // Fetch task statuses and project members
  const [taskStatuses] = useLookup('taskStatuses');
  const [projectMembers] = useLookup('projectMembers');

  // Fetch board data to get stories
  const { data: board } = useQuery({
    queryKey: ['projects', projectId, 'board'],
    queryFn: async () => {
      const res = await apiBase.get<BoardColumn[]>(
        `/projects/${projectId}/board`
      );
      return res;
    },
    select: (res: any) => res.data,
    enabled: !!projectId && open,
  });

  const stories = useMemo(() => {
    if (!board) return [];
    // Only include STORIES to be used as parents, excluding self
    return board
      .flatMap(c => c.tasks)
      .filter(t => t.type === 'STORY' && t.id !== task?.id)
      .map(s => ({
        id: s.id,
        title: s.title,
        key: s.key,
      }));
  }, [board, task?.id]);

  // Mutation to create subtask
  const createSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      return await apiBase.post(`/projects/${projectId}/tasks`, {
        title,
        parentId: task?.id,
        type: 'TASK',
      });
    },
    onSuccess: () => {
      setSubtaskTitle('');
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId, task?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'board'],
      });
    },
  });

  // Mutation to update task
  const updateTaskMutation = useMutation({
    mutationFn: async (payload: {
      title?: string;
      description?: string;
      statusId?: string;
      dueDate?: string | null;
      assigneeIds?: string[];
      parentId?: string | null;
    }) => {
      return await apiBase.patch(
        `/projects/${projectId}/tasks/${task?.id}`,
        payload
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId, task?.id],
      });
      // Invalidate old parent if exists
      if (task?.parentId) {
        queryClient.invalidateQueries({
          queryKey: ['tasks', projectId, task.parentId],
        });
      }
      // Invalidate new parent if assigned
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ['tasks', projectId, variables.parentId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'board'],
      });
    },
  });

  const saveFieldChange = (
    field: 'title' | 'description' | 'statusId' | 'dueDate' | 'parentId',
    value: string | null
  ) => {
    const taskValues: any = {
      title: task?.title,
      description: task?.description,
      statusId: task?.status?.id,
      dueDate: task?.dueDate,
      parentId: task?.parentId,
    };

    if (taskValues[field] !== value) {
      updateTaskMutation.mutate({ [field]: value });
    }
  };

  const handleDueDateChange = (date: Date | undefined) => {
    if (!date) return;
    saveFieldChange('dueDate', formatDate(date, 'yyyy-MM-dd'));
    setIsCalendarOpen(false);
  };

  // Get currently assigned user IDs
  const assignedUserIds = task?.assignees.map(a => a.id) || [];

  // Handle assignee toggle
  const handleAssigneeToggle = (userId: string, checked: boolean) => {
    if (!task) return;

    const currentIds = assignedUserIds;
    let newIds: string[];

    if (checked) {
      // Add user
      newIds = [...currentIds, userId];
    } else {
      // Remove user
      newIds = currentIds.filter(id => id !== userId);
    }

    updateTaskMutation.mutate({ assigneeIds: newIds });
  };

  // Parse due date - handle both date string and Date object
  const dueDate = task?.dueDate ? new Date(task.dueDate) : undefined;

  if (!task && !isLoading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-1 rounded-xl" backdrop="overlay">
        <DialogHeader>
          <div className="flex flex-col gap-2 items-start py-2">
            {task?.parent && (
              <div
                role="button"
                className="flex items-center gap-2 mb-1 px-1.5 py-1 -ml-1.5 text-xs text-fg-secondary hover:text-fg-primary hover:bg-fill2 rounded-md cursor-pointer transition-colors"
                onClick={() => onTaskSelect?.(task.parent!.id)}
              >
                <TaskKeyBadge taskKey={task.parent.key} />
                <span className="text-fg-tertiary">/</span>
                <span className="font-medium truncate max-w-[300px]">
                  {task.parent.title}
                </span>
              </div>
            )}
            <DialogTitle className="flex items-center gap-2">
              <TaskKeyBadge taskKey={task?.key} />
            </DialogTitle>
          </div>
        </DialogHeader>
        <DialogBody className="max-h-[80vh] min-h-[400px] overflow-auto no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-fg-secondary">Loading task details...</p>
            </div>
          ) : task ? (
            <div className="flex flex-col gap-2">
              {/* Title */}
              <div className="flex flex-col gap-2">
                {isEditingTitle ? (
                  <div className="flex gap-2">
                    <Input
                      defaultValue={task.title}
                      onBlur={e => {
                        saveFieldChange('title', e.target.value);
                        setIsEditingTitle(false);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          saveFieldChange('title', e.currentTarget.value);
                          setIsEditingTitle(false);
                        }
                      }}
                      autoFocus
                      className="text-lg font-semibold"
                    />
                  </div>
                ) : (
                  <h2
                    className="py-1 text-lg font-semibold rounded-md text-fg-primary cursor-text"
                    onClick={() => {
                      setIsEditingTitle(true);
                    }}
                  >
                    {task.title}
                  </h2>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 ">
                {/* Status */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase text-fg-secondary">
                    Status
                  </label>
                  <Select
                    value={task.status.id}
                    onValueChange={value => saveFieldChange('statusId', value)}
                  >
                    <SelectTrigger size="28">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {task.status.color && (
                            <div
                              className="rounded-full size-3"
                              style={{ backgroundColor: task.status.color }}
                            />
                          )}
                          {task.status.name}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {taskStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            {status.color && (
                              <div
                                className="rounded-full size-3"
                                style={{ backgroundColor: status.color }}
                              />
                            )}
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase text-fg-secondary">
                    Due Date
                  </label>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        size="28"
                        variant="outline"
                        color="neutral"
                        className="justify-start w-full gap-2"
                      >
                        <CalendarIcon className="size-4" />
                        {dueDate ? (
                          format(dueDate, 'PPP')
                        ) : (
                          <span className="text-fg-tertiary">Set due date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={handleDueDateChange}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Assignees */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium uppercase text-fg-secondary">
                    Assignees
                  </label>
                  <div className="flex flex-col gap-2">
                    <Popover
                      open={isAssigneesOpen}
                      onOpenChange={setIsAssigneesOpen}
                    >
                      <PopoverTrigger asChild>
                        {assignedUserIds.length > 0 ? (
                          <div className="rounded-md cursor-pointer hover:bg-fill2">
                            <AvatarGroup
                              avatars={task.assignees}
                              className="text-xs"
                            />
                          </div>
                        ) : (
                          <Button
                            size="28"
                            variant="outline"
                            color="neutral"
                            className="justify-start w-full gap-2"
                          >
                            <UserPlus className="size-4" />
                            Assign
                          </Button>
                        )}
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-64 p-0 z-1000"
                        align="start"
                        side="bottom"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search members..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>No members found.</CommandEmpty>
                            <CommandGroup>
                              {projectMembers.map(member => {
                                const isAssigned = assignedUserIds.includes(
                                  member.value
                                );
                                return (
                                  <CommandItem
                                    key={member.value}
                                    value={member.label}
                                    onSelect={() =>
                                      handleAssigneeToggle(
                                        member.value,
                                        !isAssigned
                                      )
                                    }
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Avatar size="24">
                                      <AvatarImage
                                        src={member.image || undefined}
                                      />
                                      <AvatarFallback>
                                        {getInitials(member.label)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1 text-sm text-fg-secondary">
                                      {member.label}
                                    </span>
                                    {isAssigned && (
                                      <Check className="size-4 text-success" />
                                    )}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Parent Story (for TASKS) */}
                {task.type === 'TASK' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium uppercase text-fg-secondary">
                      Parent Story
                    </label>
                    <Popover
                      open={isParentStoryOpen}
                      onOpenChange={setIsParentStoryOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          size="28"
                          variant="outline"
                          color="neutral"
                          className="justify-between w-full gap-2 px-2 font-normal"
                        >
                          <div className="flex items-center gap-2 truncate text-ellipsis overflow-hidden">
                            {task.parent ? (
                              <>
                                <TaskKeyBadge taskKey={task.parent.key} />
                                <span className="truncate">
                                  {task.parent.title}
                                </span>
                              </>
                            ) : (
                              <span className="text-fg-tertiary">
                                Select Story
                              </span>
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search stories..." />
                          <CommandList>
                            <CommandEmpty>No stories found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="none"
                                onSelect={() => {
                                  saveFieldChange('parentId', null);
                                  setIsParentStoryOpen(false);
                                }}
                                className="text-fg-secondary cursor-pointer"
                              >
                                No Parent
                              </CommandItem>
                              {stories.map(story => (
                                <CommandItem
                                  key={story.id}
                                  value={story.id + ' ' + story.title}
                                  onSelect={() => {
                                    saveFieldChange('parentId', story.id);
                                    setIsParentStoryOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 w-full overflow-hidden">
                                    <Check
                                      className={`mr-2 size-4 shrink-0 ${
                                        task.parent?.id === story.id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      }`}
                                    />
                                    <div className="flex flex-col truncate">
                                      <span className="font-medium truncate">
                                        {story.title}
                                      </span>
                                      <span className="text-xs text-fg-secondary">
                                        {story.key}
                                      </span>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 mt-2 group/desc">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-fg-secondary">
                    Description
                  </h3>
                  {!isEditingDescription && (
                    <Button
                      variant="ghost"
                      size="28"
                      className="h-6 px-2 text-xs text-fg-secondary hover:text-fg-primary opacity-0 group-hover/desc:opacity-100 transition-opacity"
                      onClick={() => {
                        setDraftDescription(task.description || '');
                        setIsEditingDescription(true);
                      }}
                    >
                      <Pencil className="size-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingDescription ? (
                  <div className="flex flex-col gap-2">
                    <Tiptap
                      placeholder="Add a description..."
                      content={draftDescription} // Use draft state
                      onUpdate={({ editor }) => {
                        setDraftDescription(editor.getHTML());
                      }}
                      classNames="min-h-[120px] p-3 rounded-md border border-primary focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditingDescription(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          saveFieldChange('description', draftDescription);
                          setIsEditingDescription(false);
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'prose prose-sm dark:prose-invert max-w-none p-0 border border-transparent rounded-md min-h-[40px] text-fg-primary cursor-text hover:bg-fill2/50 transition-colors prose-p:my-0 prose-li:my-1 prose-headings:my-1',
                      !task.description && 'text-fg-tertiary italic'
                    )}
                    onClick={() => {
                      // Click to edit logic removed as requested ("accidental clicks")
                      // But usually user wants click to edit if empty?
                      // User said "annoying". So I will disable click to edit
                      // EXCEPT if no description?
                      // I'll stick to Edit button.
                      // But if empty, edit button might be subtle.
                      // I'll add "Click to add description" placeholder behavior if empty?
                      if (!task.description) {
                        setDraftDescription('');
                        setIsEditingDescription(true);
                      }
                    }}
                  >
                    {task.description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: task.description,
                        }}
                      />
                    ) : (
                      'No description provided. Click to add.'
                    )}
                  </div>
                )}
              </div>

              {/* Subtasks (for Stories) */}
              {task.type === 'STORY' && (
                <div className="flex flex-col gap-2 mt-4">
                  <h3 className="text-sm font-medium text-fg-secondary">
                    Subtasks
                  </h3>
                  <div className="flex flex-col gap-2">
                    {task.children?.map(child => (
                      <div
                        key={child.id}
                        onClick={() => onTaskSelect?.(child.id)}
                        className="flex items-center justify-between p-2 border rounded-lg bg-surface hover:bg-fill2 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <TaskKeyBadge taskKey={child.key} />
                          <span className="text-sm font-medium text-fg-primary">
                            {child.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {child.assignees.map(a => (
                              <Avatar
                                key={a.id}
                                size="20"
                                className="border-bg"
                              >
                                {a.image && <AvatarImage src={a.image} />}
                                <AvatarFallback>
                                  {getInitials(a.name)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-fill2">
                            {child.status.color && (
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: child.status.color }}
                              />
                            )}
                            <span className="text-xs font-medium text-fg-secondary">
                              {child.status.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add a subtask..."
                      value={subtaskTitle}
                      onChange={e => setSubtaskTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && subtaskTitle.trim()) {
                          createSubtaskMutation.mutate(subtaskTitle);
                        }
                      }}
                    />
                    <Button
                      disabled={
                        !subtaskTitle.trim() || createSubtaskMutation.isPending
                      }
                      onClick={() => createSubtaskMutation.mutate(subtaskTitle)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
