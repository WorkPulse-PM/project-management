import Logo from '@/components/Logo';
import { InvitationBanner } from '@/components/auth/InvitationBanner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useInvitationDetails } from '@/hooks/useInvitationDetails';
import { authClient } from '@/lib/authClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const FormSchema = z
  .object({
    email: z.string(),
    password: z.string(),
    rememberMe: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // Validate email first
    if (!data.email || data.email.trim().length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email is required',
        path: ['email'],
      });
      return; // Stop here
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a valid email address',
        path: ['email'],
      });
      return; // Stop here - don't validate password
    }

    // Only validate password if email is valid
    if (!data.password || data.password.trim().length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password is required',
        path: ['password'],
      });
    }
  });

export function SigninPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');

  const {
    invitation,
    isInvitationError,
    isInvitationLoading,
    invitationErrorMessage,
  } = useInvitationDetails(inviteToken);

  const inviteEmail = invitation?.email;
  const email = searchParams.get('email') || inviteEmail || '';

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email,
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (email) {
      form.setValue('email', email);
    }
  }, [form, email]);

  const isInviteFlow = Boolean(inviteToken);
  const onSubmit = async (payload: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      const { error } = await authClient.signIn.email(payload);

      if (error) {
        toast.error(
          error.message || "We couldn't sign you in. Please try again."
        );
        return;
      }

      navigate('/', {
        replace: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-bg">
      <div className="flex w-full min-h-screen justify-center items-center flex-1 p-5 bg-bg">
        <div className="w-100 flex flex-col gap-8">
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <Logo />
            </div>
            <div className="flex gap-2 flex-col">
              <h1 className="heading-5">Sign In</h1>
              <p className="text-fg-secondary text-sm">
                Don&apos;t have an account?{' '}
                <Button asChild variant="link" color="primary">
                  <Link to="/auth/signup">Sign up</Link>
                </Button>
              </p>
            </div>
            <InvitationBanner
              show={isInviteFlow}
              mode="signin"
              invitation={invitation}
              isLoading={isInvitationLoading}
              isError={isInvitationError}
              errorMessage={invitationErrorMessage}
            />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-5 flex-col">
                <div className="flex gap-4 flex-col">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            size="36"
                            type="email"
                            {...field}
                            value={
                              isInviteFlow && !isInvitationError
                                ? inviteEmail
                                : field.value
                            }
                            disabled={isInviteFlow && !isInvitationError}
                            readOnly={isInviteFlow && !isInvitationError}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input size="36" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            id="remember-me"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="remember-me"
                          className="font-normal text-fg-secondary"
                        >
                          Remember me
                        </FormLabel>
                      </div>
                    )}
                  />
                  <Button asChild variant="link" color="primary">
                    <Link to="/auth/forgot-password">Forgot Password?</Link>
                  </Button>
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner variant="default" /> : 'Sign In'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
