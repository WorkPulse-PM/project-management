import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Divider } from '@/components/ui/divider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { apiBase } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Tiptap from '../Tiptap/Tiptap';

export const FormSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required'),
  description: z.string().optional(),
  dueDate: z.date().refine(date => date !== undefined, {
    message: 'Due date is required',
  }),
});

export type CreateTaskFormValues = z.infer<typeof FormSchema>;

const CreateTaskForm = ({
  projectId,
  onSuccess,
}: {
  projectId: string;
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const createTaskMutation = useMutation({
    mutationFn: async (values: CreateTaskFormValues) => {
      const payload = {
        ...values,
        dueDate: values.dueDate.toISOString(),
      };
      return await apiBase.post(`/projects/${projectId}/tasks`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'board'],
      });
      form.reset();
      onSuccess?.();
    },
    onError: error => {
      console.error('Failed to create task:', error);
    },
  });

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(FormSchema),
    disabled: createTaskMutation.isPending,
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      dueDate: undefined,
    },
  });

  const handleSubmit = async (values: CreateTaskFormValues) => {
    await createTaskMutation.mutateAsync(values);
  };

  return (
    <div className="w-full">
      <div className="gap-6 p-4 mx-auto">
        <h2 className="text-2xl font-bold text-fg">Create New Task</h2>
        <Divider className="my-4" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          size="36"
                          type="text"
                          {...field}
                          placeholder="e.g. Design landing page"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Tiptap
                          onUpdate={({ editor }) =>
                            field.onChange(editor.getHTML())
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <Popover
                        open={isCalendarOpen}
                        onOpenChange={setIsCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              color="neutral"
                              className="justify-start w-full gap-2 text-fg hover:bg-elevation-level1"
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span className="text-sm font-normal text-fg-tertiary">
                                  Pick a date
                                </span>
                              )}
                              <CalendarIcon className="ml-auto text-fg-tertiary size-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-full p-0 z-999"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            className="border-0"
                            selected={field.value}
                            onSelect={value => {
                              field.onChange(value);
                              setIsCalendarOpen(false);
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                className="w-full"
                type="submit"
                loading={createTaskMutation.isPending}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateTaskForm;
