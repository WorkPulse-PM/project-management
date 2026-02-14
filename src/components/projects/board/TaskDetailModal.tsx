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
import { apiBase } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDate } from 'date-fns';
import { CalendarIcon, Check, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

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
};

type TaskDetailModalProps = {
  task?: TaskDetail;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailModal({
  task,
  isLoading,
  open,
  onOpenChange,
}: TaskDetailModalProps) {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAssigneesOpen, setIsAssigneesOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Fetch task statuses and project members
  const [taskStatuses] = useLookup('taskStatuses');
  const [projectMembers] = useLookup('projectMembers');

  // Mutation to update task
  const updateTaskMutation = useMutation({
    mutationFn: async (payload: {
      title?: string;
      description?: string;
      statusId?: string;
      dueDate?: string | null;
      assigneeIds?: string[];
    }) => {
      return await apiBase.patch(
        `/projects/${projectId}/tasks/${task?.id}`,
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId, task?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'board'],
      });
    },
  });

  const saveFieldChange = (
    field: 'title' | 'description' | 'statusId' | 'dueDate',
    value: string
  ) => {
    const taskValues = {
      title: task?.title,
      description: task?.description,
      statusId: task?.status?.id,
      dueDate: task?.dueDate,
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
          <DialogTitle className="flex items-center gap-2">
            <TaskKeyBadge taskKey={task?.key} />
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="max-h-[90vh] min-h-[400px] overflow-auto no-scrollbar">
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
                            <AvatarGroup avatars={task.assignees} />
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
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 mt-2 ">
                <h3 className="text-sm font-medium text-fg-secondary">
                  Description
                </h3>

                <Tiptap
                  placeholder="Add a description..."
                  content={task.description}
                  onBlur={({ editor }) =>
                    saveFieldChange('description', editor.getHTML())
                  }
                />
              </div>
            </div>
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
