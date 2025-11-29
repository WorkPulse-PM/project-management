import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useLookup from '@/hooks/useLookup';
import { apiBase } from '@/lib/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const FormSchema = z.object({
  email: z.email().nonempty(),
  role: z.string().nonempty(),
});

type InviteMemberFormValues = z.infer<typeof FormSchema>;

export default function InviteMembersForm() {
  const [roles] = useLookup('projectRoles');
  const { projectId } = useParams();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (body: any) => apiBase.post(`/${projectId}/invite`, body),
    onSuccess({ data }) {
      toast.success(data?.message || 'Invitation sent successfully');
    },
  });

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(FormSchema),
    disabled: isPending,
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: undefined,
    },
  });

  const onSubmit = async (values: InviteMemberFormValues) => {
    await mutateAsync({
      email: values.email,
      roleId: values.role,
    });
  };

  return (
    <div className="max-w-md p-4 mb-2 border rounded-md">
      <h3 className="mb-3 text-sm font-semibold">Invite New Member</h3>
      <Form {...form}>
        <form
          className="flex flex-col gap-4 "
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs text-fg-secondary">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input placeholder="colleague@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-fg-secondary">
                  Role
                </FormLabel>

                <FormControl>
                  <Select onValueChange={value => field.onChange(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={'Choose role'} {...field} />
                    </SelectTrigger>

                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="ml-auto"
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? 'Inviting...' : 'Send Invite'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
