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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const FormSchema = z.object({
  email: z.email().nonempty(),
  role: z.string().nonempty(),
});

type InviteMemberFormValues = z.infer<typeof FormSchema>;

export default function MembersPage() {
  const [roles] = useLookup('projectRoles');

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: undefined,
    },
  });

  const onSubmit = values => {
    console.log('🚀 ~ onSubmit ~ values:', values);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Project Members</h2>
          <p className="text-sm text-fg-tertiary">
            Manage who has access to this project.
          </p>
        </div>
      </div>

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
                          <SelectItem value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="ml-auto">
              Send Invite
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
