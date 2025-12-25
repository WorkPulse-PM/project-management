import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import useInvitationActions from '@/hooks/useInvitationActions';
import useLookup from '@/hooks/useLookup';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const FormSchema = z.object({
  email: z.email().nonempty('Email is required'),
  role: z.string().nonempty('Role is required'),
});

type InviteMemberFormValues = z.infer<typeof FormSchema>;

export default function InviteMemberModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [roles] = useLookup('projectRoles');

  const { inviteMutation } = useInvitationActions();
  const { mutateAsync, isPending } = inviteMutation;

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(FormSchema),
    disabled: isPending,
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: '',
    },
  });

  const onSubmit = async (values: InviteMemberFormValues) => {
    await mutateAsync({
      email: values.email,
      roleId: values.role,
    });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <div className="flex gap-3">
                <div className="flex items-center justify-start p-3 border rounded-full border-soft-alpha size-fit">
                  <UserPlus className="text-fg2 size-5" />
                </div>
                <div>
                  <DialogTitle>Invite</DialogTitle>
                  <DialogDescription>
                    Invite new users to join your project
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <DialogBody className="pb-4">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs text-fg-secondary">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="colleague@company.com"
                          {...field}
                        />
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose role" />
                          </SelectTrigger>

                          <SelectContent className="z-10000">
                            {roles.map(role => (
                              <SelectItem key={role.value} value={role.value}>
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
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button color="neutral" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="ml-auto"
                loading={isPending}
                disabled={isPending}
              >
                {isPending ? 'Inviting...' : 'Send Invite'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
