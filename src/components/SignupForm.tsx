import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, InputWrapper } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { type UseFormReturn } from 'react-hook-form';
import { type SignupFormValues } from '@/hooks/useSignup';
import React from 'react';

type Props = {
  form: UseFormReturn<SignupFormValues>;
  email?: string;
  isLoading: boolean;
  showPassword: boolean;
  togglePasswordVisibility: (e: React.MouseEvent) => void;
  IconComponent: any;
  isUsernameAvailable: boolean | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (payload: SignupFormValues) => Promise<void>;
};

export function SignupForm({
  email,
  form,
  isLoading,
  showPassword,
  togglePasswordVisibility,
  IconComponent,
  isUsernameAvailable,
  inputRef,
  onSubmit,
}: Props) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex gap-5 flex-col">
          <div className="flex gap-4 flex-col">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input size="36" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input size="36" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                  {!errors.username && isUsernameAvailable && (
                    <p className="text-green-600 text-xs">
                      Username is available
                    </p>
                  )}
                </FormItem>
              )}
            />
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
                      value={email || field.value}
                      disabled={Boolean(email)}
                      readOnly={Boolean(email)}
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
                    <InputWrapper>
                      <Input
                        {...field}
                        id="toggle-visible-password"
                        ref={inputRef}
                        className="peer"
                        type={showPassword ? 'text' : 'password'}
                      />
                      <IconComponent
                        className="hover:text-fg peer-disabled:text-fg-disabled cursor-pointer peer-disabled:pointer-events-none"
                        onMouseDown={togglePasswordVisibility}
                      />
                    </InputWrapper>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4 flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner variant="default" /> : 'Create account'}
            </Button>
            <p className="text-fg-secondary text-[13px]">
              By signing up, you agree to Radian&apos;s{' '}
              <Button variant="link" className=" text-[13px]" color="primary">
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button variant="link" className=" text-[13px]" color="primary">
                Privacy Policy
              </Button>
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default SignupForm;
