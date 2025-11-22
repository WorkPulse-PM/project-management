import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Divider } from '@/components/ui/divider';
import { Spinner } from '@/components/ui/spinner';
import { GmailIcon } from '@/components/GmailIcon';
import { OutlookIcon } from '@/components/OutlookIcon';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';
import { authClient } from '@/lib/authClient';
import { toast } from 'sonner';

const FormSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export function ResetpasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (payload: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      const { error } = await authClient.requestPasswordReset({
        email: payload.email,
      });
      if (error) {
        toast.error(
          error.message ||
            "Couldn't request a password reset. Please try once again."
        );
        return;
      }

      toast.success('Please check your email for reset password link.');
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-bg px-5">
      <div className="w-100 flex bg-bg">
        <div className="flex-1 flex flex-col gap-8">
          <div>
            <Logo />
          </div>
          <div className="flex gap-2 flex-col">
            <h1 className=" heading-5">Reset password</h1>
            <p className="text-fg-secondary text-sm">
              Enter the email address you registered with and we&apos;ll send
              you the reset instructions
            </p>
          </div>
          <Form {...form}>
            <form
              className=" flex gap-4 flex-col"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex gap-5 flex-col">
                <div className="flex gap-5 flex-col">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input size="36" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Spinner variant="default" />
                  ) : (
                    'Send Reset Instructions'
                  )}
                </Button>
              </div>
              <Divider className=" my-2.5" />

              <div className="flex gap-3">
                <Button
                  asChild
                  variant="outline"
                  color="neutral"
                  className="w-full text-fg-secondary"
                >
                  <Link to="https://mail.google.com" target="_blank">
                    <GmailIcon />
                    Open Gmail
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  color="neutral"
                  className="w-full text-fg-secondary"
                >
                  <Link
                    to="https://outlook.com"
                    className="flex items-center justify-center gap-1.5"
                    target="_blank"
                  >
                    <OutlookIcon />
                    Open Outlook
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
