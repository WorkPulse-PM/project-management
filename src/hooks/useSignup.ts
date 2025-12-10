import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { authClient } from '@/lib/authClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

export const FormSchema = z
  .object({
    name: z.string().trim().nonempty('Full name is required'),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters long' })
      .max(20, { message: 'Username must be at most 20 characters long' })
      .regex(/[A-Za-z][A-Za-z0-9_]{2,19}$/, {
        message: 'Username can only contain letters, numbers, and underscores',
      }),
    email: z.string().trim().nonempty('Email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .nonempty('Password is required'),
  })
  .superRefine((data, ctx) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter a valid email address',
        path: ['email'],
      });
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        path: ['password'],
      });
    }
  });

export type SignupFormValues = z.infer<typeof FormSchema>;

export function useSignup() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);

  const inputRef = useRef<HTMLInputElement>(null);

  function togglePasswordVisibility(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  }

  const IconComponent = showPassword ? EyeOffIcon : EyeIcon;

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange',
    disabled: isLoading,
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const username = form.watch('username');
  const debouncedUsername = useDebouncedValue(username);

  const onSubmit = async (payload: SignupFormValues) => {
    try {
      setIsLoading(true);

      const callbackURL =
        import.meta.env.VITE_FRONTEND_URL +
        (inviteToken ? `/invitations/${inviteToken}` : '/');

      const { error } = await authClient.signUp.email({
        ...payload,
        callbackURL,
      });
      if (error) {
        toast.error(error.message || 'Something went wrong! Please try again');
        return;
      }

      form.reset();
      setIsUsernameAvailable(null);
      toast.success(
        'Signup successful. Please check your email for verification.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!debouncedUsername) {
      form.clearErrors('username');
      return;
    }

    if (form.formState.errors.username) {
      return;
    }

    let cancelled = false;

    async function checkUsernameAvailability() {
      setIsUsernameAvailable(null);

      const { data, error } = await authClient.isUsernameAvailable({
        username: debouncedUsername,
      });

      if (error) {
        toast.error(
          error.message ||
            'Something went wrong while checking username availability.'
        );
        return;
      }

      if (cancelled) return;

      if (!data?.available) {
        setIsUsernameAvailable(false);
        form.setError('username', {
          type: 'manual',
          message: "Username is't available",
        });
      } else {
        setIsUsernameAvailable(true);
        form.clearErrors('username');
      }
    }

    checkUsernameAvailability();

    return () => {
      cancelled = true;
    };
  }, [debouncedUsername, form.setError, form.clearErrors]);

  return {
    form,
    isLoading,
    showPassword,
    togglePasswordVisibility,
    IconComponent,
    isUsernameAvailable,
    inputRef,
    onSubmit,
  } as const;
}
