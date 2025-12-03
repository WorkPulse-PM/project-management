import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@/components/ui/alert';
import type { Invitation } from '@/lib/types/invitationTypes';
import { cn } from '@/lib/utils';
import { PartyPopper } from 'lucide-react';

type InvitationBannerProps = {
  show: boolean;
  mode: 'signup' | 'signin';
  invitation?: Invitation;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  className?: string;
};

export function InvitationBanner({
  show,
  mode,
  invitation,
  isLoading,
  isError,
  errorMessage,
  className,
}: InvitationBannerProps) {
  if (!show) {
    return null;
  }

  const projectName = invitation?.project?.name;
  const inviterName = invitation?.invitedByUser?.name;

  const descriptionByMode =
    mode === 'signup'
      ? 'Complete the form below to join the workspace.'
      : 'Sign in below to jump right into the project.';

  return (
    <Alert
      color="primary"
      variant="soft-outline"
      className={cn(
        'flex flex-col sm:flex-row sm:items-center gap-3 border border-primary-border bg-primary-accent/30',
        className
      )}
    >
      <AlertIcon>
        <PartyPopper className="size-6 text-primary" />
      </AlertIcon>
      <AlertContent>
        <AlertTitle>
          {isLoading
            ? 'We are confirming your invitation...'
            : invitation
              ? `You’re invited to join ${projectName}!`
              : 'We have some issues with your invitation'}
        </AlertTitle>
        <AlertDescription>
          {isLoading && 'Hang tight for just a moment.'}
          {!isLoading && invitation && (
            <>
              {inviterName
                ? `${inviterName} is excited to bring you on board. `
                : 'A teammate is excited to bring you on board. '}
              {descriptionByMode}
            </>
          )}
          {!isLoading && !invitation && isError && (
            <>{errorMessage || 'Please double-check your invite link.'}</>
          )}
        </AlertDescription>
      </AlertContent>
    </Alert>
  );
}
